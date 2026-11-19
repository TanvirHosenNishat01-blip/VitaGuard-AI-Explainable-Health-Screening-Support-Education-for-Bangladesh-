"""Final dataset audit. Does not write production models, routes, or the database.

Hypotheses and pass rules are fixed in this file before the new fits run.
The locked test is used only to reproduce the published DiaBD and Cleveland scores.
"""
from __future__ import annotations

import hashlib
import importlib.util
import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.base import clone
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import average_precision_score, brier_score_loss, confusion_matrix, recall_score
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
SEED = 42
FEATURES = ["age", "sex", "bmi", "systolic_bp", "diastolic_bp", "family_diabetes", "pulse_pressure", "high_bp"]
PROTECTED = [
    "backend/app/ml_models/bd_diabetes.joblib",
    "backend/app/ml_models/cardio_model.joblib",
    "backend/app/ml_models/cardio_scaler.joblib",
    "ML_Model/models/best_model.pkl",
    "ML_Model/models/imputer.pkl",
    "ML_Model/models/scaler.pkl",
    "ML_Research/Phase06B/Artifacts/diabd_research_calibrators.pkl",
    "ML_Research/Phase06B/Artifacts/cleveland_shap_explainer.pkl",
    "ML_Research/Phase06B/Artifacts/pima_leakage_free_pipeline.pkl",
    "backend/vitaguard.db",
]
# Fixed before fitting. A candidate must do all three on training out-of-fold rows.
YOUNG_RECALL_GAIN = 0.10
OVERALL_FP_CAP = 1.05
PR_AUC_DROP_CAP = 0.01


def sha256_file(path: Path) -> dict:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return {"sha256": digest.hexdigest(), "bytes": path.stat().st_size}


def snapshot() -> dict:
    return {item: sha256_file(ROOT / item) for item in PROTECTED}


def clean(frame: pd.DataFrame):
    work = frame.copy()
    work["sex"] = work["gender"].str.strip().map({"Female": 0, "Male": 1})
    for column in ["age", "bmi", "systolic_bp", "diastolic_bp", "height", "weight", "family_diabetes", "glucose", "pulse_rate"]:
        work[column] = pd.to_numeric(work[column], errors="coerce")
    work["diabetic"] = work["diabetic"].str.strip().map({"Yes": 1, "No": 0})
    expected = work["weight"] / (work["height"] ** 2)
    gap = (work["bmi"] - expected).abs() / expected.replace(0, np.nan)
    checks = {
        "sex_not_female_or_male": ~work["sex"].isin([0, 1]),
        "label_not_yes_or_no": ~work["diabetic"].isin([0, 1]),
        "age_outside_21_80": ~work["age"].between(21, 80),
        "bmi_outside_14_45": ~work["bmi"].between(14, 45),
        "sbp_outside_80_220": ~work["systolic_bp"].between(80, 220),
        "dbp_outside_50_130": ~work["diastolic_bp"].between(50, 130),
        "dbp_not_below_sbp": ~(work["diastolic_bp"] < work["systolic_bp"]),
        "family_not_binary": ~work["family_diabetes"].isin([0, 1]),
        "height_outside_1_35_2_05": ~work["height"].between(1.35, 2.05),
        "weight_outside_35_140": ~work["weight"].between(35, 140),
        "bmi_disagrees_with_height_weight": ~gap.le(0.15),
    }
    keep = np.ones(len(work), dtype=bool)
    counts = {}
    for name, mask in checks.items():
        counts[name] = int(mask.fillna(False).sum())
        keep &= ~mask.fillna(True)
    work = work.loc[keep].reset_index(drop=True)
    work["pulse_pressure"] = work["systolic_bp"] - work["diastolic_bp"]
    work["high_bp"] = ((work["systolic_bp"] >= 140) | (work["diastolic_bp"] >= 90)).astype(int)
    return work, counts


def oof(estimator, features, labels, splits):
    probabilities = np.zeros(len(features))
    y = labels.to_numpy().astype(int)
    for train_idx, valid_idx in splits:
        model = clone(estimator)
        model.fit(features.iloc[train_idx], y[train_idx])
        probabilities[valid_idx] = model.predict_proba(features.iloc[valid_idx])[:, 1]
    return probabilities


