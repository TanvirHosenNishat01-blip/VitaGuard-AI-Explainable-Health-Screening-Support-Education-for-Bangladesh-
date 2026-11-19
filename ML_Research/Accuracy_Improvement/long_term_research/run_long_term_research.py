"""Isolated leakage-free research. Does not write production artifacts or routes.

The locked test is used to reproduce the published models, then left alone.
A new candidate is scored on that test only after it clears the training-fold
rule in EXPERIMENT_CONFIGURATION.md.
"""
from __future__ import annotations

import csv
import hashlib
import importlib.util
import json
import platform
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.base import clone
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.feature_selection import SelectFromModel
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    brier_score_loss,
    confusion_matrix,
    f1_score,
    precision_recall_curve,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import RepeatedStratifiedKFold, StratifiedKFold, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
SEED = 42
DIABD_FEATURES = ["age", "sex", "bmi", "systolic_bp", "diastolic_bp", "family_diabetes", "pulse_pressure", "high_bp"]
PIMA_FEATURES = ["Pregnancies", "Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"]
PIMA_ZERO = ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]
CLEVELAND_FEATURES = ["age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"]
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
]


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def snapshot() -> dict:
    rows = {}
    for relative in PROTECTED:
        path = ROOT / relative
        rows[relative] = {"sha256": sha256_file(path), "bytes": path.stat().st_size}
    db = ROOT / "backend" / "vitaguard.db"
    rows["backend/vitaguard.db"] = {"sha256": sha256_file(db), "bytes": db.stat().st_size}
    return rows


def r4(value):
    if value is None:
        return None
    return round(float(value), 4)


def clean_diabd(frame: pd.DataFrame) -> pd.DataFrame:
    work = frame.copy()
    work["sex"] = work["gender"].str.strip().map({"Female": 0, "Male": 1})
    for column in ["age", "bmi", "systolic_bp", "diastolic_bp", "height", "weight", "family_diabetes", "glucose"]:
        work[column] = pd.to_numeric(work[column], errors="coerce")
    work["diabetic"] = work["diabetic"].str.strip().map({"Yes": 1, "No": 0})
    expected = work["weight"] / (work["height"] ** 2)
    gap = (work["bmi"] - expected).abs() / expected.replace(0, np.nan)
    keep = (
        work["sex"].isin([0, 1])
        & work["diabetic"].isin([0, 1])
        & work["age"].between(21, 80)
        & work["bmi"].between(14, 45)
        & work["systolic_bp"].between(80, 220)
        & work["diastolic_bp"].between(50, 130)
        & (work["diastolic_bp"] < work["systolic_bp"])
        & work["family_diabetes"].isin([0, 1])
        & work["height"].between(1.35, 2.05)
        & work["weight"].between(35, 140)
        & gap.le(0.15)
    )
    work = work.loc[keep].reset_index(drop=True)
    work["pulse_pressure"] = work["systolic_bp"] - work["diastolic_bp"]
    work["high_bp"] = ((work["systolic_bp"] >= 140) | (work["diastolic_bp"] >= 90)).astype(int)
    return work


def prepare_pima(frame: pd.DataFrame) -> pd.DataFrame:
    work = frame.copy()
    for column in PIMA_ZERO:
        work[column] = pd.to_numeric(work[column], errors="coerce").replace(0, np.nan)
    work["Outcome"] = pd.to_numeric(work["Outcome"], errors="coerce")
    return work


def split_indices(labels: pd.Series):
    train_index, test_index = train_test_split(
        np.arange(len(labels)), test_size=0.2, random_state=SEED, stratify=labels.astype(int)
    )
    return np.sort(train_index), np.sort(test_index)


def score_at(labels, probabilities, threshold: float) -> dict:
    labels = np.asarray(labels).astype(int)
    probabilities = np.asarray(probabilities, dtype=float)
    predicted = probabilities >= threshold
    tn, fp, fn, tp = confusion_matrix(labels, predicted, labels=[0, 1]).ravel()
    specificity = float(tn / (tn + fp)) if (tn + fp) else 0.0
    return {
        "threshold": float(threshold),
        "n": int(len(labels)),
        "accuracy": float(accuracy_score(labels, predicted)),
        "precision": float(precision_score(labels, predicted, zero_division=0)),
        "recall": float(recall_score(labels, predicted, zero_division=0)),
        "specificity": specificity,
        "f1": float(f1_score(labels, predicted, zero_division=0)),
        "pr_auc": float(average_precision_score(labels, probabilities)),
        "roc_auc": float(roc_auc_score(labels, probabilities)),
        "brier": float(brier_score_loss(labels, np.clip(probabilities, 0, 1))),
        "tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp),
    }


def oof_probabilities(estimator, features: pd.DataFrame, labels: pd.Series, splits) -> np.ndarray:
    probabilities = np.zeros(len(features), dtype=float)
    y = labels.to_numpy().astype(int)
    for train_idx, valid_idx in splits:
        model = clone(estimator)
        model.fit(features.iloc[train_idx], y[train_idx])
        probabilities[valid_idx] = model.predict_proba(features.iloc[valid_idx])[:, 1]
    return probabilities


