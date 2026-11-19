"""Research-only accuracy search. Does not write production model files.

DiaBD and Cleveland keep their published feature lists. Pima uses the
canonical table with biological zeros treated as missing inside each fold.
The WHO chart is a lookup, so this script only checks that the table is intact.
"""
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, recall_score, roc_auc_score
from sklearn.model_selection import StratifiedKFold, cross_val_predict, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent / "results.json"
FOLDS = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)


def threshold_under_recall(probabilities, labels, recall_floor):
    best = None
    for step in range(1, 100):
        cutoff = step / 100
        predicted = probabilities >= cutoff
        recall = float(recall_score(labels, predicted, zero_division=0))
        if recall < recall_floor:
            continue
        accuracy = float(accuracy_score(labels, predicted))
        if best is None or accuracy > best["accuracy"]:
            best = {"threshold": cutoff, "accuracy": accuracy, "recall": recall}
    return best


def oof(estimator, features, labels):
    return cross_val_predict(estimator, features, labels, cv=FOLDS, method="predict_proba", n_jobs=1)[:, 1]


def clean_diabd(frame):
    work = frame.copy()
    work["sex"] = work["gender"].str.strip().map({"Female": 0, "Male": 1})
    for column in ["age", "bmi", "systolic_bp", "diastolic_bp", "height", "weight", "family_diabetes"]:
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


def run_diabd():
    frame = clean_diabd(pd.read_csv(ROOT / "ML_Research" / "Phase06B" / "DiaBD" / "diabd_raw.csv"))
    features = ["age", "sex", "bmi", "systolic_bp", "diastolic_bp", "family_diabetes", "pulse_pressure", "high_bp"]
    labels = frame["diabetic"].astype(int)
    train_index, test_index = train_test_split(frame.index, test_size=0.2, random_state=42, stratify=labels)
    x_train = frame.loc[train_index, features]
    y_train = labels.loc[train_index]
    x_test = frame.loc[test_index, features]
    y_test = labels.loc[test_index]
    recall_floor = 0.648
    candidates = {
        "logistic": Pipeline([
            ("scale", StandardScaler()),
            ("model", LogisticRegression(class_weight="balanced", max_iter=2000, random_state=42)),
        ]),
        "hist_gradient_boosting": HistGradientBoostingClassifier(
            learning_rate=0.05, max_depth=3, max_iter=300, min_samples_leaf=30,
            l2_regularization=1.0, class_weight="balanced", random_state=42,
        ),
    }
    rows = []
    for name, estimator in candidates.items():
        probabilities = oof(estimator, x_train, y_train)
        point = threshold_under_recall(probabilities, y_train, recall_floor)
        rows.append({"model": name, "training_folds": point, "oof_auroc": round(float(roc_auc_score(y_train, probabilities)), 4)})
    eligible = [row for row in rows if row["training_folds"]]
    winner = max(eligible, key=lambda row: row["training_folds"]["accuracy"])
    winner_model = candidates[winner["model"]]
    winner_model.fit(x_train, y_train)
    test_probability = winner_model.predict_proba(x_test)[:, 1]
    cutoff = winner["training_folds"]["threshold"]
    test_prediction = test_probability >= cutoff
    bundle = joblib.load(ROOT / "backend" / "app" / "ml_models" / "bd_diabetes.joblib")
    published_matrix = x_test[bundle["features"]]
    if bundle.get("scaler") is not None:
        published_matrix = bundle["scaler"].transform(published_matrix)
    published_probability = bundle["model"].predict_proba(published_matrix)[:, 1]
    published_prediction = published_probability >= bundle["threshold"]
    return {
        "rows": int(len(frame)),
        "prevalence": round(float(labels.mean()), 4),
        "majority_class_accuracy": round(float(1 - labels.mean()), 4),
        "recall_floor": recall_floor,
        "glucose_excluded": True,
        "training_comparison": rows,
        "selected_on_training_folds": winner["model"],
        "locked_test": {
            "candidate_accuracy": round(float(accuracy_score(y_test, test_prediction)), 4),
            "candidate_recall": round(float(recall_score(y_test, test_prediction)), 4),
            "published_model_accuracy": round(float(accuracy_score(y_test, published_prediction)), 4),
            "published_model_recall": round(float(recall_score(y_test, published_prediction)), 4),
        },
        "promoted_to_production": False,
    }