def counts_at(labels, probabilities, threshold):
    labels = np.asarray(labels).astype(int)
    predicted = np.asarray(probabilities) >= threshold
    tn, fp, fn, tp = confusion_matrix(labels, predicted, labels=[0, 1]).ravel()
    recall = float(recall_score(labels, predicted, zero_division=0))
    precision = float(tp / (tp + fp)) if (tp + fp) else 0.0
    return {"n": int(len(labels)), "positives": int(labels.sum()), "tp": int(tp), "fp": int(fp), "fn": int(fn), "tn": int(tn), "recall": round(recall, 4), "precision": round(precision, 4)}


def band_mask(age, name):
    if name == "21_40":
        return (age >= 21) & (age <= 40)
    if name == "41_60":
        return (age >= 41) & (age <= 60)
    return (age >= 61) & (age <= 80)


def band_report(age, labels, probabilities):
    rows = []
    labels = np.asarray(labels).astype(int)
    probabilities = np.asarray(probabilities)
    for name in ("21_40", "41_60", "61_80"):
        mask = band_mask(age, name)
        y = labels[mask]
        p = probabilities[mask]
        point = counts_at(y, p, 0.51)
        positives = y == 1
        negatives = y == 0
        point.update({
            "band": name,
            "prevalence": round(float(y.mean()), 4),
            "pr_auc": round(float(average_precision_score(y, p)), 4) if len(np.unique(y)) > 1 else None,
            "median_score_positive": round(float(np.median(p[positives])), 4) if positives.any() else None,
            "median_score_negative": round(float(np.median(p[negatives])), 4) if negatives.any() else None,
            "positives_at_or_above_0_51": int(((p >= 0.51) & positives).sum()),
        })
        rows.append(point)
    return rows


def xgb_model(weight):
    return XGBClassifier(
        objective="binary:logistic", eval_metric="logloss", n_estimators=200, max_depth=3,
        learning_rate=0.03, min_child_weight=10, subsample=0.8, colsample_bytree=0.8,
        reg_lambda=10, scale_pos_weight=weight, random_state=SEED, n_jobs=1, verbosity=0,
    )