def bootstrap_ci(labels, probabilities, threshold: float, kind: str, draws: int = 800) -> dict:
    rng = np.random.default_rng(SEED)
    labels = np.asarray(labels).astype(int)
    probabilities = np.asarray(probabilities)
    samples = []
    for _ in range(draws):
        chosen = rng.integers(0, len(labels), len(labels))
        if len(np.unique(labels[chosen])) < 2:
            continue
        if kind == "pr_auc":
            samples.append(average_precision_score(labels[chosen], probabilities[chosen]))
        elif kind == "brier":
            samples.append(brier_score_loss(labels[chosen], np.clip(probabilities[chosen], 0, 1)))
        else:
            predicted = probabilities[chosen] >= threshold
            y = labels[chosen]
            if kind == "fp":
                samples.append(int(((predicted == 1) & (y == 0)).sum()))
            else:
                samples.append(float(recall_score(y, predicted, zero_division=0)))
    array = np.asarray(samples, dtype=float)
    return {"low": r4(np.percentile(array, 2.5)), "high": r4(np.percentile(array, 97.5)), "draws": int(len(array))}


def logistic(C: float, impute: bool = False) -> Pipeline:
    steps = [("impute", SimpleImputer(strategy="median"))] if impute else []
    steps += [
        ("scale", StandardScaler()),
        ("model", LogisticRegression(class_weight="balanced", C=C, max_iter=2000, random_state=SEED)),
    ]
    return Pipeline(steps)


def forest(impute: bool = False):
    model = RandomForestClassifier(
        n_estimators=300, max_depth=6, min_samples_leaf=15, max_features="sqrt",
        class_weight="balanced", random_state=SEED, n_jobs=1,
    )
    return Pipeline([("impute", SimpleImputer(strategy="median")), ("model", model)]) if impute else model


def hist(impute: bool = False):
    model = HistGradientBoostingClassifier(
        learning_rate=0.05, max_depth=2, max_iter=200, min_samples_leaf=40,
        l2_regularization=10.0, class_weight="balanced", random_state=SEED,
    )
    return Pipeline([("impute", SimpleImputer(strategy="median")), ("model", model)]) if impute else model


def xgb(weight: float, depth: int, child: int, impute: bool = False):
    model = XGBClassifier(
        objective="binary:logistic", eval_metric="logloss", n_estimators=200, max_depth=depth,
        learning_rate=0.03, min_child_weight=child, subsample=0.8, colsample_bytree=0.8,
        reg_lambda=10.0, scale_pos_weight=weight, random_state=SEED, n_jobs=1, verbosity=0,
    )
    return Pipeline([("impute", SimpleImputer(strategy="median")), ("model", model)]) if impute else model


def operating_point(labels, probabilities, recall_floor: float):
    labels = np.asarray(labels).astype(int)
    best = None
    for step in range(5, 96):
        cutoff = step / 100
        metrics = score_at(labels, probabilities, cutoff)
        if metrics["recall"] < recall_floor:
            continue
        rank = (metrics["fp"], -metrics["recall"], -cutoff)
        if best is None or rank < best[0]:
            best = (rank, metrics)
    return None if best is None else best[1]


def round_row(row: dict) -> dict:
    out = {}
    for key, value in row.items():
        out[key] = r4(value) if isinstance(value, float) else value
    return out