def run_pima():
    frame = pd.read_csv(ROOT / "ML_Research" / "Phase06B" / "Pima" / "pima_canonical_raw.csv")
    for column in ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]:
        frame[column] = frame[column].replace(0, np.nan)
    features = ["Pregnancies", "Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"]
    labels = frame["Outcome"].astype(int)
    x_train, x_test, y_train, y_test = train_test_split(frame[features], labels, test_size=0.2, random_state=42, stratify=labels)
    logistic_oof = oof(Pipeline([
        ("impute", SimpleImputer(strategy="median")),
        ("scale", StandardScaler()),
        ("model", LogisticRegression(class_weight="balanced", max_iter=2000, random_state=42)),
    ]), x_train, y_train)
    logistic_point = threshold_under_recall(logistic_oof, y_train, 0.0)
    recall_floor = max(0.0, logistic_point["recall"] - 0.02)
    candidates = {
        "logistic": Pipeline([
            ("impute", SimpleImputer(strategy="median")),
            ("scale", StandardScaler()),
            ("model", LogisticRegression(class_weight="balanced", max_iter=2000, C=0.3, random_state=42)),
        ]),
        "hist_gradient_boosting": Pipeline([
            ("impute", SimpleImputer(strategy="median")),
            ("model", HistGradientBoostingClassifier(
                learning_rate=0.05, max_depth=3, max_iter=200, min_samples_leaf=20,
                l2_regularization=1.0, random_state=42,
            )),
        ]),
    }
    rows = []
    for name, estimator in candidates.items():
        probabilities = oof(estimator, x_train, y_train)
        point = threshold_under_recall(probabilities, y_train, recall_floor)
        rows.append({"model": name, "training_folds": point, "oof_auroc": round(float(roc_auc_score(y_train, probabilities)), 4)})
    winner = max(rows, key=lambda row: row["training_folds"]["accuracy"])
    model = candidates[winner["model"]]
    model.fit(x_train, y_train)
    predicted = model.predict_proba(x_test)[:, 1] >= winner["training_folds"]["threshold"]
    return {
        "source": "canonical Pima rows, biological zeros set to missing inside the pipeline",
        "rows": int(len(frame)),
        "recall_floor_from_logistic_minus_0_02": round(recall_floor, 4),
        "training_comparison": rows,
        "selected_on_training_folds": winner["model"],
        "locked_test_accuracy": round(float(accuracy_score(y_test, predicted)), 4),
        "locked_test_recall": round(float(recall_score(y_test, predicted)), 4),
        "not_compared_with_leaked_87_percent": "The old 87.66 percent figure used label-conditional insulin fills. It is not a valid baseline.",
        "promoted_to_production": False,
    }


def run_cleveland():
    frame = pd.read_csv(ROOT / "dataset" / "raw" / "heart_cleveland_upload.csv")
    features = ["age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"]
    labels = frame["condition"].astype(int)
    x_train, x_test, y_train, y_test = train_test_split(frame[features], labels, test_size=0.2, random_state=42, stratify=labels)
    candidates = {
        "logistic": Pipeline([
            ("scale", StandardScaler()),
            ("model", LogisticRegression(class_weight="balanced", max_iter=2000, random_state=42)),
        ]),
        "hist_gradient_boosting": HistGradientBoostingClassifier(
            learning_rate=0.05, max_depth=2, max_iter=150, min_samples_leaf=15,
            l2_regularization=1.0, random_state=42,
        ),
    }
    rows = []
    for name, estimator in candidates.items():
        probabilities = oof(estimator, x_train, y_train)
        point = threshold_under_recall(probabilities, y_train, 0.70)
        rows.append({"model": name, "training_folds": point, "oof_auroc": round(float(roc_auc_score(y_train, probabilities)), 4)})
    winner = max(rows, key=lambda row: row["training_folds"]["accuracy"])
    model = candidates[winner["model"]]
    model.fit(x_train, y_train)
    predicted = model.predict_proba(x_test)[:, 1] >= winner["training_folds"]["threshold"]
    return {
        "rows": int(len(frame)),
        "test_rows": int(len(y_test)),
        "training_comparison": rows,
        "selected_on_training_folds": winner["model"],
        "locked_test_accuracy": round(float(accuracy_score(y_test, predicted)), 4),
        "locked_test_recall": round(float(recall_score(y_test, predicted)), 4),
        "note": "Sixty test rows cannot support a stable accuracy claim. The training-fold number is the comparison.",
        "promoted_to_production": False,
    }


def run_who():
    from app.services.bd_cvd_chart import lookup_chart
    checked = 0
    for age in range(40, 75):
        for sex in (0, 1):
            for smoker in (0, 1):
                for systolic in (110, 130, 150, 170):
                    for bmi in (20, 25, 30, 35):
                        cell = lookup_chart(age, sex, smoker, systolic, bmi)
                        if cell is None:
                            continue
                        checked += 1
                        if "band" not in cell or "chart_percent" not in cell:
                            raise RuntimeError("Chart cell has no risk field")
    return {
        "kind": "published lookup table",
        "trainable": False,
        "cells_checked_in_this_run": checked,
        "reason": "There is no local labeled cohort for this chart. Changing the table would no longer be the published WHO chart.",
        "promoted_to_production": False,
    }


def main():
    import sys
    sys.path.insert(0, str(ROOT / "backend"))
    report = {
        "production_files_changed": False,
        "diabd": run_diabd(),
        "pima": run_pima(),
        "cleveland": run_cleveland(),
        "who_chart": run_who(),
    }
    OUT.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps({
        "diabd_test": report["diabd"]["locked_test"],
        "pima_test_accuracy": report["pima"]["locked_test_accuracy"],
        "cleveland_selected": report["cleveland"]["selected_on_training_folds"],
        "cleveland_train_accuracy": report["cleveland"]["training_comparison"],
        "who_trainable": False,
    }, indent=2))


if __name__ == "__main__":
    main()