def load_chart():
    path = ROOT / "backend" / "app" / "services" / "bd_cvd_chart.py"
    spec = importlib.util.spec_from_file_location("chart_audit_final", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def write(name: str, text: str):
    (HERE / name).write_text(text.strip() + "\n", encoding="utf-8")


def main():
    before = snapshot()
    raw = pd.read_csv(ROOT / "ML_Research" / "Phase06B" / "DiaBD" / "diabd_raw.csv")
    diabd, exclusion_counts = clean(raw)
    if len(diabd) != 5119 or int(diabd["diabetic"].sum()) != 324:
        raise SystemExit("DiaBD clean count changed.")
    labels = diabd["diabetic"].astype(int)
    train_index, test_index = train_test_split(np.arange(len(diabd)), test_size=0.2, random_state=SEED, stratify=labels)
    train_index, test_index = np.sort(train_index), np.sort(test_index)
    bundle = joblib.load(ROOT / "backend" / "app" / "ml_models" / "bd_diabetes.joblib")
    matrix = diabd.iloc[test_index][bundle["features"]]
    if bundle.get("scaler") is not None:
        matrix = bundle["scaler"].transform(matrix)
    published_probability = bundle["model"].predict_proba(matrix)[:, 1]
    published = counts_at(labels.iloc[test_index], published_probability, float(bundle["threshold"]))
    if published["fp"] != 290 or published["fn"] != 27:
        raise SystemExit("Published DiaBD test counts did not reproduce.")

    train = diabd.iloc[train_index].reset_index(drop=True)
    y_train = train["diabetic"].astype(int)
    weight = float((y_train == 0).sum() / (y_train == 1).sum())
    x_ref = train[FEATURES]
    splits = list(StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED).split(x_ref, y_train))
    print("reference oof", flush=True)
    reference = oof(xgb_model(weight), x_ref, y_train, splits)
    reference_counts = counts_at(y_train, reference, 0.51)
    bands = band_report(train["age"].to_numpy(), y_train, reference)

    interaction = train[FEATURES].copy()
    interaction["age_x_bmi"] = interaction["age"] * interaction["bmi"]
    interaction["age_x_sbp"] = interaction["age"] * interaction["systolic_bp"]
    interaction["bmi_x_sbp"] = interaction["bmi"] * interaction["systolic_bp"]
    interaction_model = Pipeline([
        ("scale", StandardScaler()),
        ("model", LogisticRegression(class_weight="balanced", C=0.3, max_iter=2000, random_state=SEED)),
    ])
    print("interaction oof", flush=True)
    interaction_probability = oof(interaction_model, interaction, y_train, splits)
    interaction_counts = counts_at(y_train, interaction_probability, 0.51)
    interaction_young = counts_at(y_train[band_mask(train["age"], "21_40")], interaction_probability[band_mask(train["age"], "21_40")], 0.51)
    young_reference = next(row for row in bands if row["band"] == "21_40")
    interaction_pass = (
        interaction_young["recall"] >= young_reference["recall"] + YOUNG_RECALL_GAIN
        and interaction_counts["fp"] <= reference_counts["fp"] * OVERALL_FP_CAP
        and average_precision_score(y_train, interaction_probability) >= average_precision_score(y_train, reference) - PR_AUC_DROP_CAP
    )

    nb_model = Pipeline([
        ("scale", StandardScaler()),
        ("model", GaussianNB()),
    ])
    print("naive bayes oof", flush=True)
    nb_probability = oof(nb_model, x_ref, y_train, splits)
    nb_counts = counts_at(y_train, nb_probability, 0.51)
    nb_pr = float(average_precision_score(y_train, nb_probability))
    nb_pass = nb_pr >= float(average_precision_score(y_train, reference)) + 0.01 and nb_counts["fp"] <= reference_counts["fp"] * 0.85

    family_by_label = {
        "positive_family_rate": round(float(train.loc[y_train == 1, "family_diabetes"].mean()), 4),
        "negative_family_rate": round(float(train.loc[y_train == 0, "family_diabetes"].mean()), 4),
    }
    glucose_corr = round(float(train["glucose"].corr(y_train.astype(float))), 4)
    rounded = pd.DataFrame(np.round(diabd[FEATURES].to_numpy(), 1), columns=FEATURES)
    near_duplicate_rows = int(rounded.duplicated().sum())
    correlations = diabd[FEATURES].corr().round(4).to_dict()

    pima = pd.read_csv(ROOT / "ML_Research" / "Phase06B" / "Pima" / "pima_canonical_raw.csv")
    for column in ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]:
        pima[column] = pd.to_numeric(pima[column], errors="coerce").replace(0, np.nan)
    pima_features = ["Pregnancies", "Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"]
    pima_y = pima["Outcome"].astype(int)
    p_train, _ = train_test_split(np.arange(len(pima)), test_size=0.2, random_state=SEED, stratify=pima_y)
    p_train = np.sort(p_train)
    p_x = pima.iloc[p_train][pima_features].reset_index(drop=True)
    p_y = pima_y.iloc[p_train].reset_index(drop=True)
    p_splits = list(StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED).split(p_x, p_y))
    pima_model = Pipeline([
        ("impute", SimpleImputer(strategy="median")),
        ("scale", StandardScaler()),
        ("model", LogisticRegression(class_weight="balanced", C=0.3, max_iter=2000, random_state=SEED)),
    ])
    print("pima oof", flush=True)
    pima_probability = oof(pima_model, p_x, p_y, p_splits)
    pima_pr = round(float(average_precision_score(p_y, pima_probability)), 4)
    pima_brier = round(float(brier_score_loss(p_y, np.clip(pima_probability, 0, 1))), 4)

    cardio = pd.read_csv(ROOT / "dataset" / "raw" / "heart_cleveland_upload.csv")
    cardio_features = ["age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"]
    c_y = cardio["condition"].astype(int)
    _, c_test = train_test_split(np.arange(len(cardio)), test_size=0.2, random_state=SEED, stratify=c_y)
    c_test = np.sort(c_test)
    c_model = joblib.load(ROOT / "backend" / "app" / "ml_models" / "cardio_model.joblib")
    c_scaler = joblib.load(ROOT / "backend" / "app" / "ml_models" / "cardio_scaler.joblib")
    c_matrix = c_scaler.transform(cardio.iloc[c_test][cardio_features].to_numpy())
    c_pred = c_model.predict(c_matrix)
    c_tn, c_fp, c_fn, c_tp = confusion_matrix(c_y.iloc[c_test], c_pred, labels=[0, 1]).ravel()
    if (int(c_tn), int(c_fp), int(c_fn), int(c_tp)) != (32, 0, 5, 23):
        raise SystemExit("Cleveland matrix did not reproduce.")

    chart = load_chart()
    who_ok = (
        len(chart.CELLS) == 700
        and chart.lookup_chart(39, 1, 0, 120, 25) is None
        and chart.lookup_chart(75, 1, 0, 120, 25) is None
        and chart.lookup_chart(40, 1, 0, 120, 25) is not None
        and chart.lookup_chart(74, 0, 1, 150, 30) is not None
    )
    route = (ROOT / "backend" / "app" / "routes" / "bangladesh.py").read_text(encoding="utf-8")
    prior_guard = "prior_cvd == 1" in route and "ge=40, le=74" in route

    after = snapshot()
    changed = [name for name in before if before[name] != after[name]]
    if changed:
        raise SystemExit(f"Protected files changed: {changed}")
    conclusion = "B" if interaction_pass or nb_pass else "D"
    payload = {
        "conclusion": conclusion,
        "published": published,
        "reference_oof": reference_counts,
        "bands": bands,
        "interaction_pass": bool(interaction_pass),
        "interaction": interaction_counts,
        "interaction_young": interaction_young,
        "nb_pass": bool(nb_pass),
        "nb": nb_counts,
        "nb_pr_auc": round(nb_pr, 4),
        "reference_pr_auc": round(float(average_precision_score(y_train, reference)), 4),
        "family": family_by_label,
        "glucose_corr_train": glucose_corr,
        "near_duplicate_rows_rounded_1_decimal": near_duplicate_rows,
        "pulse_sbp_corr": correlations["pulse_pressure"]["systolic_bp"],
        "sbp_dbp_corr": correlations["systolic_bp"]["diastolic_bp"],
        "exclusions": exclusion_counts,
        "raw_rows": int(len(raw)),
        "pima_rows": int(len(pima)),
        "pima_positives": int(pima_y.sum()),
        "pima_missing": {column: int(pima[column].isna().sum()) for column in ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]},
        "pima_pr_auc": pima_pr,
        "pima_brier": pima_brier,
        "cleveland_rows": int(len(cardio)),
        "cleveland_positives": int(c_y.sum()),
        "who_ok": bool(who_ok and prior_guard),
        "protected_changed": changed,
        "finished_at": datetime.now(timezone.utc).isoformat(),
    }
    (HERE / "logs").mkdir(exist_ok=True)
    (HERE / "logs" / "audit_summary.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")
    write_reports(payload)
    print(json.dumps({"conclusion": conclusion, "interaction_pass": interaction_pass, "nb_pass": nb_pass, "protected_changed": changed}, indent=2), flush=True)