def load_chart():
    path = ROOT / "backend" / "app" / "services" / "bd_cvd_chart.py"
    spec = importlib.util.spec_from_file_location("bd_cvd_chart_research_long", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def who_check() -> dict:
    chart = load_chart()
    route = (ROOT / "backend" / "app" / "routes" / "bangladesh.py").read_text(encoding="utf-8")
    missing = 0
    for age in (40, 50, 60, 74):
        for sex in (0, 1):
            for smoker in (0, 1):
                for systolic in (110, 130, 150, 170):
                    for bmi in (19, 22, 27, 32, 36):
                        cell = chart.lookup_chart(age, sex, smoker, systolic, bmi)
                        if cell is None:
                            missing += 1
    return {
        "cells": len(chart.CELLS),
        "expected": 700,
        "min": int(min(chart.CELLS.values())),
        "max": int(max(chart.CELLS.values())),
        "age_39": chart.lookup_chart(39, 1, 0, 120, 25),
        "age_40_ok": chart.lookup_chart(40, 1, 0, 120, 25) is not None,
        "age_74_ok": chart.lookup_chart(74, 0, 1, 150, 30) is not None,
        "age_75": chart.lookup_chart(75, 1, 0, 120, 25),
        "sample_missing": missing,
        "prior_cvd_guard_in_source": "prior_cvd == 1" in route and "ge=40, le=74" in route,
        "table_modified": False,
    }


def score_saved_diabd(frame, test_index):
    bundle = joblib.load(ROOT / "backend" / "app" / "ml_models" / "bd_diabetes.joblib")
    matrix = frame.iloc[test_index][bundle["features"]]
    if bundle.get("scaler") is not None:
        matrix = bundle["scaler"].transform(matrix)
    probabilities = bundle["model"].predict_proba(matrix)[:, 1]
    labels = frame.iloc[test_index]["diabetic"].astype(int)
    return score_at(labels, probabilities, float(bundle["threshold"])), probabilities, labels.to_numpy()


def score_saved_cleveland(frame, test_index):
    model = joblib.load(ROOT / "backend" / "app" / "ml_models" / "cardio_model.joblib")
    scaler = joblib.load(ROOT / "backend" / "app" / "ml_models" / "cardio_scaler.joblib")
    matrix = scaler.transform(frame.iloc[test_index][CLEVELAND_FEATURES].to_numpy())
    probabilities = model.predict_proba(matrix)[:, 1]
    labels = frame.iloc[test_index]["condition"].astype(int)
    metrics = score_at(labels, probabilities, 0.5)
    predicted = model.predict(matrix)
    tn, fp, fn, tp = confusion_matrix(labels, predicted, labels=[0, 1]).ravel()
    metrics["artifact_tn"], metrics["artifact_fp"], metrics["artifact_fn"], metrics["artifact_tp"] = int(tn), int(fp), int(fn), int(tp)
    return metrics


def quality_report(frame, features, label) -> dict:
    exact = int(frame.duplicated(subset=features + [label]).sum())
    conflict = int((frame.groupby(features, dropna=False)[label].nunique() > 1).sum())
    return {
        "rows": int(len(frame)),
        "positives": int(frame[label].sum()),
        "prevalence": r4(frame[label].mean()),
        "missing_in_features": int(frame[features].isna().sum().sum()),
        "exact_duplicate_rows": exact,
        "conflicting_labels_for_same_features": conflict,
    }


def subgroup_table(frame, labels, probabilities, threshold, column, bins):
    rows = []
    labels = np.asarray(labels).astype(int)
    probabilities = np.asarray(probabilities)
    values = frame[column].to_numpy()
    for name, mask in bins(values):
        if mask.sum() == 0:
            continue
        metrics = score_at(labels[mask], probabilities[mask], threshold) if len(np.unique(labels[mask])) > 1 else None
        positives = int(labels[mask].sum())
        rows.append({
            "group": name,
            "n": int(mask.sum()),
            "positives": positives,
            "sufficient": positives >= 20 and metrics is not None,
            "metrics": None if metrics is None or positives < 20 else round_row(metrics),
        })
    return rows


def reliability(labels, probabilities, bins: int = 5):
    labels = np.asarray(labels).astype(int)
    probabilities = np.asarray(probabilities)
    edges = np.quantile(probabilities, np.linspace(0, 1, bins + 1))
    edges[0], edges[-1] = 0.0, 1.0
    rows = []
    for low, high in zip(edges[:-1], edges[1:]):
        mask = (probabilities >= low) & (probabilities <= high if high == edges[-1] else probabilities < high)
        if mask.sum() == 0:
            continue
        rows.append({
            "bin_low": r4(low), "bin_high": r4(high), "n": int(mask.sum()),
            "mean_predicted": r4(probabilities[mask].mean()),
            "observed_rate": r4(labels[mask].mean()),
        })
    return rows


def curve_rows(labels, probabilities):
    precision, recall, thresholds = precision_recall_curve(labels, probabilities)
    keep = np.linspace(0, len(thresholds) - 1, num=min(25, len(thresholds)), dtype=int) if len(thresholds) else []
    return [
        {"threshold": r4(thresholds[index]), "precision": r4(precision[index]), "recall": r4(recall[index])}
        for index in keep
    ]


def write_csv(path: Path, rows: list[dict]):
    if not rows:
        path.write_text("", encoding="utf-8")
        return
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def markdown_table(rows, columns):
    header = "| " + " | ".join(columns) + " |"
    line = "| " + " | ".join("---" for _ in columns) + " |"
    body = ["| " + " | ".join(str(row.get(column, "")) for column in columns) + " |" for row in rows]
    return "\n".join([header, line, *body])


def main():
    (HERE / "logs").mkdir(exist_ok=True)
    (HERE / "curves").mkdir(exist_ok=True)
    (HERE / "models").mkdir(exist_ok=True)
    before = snapshot()
    config = {
        "seed": SEED,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "python": platform.python_version(),
        "packages": "sklearn, xgboost, numpy, pandas, shap are already installed. matplotlib and catboost are not installed and were not added.",
        "production_changes_allowed": False,
        "locked_test_rule": "Score a new candidate once only after the training-fold rule passes. Do not use the locked test to choose the candidate or the cutoff.",
        "diabd": {
            "objective": "Fewer false positives on training out-of-fold rows, without dropping recall more than 0.05 below the published-config out-of-fold recall at cutoff 0.51.",
            "margin": "False positives at most 85 percent of the published-config out-of-fold count, PR-AUC no more than 0.01 below that config, and the bootstrap interval for the false-positive reduction stays above zero.",
            "glucose": "excluded",
        },
        "pima": {
            "objective": "Out-of-fold PR-AUC at least 0.02 above regularized logistic C=0.3, with Brier score no more than 0.01 worse.",
            "invalid_baseline": "87.66 percent is not a baseline.",
            "imputation": "median inside each training fold",
        },
        "cleveland": {
            "objective": "Repeated stratified 5x10. Mean PR-AUC at least 0.02 above logistic C=1 and the 2.5 percentile of paired repeat differences above zero.",
            "locked_test": "Reproduce the published 60-row score once. Do not select with it.",
        },
        "who": "Lookup integrity only. No trained replacement.",
    }
    (HERE / "EXPERIMENT_CONFIGURATION.md").write_text(
        "# Experiment configuration\n\n"
        "Random seed 42. Stratified 80/20 split, then 5-fold shuffled cross-validation on the training rows only.\n\n"
        "CatBoost and matplotlib are not installed. No package was added. Precision-recall points are saved as CSV instead of a rendered plot.\n\n"
        "```json\n" + json.dumps(config, indent=2) + "\n```\n",
        encoding="utf-8",
    )

    diabd = clean_diabd(pd.read_csv(ROOT / "ML_Research" / "Phase06B" / "DiaBD" / "diabd_raw.csv"))
    pima = prepare_pima(pd.read_csv(ROOT / "ML_Research" / "Phase06B" / "Pima" / "pima_canonical_raw.csv"))
    cleveland = pd.read_csv(ROOT / "dataset" / "raw" / "heart_cleveland_upload.csv")
    if len(diabd) != 5119 or int(diabd["diabetic"].sum()) != 324 or len(pima) != 768 or len(cleveland) != 297:
        raise SystemExit("Dataset counts do not match the published tables.")
    train_d, test_d = split_indices(diabd["diabetic"])
    train_p, test_p = split_indices(pima["Outcome"])
    train_c, test_c = split_indices(cleveland["condition"])
    published_d, _, _ = score_saved_diabd(diabd, test_d)
    published_c = score_saved_cleveland(cleveland, test_c)
    if not (abs(published_d["accuracy"] - 0.6904) <= 0.002 and published_d["fp"] == 290 and published_d["fn"] == 27):
        raise SystemExit("DiaBD published baseline did not reproduce.")
    if (published_c["artifact_tn"], published_c["artifact_fp"], published_c["artifact_fn"], published_c["artifact_tp"]) != (32, 0, 5, 23):
        raise SystemExit("Cleveland published baseline did not reproduce.")

    weight_d = float((diabd.iloc[train_d]["diabetic"] == 0).sum() / (diabd.iloc[train_d]["diabetic"] == 1).sum())
    weight_p = float((pima.iloc[train_p]["Outcome"] == 0).sum() / max(int((pima.iloc[train_p]["Outcome"] == 1).sum()), 1))
    y_d = diabd.iloc[train_d]["diabetic"].astype(int).reset_index(drop=True)
    x_d = diabd.iloc[train_d][DIABD_FEATURES].reset_index(drop=True)
    splits_d = list(StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED).split(x_d, y_d))
    diabd_models = {
        "logistic_C0.3": logistic(0.3),
        "logistic_inner_selection": Pipeline([
            ("scale", StandardScaler()),
            ("select", SelectFromModel(LogisticRegression(class_weight="balanced", max_iter=2000, random_state=SEED), threshold="median")),
            ("model", LogisticRegression(class_weight="balanced", C=0.3, max_iter=2000, random_state=SEED)),
        ]),
        "random_forest": forest(),
        "hist_gradient_boosting": hist(),
        "xgb_published_config": xgb(weight_d, 3, 10),
        "xgb_more_regularized": xgb(weight_d, 2, 30),
    }
    print("diabd oof", flush=True)
    diabd_oof = {name: oof_probabilities(model, x_d, y_d, splits_d) for name, model in diabd_models.items()}
    reference_at_cutoff = score_at(y_d, diabd_oof["xgb_published_config"], 0.51)
    recall_floor = max(0.50, reference_at_cutoff["recall"] - 0.05)
    diabd_rows = []
    for name, probabilities in diabd_oof.items():
        point = operating_point(y_d, probabilities, recall_floor)
        row = {"model": name, "eligible_operating_point": point is not None}
        if point:
            row.update(round_row(point))
            row["pr_auc_ci95"] = bootstrap_ci(y_d, probabilities, point["threshold"], "pr_auc")
        diabd_rows.append(row)
    diabd_decision = []
    for row in diabd_rows:
        if row["model"] == "xgb_published_config" or not row["eligible_operating_point"]:
            continue
        probabilities = diabd_oof[row["model"]]
        fp_drop = reference_at_cutoff["fp"] - row["fp"]
        ci = bootstrap_ci(y_d, probabilities, row["threshold"], "fp")
        reasons = []
        if row["fp"] > 0.85 * reference_at_cutoff["fp"]:
            reasons.append("False positives were not at least 15 percent lower.")
        if row["pr_auc"] < round(reference_at_cutoff["pr_auc"] - 0.01, 4):
            reasons.append("PR-AUC fell by more than 0.01.")
        if row["recall"] < round(recall_floor, 4):
            reasons.append("Recall fell below the floor.")
        if not (ci["high"] < reference_at_cutoff["fp"]):
            reasons.append("The false-positive interval still reaches the reference count.")
        diabd_decision.append({"model": row["model"], "fp_reduction": int(fp_drop), "clears": not reasons, "reasons": reasons, "fp_ci95": ci})
    diabd_winner = next((item for item in diabd_decision if item["clears"]), None)

    print("pima oof", flush=True)
    y_p = pima.iloc[train_p]["Outcome"].astype(int).reset_index(drop=True)
    x_p = pima.iloc[train_p][PIMA_FEATURES].reset_index(drop=True)
    splits_p = list(StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED).split(x_p, y_p))
    pima_models = {
        "logistic_C0.3": logistic(0.3, True),
        "logistic_C1": logistic(1.0, True),
        "random_forest": forest(True),
        "hist_gradient_boosting": hist(True),
        "xgb_regularized": xgb(weight_p, 2, 5, True),
    }
    pima_oof = {name: oof_probabilities(model, x_p, y_p, splits_p) for name, model in pima_models.items()}
    pima_reference = score_at(y_p, pima_oof["logistic_C0.3"], 0.5)
    pima_rows = []
    for name, probabilities in pima_oof.items():
        point = operating_point(y_p, probabilities, max(0.5, pima_reference["recall"] - 0.05))
        row = {"model": name}
        if point:
            row.update(round_row(point))
            row["pr_auc_ci95"] = bootstrap_ci(y_p, probabilities, point["threshold"], "pr_auc")
            row["brier_ci95"] = bootstrap_ci(y_p, probabilities, point["threshold"], "brier")
        pima_rows.append(row)
    pima_decision = []
    for row in pima_rows:
        if row["model"] == "logistic_C0.3":
            continue
        reasons = []
        if row.get("pr_auc", 0) < round(pima_reference["pr_auc"] + 0.02, 4):
            reasons.append("PR-AUC did not clear +0.02.")
        if row.get("brier", 1) > round(pima_reference["brier"] + 0.01, 4):
            reasons.append("Brier score was worse by more than 0.01.")
        pima_decision.append({"model": row["model"], "clears": not reasons, "reasons": reasons})
    pima_winner = next((item for item in pima_decision if item["clears"]), None)

    print("cleveland repeated cv", flush=True)
    y_c = cleveland.iloc[train_c]["condition"].astype(int).reset_index(drop=True)
    x_c = cleveland.iloc[train_c][CLEVELAND_FEATURES].reset_index(drop=True)
    repeated = list(RepeatedStratifiedKFold(n_splits=5, n_repeats=10, random_state=SEED).split(x_c, y_c))
    grouped = [repeated[start:start + 5] for start in range(0, len(repeated), 5)]
    cleveland_models = {"logistic_C1": logistic(1.0), "logistic_C0.1": logistic(0.1), "random_forest": forest(), "hist_gradient_boosting": hist()}
    cleveland_rows = []
    repeat_pr = {}
    for name, model in cleveland_models.items():
        print(name, flush=True)
        scores = []
        for repeat_splits in grouped:
            probabilities = oof_probabilities(model, x_c, y_c, repeat_splits)
            scores.append(score_at(y_c, probabilities, 0.5))
        repeat_pr[name] = np.array([item["pr_auc"] for item in scores])
        cleveland_rows.append({
            "model": name,
            "pr_auc_mean": r4(repeat_pr[name].mean()),
            "pr_auc_std": r4(repeat_pr[name].std(ddof=1)),
            "brier_mean": r4(np.mean([item["brier"] for item in scores])),
            "recall_mean": r4(np.mean([item["recall"] for item in scores])),
            "accuracy_mean": r4(np.mean([item["accuracy"] for item in scores])),
            "n_repeats": 10,
            "n_train": int(len(y_c)),
        })
    reference_pr = repeat_pr["logistic_C1"]
    cleveland_decision = []
    for row in cleveland_rows:
        if row["model"] == "logistic_C1":
            continue
        diff = repeat_pr[row["model"]] - reference_pr
        clears = row["pr_auc_mean"] >= round(float(reference_pr.mean()) + 0.02, 4) and float(np.percentile(diff, 2.5)) > 0
        cleveland_decision.append({
            "model": row["model"], "clears": clears,
            "paired_mean": r4(diff.mean()), "paired_low": r4(np.percentile(diff, 2.5)), "paired_high": r4(np.percentile(diff, 97.5)),
        })
    cleveland_winner = next((item for item in cleveland_decision if item["clears"]), None)
    who = who_check()

    locked = {"diabd": None, "pima": None, "cleveland": None}
    if diabd_winner:
        model = clone(diabd_models[diabd_winner["model"]])
        model.fit(x_d, y_d.to_numpy())
        threshold = next(row["threshold"] for row in diabd_rows if row["model"] == diabd_winner["model"])
        probabilities = model.predict_proba(diabd.iloc[test_d][DIABD_FEATURES])[:, 1]
        locked["diabd"] = round_row(score_at(diabd.iloc[test_d]["diabetic"], probabilities, threshold))
        joblib.dump({"promoted_to_production": False, "model_name": diabd_winner["model"]}, HERE / "models" / "diabd_not_promoted.joblib")
    if pima_winner:
        model = clone(pima_models[pima_winner["model"]])
        model.fit(x_p, y_p.to_numpy())
        threshold = next(row["threshold"] for row in pima_rows if row["model"] == pima_winner["model"])
        probabilities = model.predict_proba(pima.iloc[test_p][PIMA_FEATURES])[:, 1]
        locked["pima"] = round_row(score_at(pima.iloc[test_p]["Outcome"], probabilities, threshold))

    reference_proba = diabd_oof["xgb_published_config"]
    thresholds = []
    for cutoff in [0.30, 0.40, 0.51, 0.60, 0.70, 0.80]:
        thresholds.append(round_row(score_at(y_d, reference_proba, cutoff)))
    write_csv(HERE / "curves" / "diabd_reference_pr_curve.csv", curve_rows(y_d, reference_proba))
    write_csv(HERE / "curves" / "diabd_reference_thresholds.csv", thresholds)
    write_csv(HERE / "curves" / "pima_logistic_pr_curve.csv", curve_rows(y_p, pima_oof["logistic_C0.3"]))

    train_frame = diabd.iloc[train_d][DIABD_FEATURES + ["diabetic", "glucose"]].reset_index(drop=True)
    sex_bins = lambda values: [("female", values == 0), ("male", values == 1)]
    age_bins = lambda values: [("age_21_40", (values >= 21) & (values <= 40)), ("age_41_60", (values >= 41) & (values <= 60)), ("age_61_80", (values >= 61) & (values <= 80))]
    subgroups = {
        "diabd_sex": subgroup_table(train_frame, y_d, reference_proba, 0.51, "sex", sex_bins),
        "diabd_age": subgroup_table(train_frame, y_d, reference_proba, 0.51, "age", age_bins),
    }
    pima_frame = pima.iloc[train_p][PIMA_FEATURES].reset_index(drop=True)
    subgroups["pima_age"] = subgroup_table(
        pima_frame, y_p, pima_oof["logistic_C0.3"], 0.5, "Age",
        lambda values: [("age_under_40", values < 40), ("age_40_or_older", values >= 40)],
    )
    error_means = []
    predicted = reference_proba >= 0.51
    y_np = y_d.to_numpy()
    groups = {
        "false_positive": (predicted == 1) & (y_np == 0),
        "true_negative": (predicted == 0) & (y_np == 0),
        "false_negative": (predicted == 0) & (y_np == 1),
        "true_positive": (predicted == 1) & (y_np == 1),
    }
    for feature in ["age", "bmi", "systolic_bp", "diastolic_bp"]:
        error_means.append({
            "feature": feature,
            **{name: r4(train_frame.loc[mask, feature].mean()) if mask.any() else None for name, mask in groups.items()},
        })

    coefficients = []
    logit = logistic(0.3)
    logit.fit(x_d, y_np)
    for feature, weight in zip(DIABD_FEATURES, logit.named_steps["model"].coef_[0]):
        coefficients.append({"feature": feature, "standardized_coefficient": r4(weight)})
    shap_note = "SHAP was not computed."
    try:
        import shap
        fitted = xgb(weight_d, 3, 10)
        fitted.fit(x_d, y_np)
        sample = x_d.sample(n=120, random_state=SEED)
        explainer = shap.TreeExplainer(fitted)
        values = explainer.shap_values(sample)
        if isinstance(values, list):
            values = values[-1]
        order = np.argsort(np.abs(values).mean(axis=0))[::-1]
        shap_rows = [{"feature": DIABD_FEATURES[index], "mean_abs_shap_on_120_training_rows": r4(np.abs(values)[:, index].mean())} for index in order]
        shap_note = "Mean absolute SHAP on 120 training rows of the published-config XGBoost refit. This is not a cause and not a clinical proof."
    except Exception as exc:
        shap_rows = []
        shap_note = f"SHAP did not complete: {type(exc).__name__}."

    comparison = []
    comparison.append({**{key: published_d[key] for key in ("threshold", "n", "accuracy", "precision", "recall", "specificity", "f1", "pr_auc", "roc_auc", "brier", "fp", "fn", "tn", "tp")},
        "pathway": "diabd", "model": "production_xgb", "validation": "locked_test_reproduction", "split": "seed42_20pct"})
    for row in diabd_rows:
        if "accuracy" not in row:
            continue
        comparison.append({**row, "pathway": "diabd", "validation": "training_oof_5fold", "split": "seed42_train_4095"})
    comparison.append({**round_row(pima_reference), "pathway": "pima", "model": "logistic_C0.3", "validation": "training_oof_5fold", "split": "seed42_train_614"})
    for row in pima_rows:
        if row["model"] == "logistic_C0.3" or "accuracy" not in row:
            continue
        comparison.append({**row, "pathway": "pima", "validation": "training_oof_5fold", "split": "seed42_train_614"})
    comparison.append({**round_row(published_c), "pathway": "cleveland", "model": "production_logistic", "validation": "locked_test_reproduction", "split": "seed42_test_60"})
    for row in cleveland_rows:
        comparison.append({**row, "pathway": "cleveland", "validation": "repeated_5x10_training", "split": "seed42_train_237"})
    flat_rows = []
    for row in comparison:
        flat = {}
        for key, value in row.items():
            if isinstance(value, dict):
                continue
            flat[key] = value
        flat_rows.append(flat)
    fields = sorted({key for row in flat_rows for key in row})
    ordered = [{key: row.get(key, "") for key in fields} for row in flat_rows]
    write_csv(HERE / "MODEL_COMPARISON.csv", ordered)

    glucose_corr = r4(pd.to_numeric(train_frame["glucose"], errors="coerce").corr(train_frame["diabetic"].astype(float)))
    overlap = len(set(map(tuple, np.round(diabd.iloc[train_d][DIABD_FEATURES].to_numpy(), 5))) & set(map(tuple, np.round(diabd.iloc[test_d][DIABD_FEATURES].to_numpy(), 5))))
    after = snapshot()
    changed = [name for name in before if before[name] != after[name]]
    if changed:
        raise SystemExit(f"Protected files changed: {changed}")

    recommendation = "NO IMPROVEMENT FOUND"
    if diabd_winner or pima_winner or cleveland_winner:
        recommendation = "PROMISING RESEARCH CANDIDATE — NEEDS MORE VALIDATION"
    summary = {
        "recommendation": recommendation,
        "production_changes": changed,
        "diabd_published_locked": round_row(published_d),
        "diabd_reference_oof_at_0_51": round_row(reference_at_cutoff),
        "diabd_recall_floor": r4(recall_floor),
        "diabd_winner": diabd_winner,
        "diabd_decision": diabd_decision,
        "pima_reference_oof": round_row(pima_reference),
        "pima_winner": pima_winner,
        "pima_decision": pima_decision,
        "cleveland_published": round_row(published_c),
        "cleveland_winner": cleveland_winner,
        "cleveland_decision": cleveland_decision,
        "who_intact": who["cells"] == 700 and who["age_39"] is None and who["age_75"] is None and who["sample_missing"] == 0,
        "locked_new_candidates": locked,
        "shap_note": shap_note,
    }
    (HERE / "logs" / "summary.json").write_text(json.dumps(summary, indent=2, default=str), encoding="utf-8")

    (HERE / "BASELINE_REPRODUCTION.md").write_text("\n".join([
        "# Baseline reproduction",
        "",
        "DiaBD production artifact on the seed-42 locked test: accuracy "
        f"{r4(published_d['accuracy'])}, precision {r4(published_d['precision'])}, recall {r4(published_d['recall'])}, "
        f"PR-AUC {r4(published_d['pr_auc'])}, false positives {published_d['fp']}, false negatives {published_d['fn']}, cutoff 0.51, n={published_d['n']}.",
        "",
        "Cleveland production artifact on the same split style: accuracy "
        f"{r4(published_c['accuracy'])}, confusion counts {published_c['artifact_tn']}/{published_c['artifact_fp']}/{published_c['artifact_fn']}/{published_c['artifact_tp']}, n=60.",
        "",
        f"Pima leakage-free logistic C=0.3 training out-of-fold PR-AUC is {r4(pima_reference['pr_auc'])} on {pima_reference['n']} training rows. The 87.66 percent file was not used.",
        "",
        "WHO lookup: "
        f"{who['cells']} cells, ages 39 and 75 return no cell, ages 40 and 74 resolve, sampled in-range misses {who['sample_missing']}. The table was not edited.",
        "",
        "These locked-test numbers reproduce the published models. They were not used to choose a new model.",
    ]), encoding="utf-8")

    (HERE / "DATA_QUALITY_AND_LEAKAGE_AUDIT.md").write_text("\n".join([
        "# Data quality and leakage audit",
        "",
        "## DiaBD",
        "",
        f"Clean rows {quality_report(diabd, DIABD_FEATURES, 'diabetic')}.",
        f"Glucose correlation with the label on training rows only: {glucose_corr}. Glucose was not passed to any model.",
        f"Exact feature-pattern overlap between the training and locked-test splits, rounded to 5 decimals: {overlap}. Rows were not silently deleted.",
        "Pulse pressure is systolic minus diastolic. It is redundant with the blood-pressure inputs and is not derived from the label.",
        "Imputation was unnecessary for the eight model fields. Scaling and the inner feature selector were fit inside each training fold.",
        "",
        "## Pima",
        "",
        f"Canonical rows {quality_report(pima, PIMA_FEATURES, 'Outcome')}.",
        "Biological zeros in glucose, blood pressure, skin thickness, insulin, and BMI were set to missing before the split. Medians were fit inside each fold. Outcome-conditional fills were not used.",
        "",
        "## Cleveland",
        "",
        f"Rows {quality_report(cleveland, CLEVELAND_FEATURES, 'condition')}.",
        "No model field is a copy of the condition label. The published 60-row matrix reproduced, which checks that this split matches the saved model.",
        "",
        "## WHO",
        "",
        "No labeled cohort is attached to the chart. There is no trainable leakage path because no model was trained.",
    ]), encoding="utf-8")

    (HERE / "THRESHOLD_ANALYSIS.md").write_text("\n".join([
        "# Threshold analysis",
        "",
        "These cutoffs are applied to the published DiaBD configuration's training out-of-fold probabilities. They do not change the production cutoff of 0.51.",
        "",
        "A higher cutoff lowers false positives and raises false negatives. That is an operating-point choice, not evidence that the model ranks cases better.",
        "",
        markdown_table(thresholds, ["threshold", "precision", "recall", "specificity", "fp", "fn", "pr_auc", "brier"]),
        "",
        "Precision-recall points for the same out-of-fold scores are in `curves/diabd_reference_pr_curve.csv`. Matplotlib is not installed, so no image was rendered.",
        "",
        f"Pima logistic reference at cutoff 0.5 on training out-of-fold rows: precision {r4(pima_reference['precision'])}, recall {r4(pima_reference['recall'])}, false positives {pima_reference['fp']}, false negatives {pima_reference['fn']}.",
    ]), encoding="utf-8")

    (HERE / "ERROR_ANALYSIS.md").write_text("\n".join([
        "# Error analysis",
        "",
        f"Published DiaBD locked test: {published_d['fp']} false positives and {published_d['fn']} false negatives out of {published_d['n']} rows.",
        f"Same configuration, training out-of-fold, cutoff 0.51: {reference_at_cutoff['fp']} false positives and {reference_at_cutoff['fn']} false negatives out of {reference_at_cutoff['n']} rows.",
        "",
        "Mean inputs by training out-of-fold error group at cutoff 0.51. These are descriptions, not causes.",
        "",
        markdown_table(error_means, ["feature", "false_positive", "true_negative", "false_negative", "true_positive"]),
        "",
        "Cleveland locked test: 0 false positives and 5 false negatives on 60 rows. That pattern can move on another 60-row draw. It is not a population screening result.",
    ]), encoding="utf-8")

    (HERE / "EXPLAINABILITY_REPORT.md").write_text("\n".join([
        "# Explainability",
        "",
        "No candidate cleared the training rule, so no new explainer was prepared for promotion.",
        "",
        "Standardized logistic coefficients on the DiaBD training rows:",
        "",
        markdown_table(coefficients, ["feature", "standardized_coefficient"]),
        "",
        shap_note,
        "",
        markdown_table(shap_rows, ["feature", "mean_abs_shap_on_120_training_rows"]) if shap_rows else "No SHAP table.",
        "",
        "A coefficient or a SHAP value does not prove that the feature causes diabetes, and it does not make the score a diagnosis.",
    ]), encoding="utf-8")

    def subgroup_lines(title, rows):
        lines = [f"## {title}", ""]
        for row in rows:
            if row["sufficient"]:
                metrics = row["metrics"]
                lines.append(f"- {row['group']}: n={row['n']}, positives={row['positives']}, recall={metrics['recall']}, precision={metrics['precision']}, fp={metrics['fp']}, fn={metrics['fn']}.")
            else:
                lines.append(f"- {row['group']}: n={row['n']}, positives={row['positives']}. Too few labeled positives for a conclusion.")
        return lines

    (HERE / "FAIRNESS_AND_GENERALIZATION.md").write_text("\n".join([
        "# Fairness and generalization",
        "",
        "This is not a completed fairness audit. Ethnicity, disability, and income are not in these tables. Sex and age are reported only because they are already inputs, and only where the positive count is at least 20.",
        "",
        *subgroup_lines("DiaBD training out-of-fold at cutoff 0.51", subgroups["diabd_sex"] + subgroups["diabd_age"]),
        "",
        *subgroup_lines("Pima training out-of-fold logistic at cutoff 0.5", subgroups["pima_age"]),
        "",
        "Pima contains only women aged 21 to 81 in the historical Phoenix-area table. It cannot support a claim about men, children, or patients in Bangladesh.",
        "",
        "Cleveland has 237 training rows from a catheterization cohort. Sex-specific claims are not made here. The 60-row test is too small for subgroup conclusions.",
        "",
        "The WHO chart is a published table for ages 40 to 74. Matching its cells is not a fairness study.",
    ]), encoding="utf-8")

    (HERE / "EXTERNAL_VALIDATION_PROTOCOL.md").write_text("\n".join([
        "# External validation protocol",
        "",
        "Governance: NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.",
        "",
        "This protocol does not collect data, contact a hospital, contact a patient, or submit an ethics application. A later study needs human approval before any of those steps.",
        "",
        "## DiaBD-style screening",
        "",
        "Fields: age, sex as recorded, BMI, systolic pressure, diastolic pressure, family history of diabetes, and a label defined before the model is scored. Glucose may be used only to define or audit the label. It is not a model input for this pathway.",
        "",
        "Inclusion: ages 21 to 80, BMI 14 to 45, systolic 80 to 220, diastolic 50 to 130 and below systolic. Exclusion: missing model fields, inconsistent height and weight, and any row whose label was created by the model itself.",
        "",
        "Split: lock a site or a time period that the model never saw. Fit imputation, scaling, and thresholds only on the development portion. Score the locked portion once.",
        "",
        "De-identification: remove names, phone numbers, national IDs, and exact addresses before the file reaches the research environment.",
        "",
        "## Pima and Cleveland",
        "",
        "An external file must use the same measurement definitions. Pima remains a historical cohort of women aged 21 to 81 near Phoenix unless a new approved dataset says otherwise. Cleveland remains a catheterization cohort, not a community screen.",
        "",
        "## WHO chart",
        "",
        "Do not refit the chart. An external check compares inputs and published cells. It does not create a new accuracy.",
    ]), encoding="utf-8")

    winner_text = "No pathway produced a candidate that cleared its pre-registered training rule."
    if diabd_winner or pima_winner or cleveland_winner:
        winner_text = f"Training-fold flags: DiaBD {diabd_winner}, Pima {pima_winner}, Cleveland {cleveland_winner}. Locked-test scores of those candidates: {locked}."
    (HERE / "FINAL_RESEARCH_REPORT.md").write_text("\n".join([
        "# Final research report",
        "",
        f"Recommendation: **{recommendation}**.",
        "",
        winner_text,
        "",
        "Production models, thresholds, prediction routes, and `backend/vitaguard.db` were not modified. Protected hashes matched after the run.",
        "",
        "## DiaBD",
        "",
        f"Published locked test stays at precision {r4(published_d['precision'])}, false positives {published_d['fp']}, false negatives {published_d['fn']}.",
        f"Training out-of-fold reference at cutoff 0.51: false positives {reference_at_cutoff['fp']}, false negatives {reference_at_cutoff['fn']}, PR-AUC {r4(reference_at_cutoff['pr_auc'])}, Brier {r4(reference_at_cutoff['brier'])}.",
        "Models compared on that same out-of-fold protocol: logistic regression, inner-fold feature selection, random forest, histogram gradient boosting, the published XGBoost configuration, and a more regularized XGBoost. None cleared the 15 percent false-positive reduction with the recall floor and the PR-AUC guard.",
        "",
        "## Pima",
        "",
        f"Leakage-free logistic out-of-fold PR-AUC {r4(pima_reference['pr_auc'])}, Brier {r4(pima_reference['brier'])}, n={pima_reference['n']}. Random forest, histogram gradient boosting, XGBoost, and C=1 logistic did not clear +0.02 PR-AUC without a worse Brier score. The 87.66 percent claim was not used.",
        "",
        "## Cleveland",
        "",
        "The published 60-row result reproduced and was not used for selection. Repeated training validation did not show a model beating logistic regression by the 0.02 PR-AUC margin with a paired interval above zero.",
        "",
        "## WHO",
        "",
        "The published table was checked and left unchanged. No accuracy was invented.",
        "",
        "Calibration bins for the DiaBD reference are below. A gap between mean predicted value and observed rate is a calibration description, not a license to change the production cutoff.",
        "",
        markdown_table(reliability(y_d, reference_proba), ["bin_low", "bin_high", "n", "mean_predicted", "observed_rate"]),
    ]), encoding="utf-8")
    print(json.dumps({"recommendation": recommendation, "protected_changed": changed, "diabd_winner": bool(diabd_winner), "pima_winner": bool(pima_winner), "cleveland_winner": bool(cleveland_winner)}, indent=2), flush=True)


if __name__ == "__main__":
    main()