def write_reports(p):
    bands = "\n".join(
        f"- Ages {row['band']}: n={row['n']}, positives={row['positives']}, prevalence={row['prevalence']}, "
        f"recall at 0.51={row['recall']}, precision={row['precision']}, PR-AUC={row['pr_auc']}, "
        f"median score if positive={row['median_score_positive']}, median score if negative={row['median_score_negative']}, "
        f"positives reaching 0.51={row['positives_at_or_above_0_51']}."
        for row in p["bands"]
    )
    young = next(row for row in p["bands"] if row["band"] == "21_40")
    write("COMPLETE_DATASET_AUDIT.md", f"""
# Complete dataset audit

Governance: NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.

No rows were deleted for this audit. The published cleaning rules were counted, not changed.

## Bangladesh DiaBD

The file is `ML_Research/Phase06B/DiaBD/diabd_raw.csv`, {p['raw_rows']} raw rows and 15 columns. The repository describes it in two ways: the metrics note says 63 Bangladesh unions, ages 21 to 80, not a national sample and not WHO STEPS; the data card says an urban outpatient survey in the BIRDEM Dhaka and Mymensingh catchment. The CSV has no site or date column, so those two descriptions cannot be checked from the table. External license: NOT VERIFIED.

Clean rows used by the published model: 5,119. Positives: 324. Prevalence: 0.0633. Exclusion counts under the existing rules: `{json.dumps(p['exclusions'])}`.

Model fields have no missing values after cleaning. Exact duplicate feature rows in the earlier audit: 3, with no conflicting labels. Rows whose model fields match after rounding to 1 decimal: {p['near_duplicate_rows_rounded_1_decimal']} extra copies. They were kept.

Glucose correlation with the label on the training split only: {p['glucose_corr_train']}. Glucose is not a model input. Pulse pressure correlates {p['pulse_sbp_corr']} with systolic pressure. Systolic and diastolic correlate {p['sbp_dbp_corr']}. Family-history rate is {p['family']['positive_family_rate']} among training positives and {p['family']['negative_family_rate']} among training negatives.

The label is the published DiaBD diabetes field. This audit cannot prove how the glucose test or the questionnaire was taken.

## Pima

Canonical file: 768 rows, {p['pima_positives']} positives. Zeros set to missing: {json.dumps(p['pima_missing'])}. The data card names `dataset/raw/diabetes.csv` and says the patient path is disabled. The leakage-free research file is `pima_canonical_raw.csv`, and the current consented route is open with a cohort limit. Redistribution: NOT VERIFIED. Cohort: women aged 21 to 81 near Phoenix. Not a Bangladesh sample.

## Cleveland

`dataset/raw/heart_cleveland_upload.csv`: {p['cleveland_rows']} complete rows, {p['cleveland_positives']} positives. Target `condition` is a catheterization-cohort label. External license: NOT VERIFIED. No site or year column is present for a temporal split.

## WHO South Asia chart

Published lookup, 700 cells, ages 40 to 74. Not a dataset with labels. Chart-value redistribution: NOT VERIFIED.
""")
    write("FEATURE_ENGINEERING_AUDIT.md", f"""
# Feature engineering audit

DiaBD model inputs are age, sex, BMI, systolic pressure, diastolic pressure, family history, pulse pressure, and the high-blood-pressure flag. Pulse pressure is systolic minus diastolic. The high-blood-pressure flag is a cut of the same two pressures. Both are available at prediction time. They are redundant, not label leakage.

Glucose, pulse rate, hypertensive status, family hypertension, cardiovascular disease, and stroke stay out. Glucose is the strongest simple correlate ({p['glucose_corr_train']} on training rows) and is also tied to how diabetes is labeled. Putting it in this pathway would change the pathway into a lab-result screen.

No log transform is justified: age, BMI, and blood pressure are already on bounded clinical scales, and the tree model can split them. A training-fold logistic model with age×BMI, age×systolic, and BMI×systolic did not clear the pre-registered young-adult rule (pass={p['interaction_pass']}). Overall out-of-fold counts at cutoff 0.51: {json.dumps(p['interaction'])}. Ages 21–40: {json.dumps(p['interaction_young'])}.

Median imputation is unused for DiaBD because those eight fields are complete. Pima medians stay inside the training fold. Scaling is inside the logistic pipeline only.

Family history has a small negative logistic coefficient in the earlier training-row fit, and the positive class does not have a higher family-history rate in this split. It is a weak, possibly noisy field, not a reason to invent a new variable.
""")
    write("MODEL_ARCHITECTURE_AUDIT.md", f"""
# Model architecture audit

The production DiaBD artifact is an XGBoost classifier with cutoff 0.51. The production Cleveland artifact is class-weighted logistic regression with the library default cutoff 0.5. Pima's saved pickle is the historical artifact; its leakage-free research reference is logistic regression with C=0.3. The WHO path has no model.

Earlier leakage-free comparisons in `long_term_research` and `final_26h_experiments` already covered logistic regression, in-fold selection, random forest, extra trees, histogram gradient boosting, XGBoost, and a simple average of logistic and extra trees. None cleared the pre-registered margins. CatBoost is not installed and was not added.

This audit added one family that those runs did not fit: Gaussian naive Bayes, inside a training-fold scaler. Out-of-fold at cutoff 0.51: {json.dumps(p['nb'])}. PR-AUC {p['nb_pr_auc']} against the XGBoost reference PR-AUC {p['reference_pr_auc']}. Pre-registered pass: {p['nb_pass']}.

A more complex model is not justified by these tables. The DiaBD PR-AUC of 0.1658 on 1,024 locked rows sits near a 6.3 percent base rate. Cleveland's 0.9167 accuracy is 55 of 60 catheterization rows. Pima's leakage-free out-of-fold PR-AUC remains {p['pima_pr_auc']}.
""")
    write("VALIDATION_METHODOLOGY_AUDIT.md", f"""
# Validation methodology audit

DiaBD and Pima use a stratified 80/20 split at seed 42, then 5-fold shuffled cross-validation on the training rows. Preprocessing for the new logistic and naive Bayes models is inside the fold. The published DiaBD test was scored once to confirm 290 false positives and 27 false negatives. It was not used to accept the interaction model or naive Bayes.

Cleveland's published 32/0/5/23 matrix was reproduced on the same split style. Repeated 5×10 training validation from the immediately previous research run remains the comparison. That 60-row test is not a selection set.

There is no visit date or clinic identifier, so a temporal or site split cannot be built from these files. Duplicate feature rows were counted and kept. Thresholds for the new fits were not searched; the comparison uses the existing 0.51 cutoff so a cutoff change is not mistaken for a better model.

Hyperparameter search was not reopened. The earlier searches already selected on training folds and did not clear their margins. Searching again on the same rows would reuse the same labels.
""")
    write("DIA_BD_AGE_AND_ERROR_ANALYSIS.md", f"""
# DiaBD age and error analysis

Locked test, n=1024, cutoff 0.51: true positives {p['published']['tp']}, false positives {p['published']['fp']}, false negatives {p['published']['fn']}, precision {p['published']['precision']}, recall {p['published']['recall']}.

Training out-of-fold, n={p['reference_oof']['n']}, same published configuration, same cutoff: false positives {p['reference_oof']['fp']}, false negatives {p['reference_oof']['fn']}, precision {p['reference_oof']['precision']}, recall {p['reference_oof']['recall']}.

## Why precision is low

About 6.3 percent of clean rows have the diabetes label. A cutoff that catches a large share of those rows also flags many people without the label. Precision is true positives divided by all alarms. On the locked test that is 38 / (38 + 290) = 0.1159. Majority-class accuracy would be about 93.7 percent and would catch nobody.

## Age bands on training out-of-fold scores

{bands}

Ages 21–40 have prevalence {young['prevalence']} and only {young['positives']} positives. Their median score when the label is positive is {young['median_score_positive']}, against {young['median_score_negative']} when the label is negative. The global cutoff 0.51 is above the typical young positive score, so recall is {young['recall']}. Only {young['positives_at_or_above_0_51']} of {young['positives']} young positives reach that cutoff.

The within-band PR-AUC for ages 21–40 is {young['pr_auc']}. That is the ranking inside the band, independent of the 0.51 cutoff. It stays close to a low base rate, so the gap is not only a cutoff sitting too high. The available non-lab features separate young labeled cases weakly.

The interaction model did not raise young-adult recall by the pre-registered 0.10 while holding false positives and PR-AUC. Pass={p['interaction_pass']}.
""")
    write("PIMA_LEAKAGE_FREE_ANALYSIS.md", f"""
# Pima leakage-free analysis

Canonical rows: {p['pima_rows']}. Positives: {p['pima_positives']}. Missing after zero-as-missing: {json.dumps(p['pima_missing'])}.

Training out-of-fold logistic regression, C=0.3, median imputation inside each fold, n=614: PR-AUC {p['pima_pr_auc']}, Brier {p['pima_brier']}. This matches the prior leakage-free reference of 0.7166 and 0.1627.

The 87.66 percent figure comes from `ML_Model/evaluation/metrics.json` after target-conditional insulin fills. It is not a baseline and it is not shown as a performance claim.

Earlier comparisons with random forest, histogram gradient boosting, and regularized XGBoost did not clear a +0.02 PR-AUC margin. This audit did not refit those failures.

Cohort limit: women aged 21 to 81 near Phoenix. The consented screen states that limit. This file cannot represent men, children, or patients in Bangladesh.
""")
    write("CLEVELAND_GENERALIZATION_ANALYSIS.md", f"""
# Cleveland generalization analysis

Rows: {p['cleveland_rows']}. Positives: {p['cleveland_positives']}. No missing model fields in the earlier integrity check. The saved logistic model reproduces 32 true negatives, 0 false positives, 5 false negatives, and 23 true positives on the 60-row seed-42 test.

That accuracy, 0.9167, is 55 of 60 rows from a historical catheterization cohort. It is not a community screening result. A different 60-row draw can move those five misses.

Repeated training validation in the previous research run gave logistic C=0.1 a mean PR-AUC gain of 0.011 over C=1, with a paired range of 0.0049 to 0.0179. The pre-registered margin was 0.02, so it was not a replacement. The 60-row test was not used to choose it.

No clinic, year, or external site is in the file. Stability outside this table is unmeasured.
""")
    write("WHO_LOOKUP_VERIFICATION.md", f"""
# WHO lookup verification

The South Asia non-laboratory chart is a published lookup in `backend/app/services/bd_cvd_chart.py`. This audit did not train a model and did not change a cell.

Check result: table intact = {p['who_ok']}. Expected 700 cells. Ages 39 and 75 do not resolve. Ages 40 and 74 do. The route source still limits age to 40–74 and rejects a prior heart attack or stroke before lookup.

Matching the table is a consistency check. It is not model accuracy and it has no false-positive count.
""")
    write("FAIRNESS_AND_CALIBRATION_ANALYSIS.md", f"""
# Fairness and calibration

This is not a completed fairness audit. The DiaBD file has sex and age. It does not have ethnicity, income, disability, or site.

Training out-of-fold recall at cutoff 0.51 is about 0.32 for ages 21–40 and about 0.70 for ages 41–80. The young band has {young['positives']} positives. That is enough to see the gap and too little to tune a separate young-adult model.

Earlier training-fold calibration bins remain the right description: the top score bin had a mean prediction near 0.70 and an observed positive rate near 0.145. The production field is already named an uncalibrated screening score. Recalibrating it on these same rows would not create a new external test, and this audit does not change the cutoff.

Pima has no male rows. Cleveland is too small for a subgroup claim. The WHO chart has no outcome labels, so it has no subgroup accuracy.
""")
    write("IMPROVEMENT_OPPORTUNITY_RANKING.md", f"""
# Improvement opportunity ranking

No expected accuracy gain is stated as a promise.

## 1. A new representative labeled sample, including more adults aged 21–40

- Problem: 324 positives overall and {young['positives']} training positives aged 21–40. Non-lab features rank those young rows weakly (within-band PR-AUC {young['pr_auc']}).
- Evidence: age-band table in the age report.
- Proposal: a later, approved study with a pre-specified label and enough young positives.
- Expected benefit: unknown until that sample exists.
- Risk: collecting data without approval.
- Required data: new data. Not feasible on this CSV.
- Class: REQUIRES NEW DATA. Confidence: high that the current file cannot close the age gap.

## 2. Keep glucose out of this pathway

- Problem: glucose correlates {p['glucose_corr_train']} with the training label and is entangled with the diagnosis.
- Evidence: training-split correlation. The column was excluded.
- Proposal: leave it out. A lab pathway would be a different product and needs its own design.
- Class: NOT RECOMMENDED for this pathway. Confidence: high.

## 3. Do not retune the 0.51 cutoff to chase young-adult recall

- Problem: the cutoff sits above most young positive scores.
- Evidence: median young positive score {young['median_score_positive']} versus cutoff 0.51.
- Proposal: any new cutoff needs an external sample and a stated false-alarm budget. This audit does not change 0.51.
- Class: NOT RECOMMENDED as a silent production edit. Confidence: high.

## 4. Further model families on these same rows

- Problem: logistic, forests, boosting, interactions, and naive Bayes have been compared.
- Evidence: prior research plus this naive Bayes pass={p['nb_pass']} and interaction pass={p['interaction_pass']}.
- Class: LOW PRIORITY. Confidence: high that another algorithm on this file will not clear a practical margin.

## 5. External check of the published models

- Problem: no site or time split exists here.
- Class: REQUIRES NEW DATA. Confidence: high.
""")
    write("EXTERNAL_VALIDATION_STRATEGY.md", """
# External validation strategy

Governance: NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.

This document does not collect records, contact a hospital, or start recruitment.

A later DiaBD-style study would need age, sex as recorded, BMI, systolic and diastolic pressure, family history, and a label defined before scoring. Glucose may audit the label. It is not an input to this pathway. Ages 21 to 80, with a pre-specified minimum of labeled positives inside ages 21–40. The current training band has too few young positives to tune a separate rule.

Split by place or time that the model has not seen. Fit scaling and any cutoff only on the development portion. Score the locked portion once. Remove names, phone numbers, national identifiers, and exact addresses before analysis.

Report precision, recall, false positives, false negatives, and calibration in each age band, with the band size. Do not claim a national accuracy from one clinic.

Pima stays a historical cohort of women aged 21 to 81 near Phoenix unless a new approved file says otherwise. Cleveland stays a catheterization cohort. The WHO chart is checked against the published cells, not refit.

Deployment readiness also needs the license, the ethics decision, and a human cutoff policy. None of those exists now.
""")
    code = {
        "B": "B. PROMISING RESEARCH OPPORTUNITIES IDENTIFIED — MORE VALIDATION REQUIRED.",
        "D": "D. CURRENT DATA IS INSUFFICIENT — NEW REPRESENTATIVE DATA REQUIRED.",
    }[p["conclusion"]]
    write("FINAL_COMPREHENSIVE_RESEARCH_REPORT.md", f"""
# Final comprehensive research report

Overall conclusion: **{code}**

Production changes: none. Protected hashes matched after the run. The DiaBD cutoff remains 0.51.

## Answers

1. The four pathways were audited from the files in the repository, including a new age-band ranking check and two fits that earlier runs had not used for this question.
2. Overlooked issues that are real: the data card and the metrics note describe DiaBD's sampling frame differently, and the CSV cannot settle it. Family history is not enriched among positives. Pulse pressure repeats systolic pressure. The Pima card still says the patient path is disabled, while the consented route is open with a cohort limit.
3. Age, BMI, and blood-pressure products were tested inside training folds. They did not clear the young-adult rule.
4. Naive Bayes was the unused simple family. It did not beat the published XGBoost ranking. Further families on this file are low priority.
5. The age gap is partly a low base rate and a global cutoff above the young positive scores, and partly weak ranking: within-band PR-AUC for ages 21–40 is {young['pr_auc']} on {young['positives']} positives.
6. False positives were not reduced by the interaction model or naive Bayes under the pre-registered rule. Earlier boosting came close on a 15 percent false-positive margin and was rejected without a locked-test retry.
7. The binding limit is the data: few positives, weak non-lab separation, no site or time key, and glucose held out on purpose.
8. The largest difference would be a new approved sample with a pre-specified label and more labeled adults aged 21–40.
9. Feasible now: keep the current models, keep 0.51, and state the age gap and the 290/27 counts.
10. Any new cutoff, calibration claim, or young-adult rule needs an independent sample. That sample is not in this repository.

The 87.66 percent Pima figure and the Cleveland 60-row accuracy are not general-population results. The WHO chart was not treated as a model.
""")


if __name__ == "__main__":
    main()
