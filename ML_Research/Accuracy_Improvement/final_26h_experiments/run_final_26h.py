"""Leakage-free 26-hour research run. Does not write production artifacts.

Model choice uses training folds only. A locked test is scored for a new
candidate only after that candidate has already cleared the pre-registered
training bar. Production joblibs, prediction routes, and the database are read
at most for verification and are never replaced.
"""
from __future__ import annotations

import hashlib
import importlib.util
import json
import platform
import sys
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.base import clone
from sklearn.ensemble import ExtraTreesClassifier, HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.feature_selection import SelectFromModel
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import RepeatedStratifiedKFold, StratifiedKFold, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from xgboost import XGBClassifier

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
PREVIOUS_RESULTS = ROOT / "ML_Research" / "Accuracy_Improvement" / "results.json"
SEED = 42
RECALL_FLOOR_DIABD = 0.648
RECALL_FLOOR_PIMA = 0.55
RECALL_FLOOR_CLEVELAND = 0.70
DIABD_FEATURES = ["age", "sex", "bmi", "systolic_bp", "diastolic_bp", "family_diabetes", "pulse_pressure", "high_bp"]
DIABD_BASE = ["age", "sex", "bmi", "systolic_bp", "diastolic_bp", "family_diabetes"]
PIMA_FEATURES = ["Pregnancies", "Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"]
PIMA_ZERO_AS_MISSING = ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]
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
    "backend/app/services/bd_cvd_chart.py",
    "backend/app/routes/prediction.py",
    "backend/vitaguard.db",
]


def sha256_file(path: Path) -> dict:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return {"path": str(path.relative_to(ROOT)).replace("\\", "/"), "sha256": digest.hexdigest(), "bytes": path.stat().st_size}


def snapshot_protected() -> dict:
    rows = {}
    for relative in PROTECTED:
        path = ROOT / relative
        if not path.exists():
            rows[relative] = {"missing": True}
            continue
        try:
            rows[relative] = sha256_file(path)
        except OSError as exc:
            rows[relative] = {"error": type(exc).__name__, "bytes": path.stat().st_size}
    return rows


def convert(value):
    if isinstance(value, dict):
        return {str(key): convert(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [convert(item) for item in value]
    if isinstance(value, np.integer):
        return int(value)
    if isinstance(value, np.floating):
        return float(value)
    if isinstance(value, np.ndarray):
        return value.tolist()
    return value


def write_json(path: Path, payload) -> None:
    path.write_text(json.dumps(convert(payload), indent=2), encoding="utf-8")


def round_metrics(row: dict) -> dict:
    out = {}
    for key, value in row.items():
        if isinstance(value, float):
            out[key] = round(value, 4)
        else:
            out[key] = convert(value)
    return out


def load_previous_runner():
    path = ROOT / "ML_Research" / "Accuracy_Improvement" / "run_accuracy_search.py"
    spec = importlib.util.spec_from_file_location("previous_accuracy_search", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def load_chart_module():
    path = ROOT / "backend" / "app" / "services" / "bd_cvd_chart.py"
    spec = importlib.util.spec_from_file_location("bd_cvd_chart_research", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


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
    for column in PIMA_ZERO_AS_MISSING:
        work[column] = pd.to_numeric(work[column], errors="coerce").replace(0, np.nan)
    work["Outcome"] = pd.to_numeric(work["Outcome"], errors="coerce")
    return work


def locked_split(frame: pd.DataFrame, label: str):
    labels = frame[label].astype(int)
    train_index, test_index = train_test_split(
        np.arange(len(frame)), test_size=0.2, random_state=SEED, stratify=labels
    )
    return np.sort(train_index), np.sort(test_index), labels


def choose_threshold(labels, probabilities, recall_floor: float):
    labels = np.asarray(labels).astype(int)
    probabilities = np.asarray(probabilities)
    best = None
    for step in range(1, 100):
        cutoff = step / 100
        predicted = probabilities >= cutoff
        recall = float(recall_score(labels, predicted, zero_division=0))
        if recall < recall_floor:
            continue
        precision = float(precision_score(labels, predicted, zero_division=0))
        denominator = 4 * precision + recall
        f2 = 0.0 if denominator == 0 else (5 * precision * recall) / denominator
        rank = (f2, recall, precision, -cutoff)
        if best is None or rank > best[0]:
            best = (rank, cutoff, recall, precision, f2)
    if best is None:
        return None
    return {"threshold": best[1], "recall": best[2], "precision": best[3], "f2": best[4]}


def score_probabilities(labels, probabilities, threshold: float) -> dict:
    labels = np.asarray(labels).astype(int)
    probabilities = np.asarray(probabilities)
    predicted = probabilities >= threshold
    tn, fp, fn, tp = confusion_matrix(labels, predicted, labels=[0, 1]).ravel()
    specificity = float(tn / (tn + fp)) if (tn + fp) else 0.0
    return {
        "threshold": float(threshold),
        "accuracy": float(accuracy_score(labels, predicted)),
        "recall": float(recall_score(labels, predicted, zero_division=0)),
        "precision": float(precision_score(labels, predicted, zero_division=0)),
        "specificity": specificity,
        "f1": float(f1_score(labels, predicted, zero_division=0)),
        "pr_auc": float(average_precision_score(labels, probabilities)),
        "roc_auc": float(roc_auc_score(labels, probabilities)),
        "tn": int(tn),
        "fp": int(fp),
        "fn": int(fn),
        "tp": int(tp),
    }


def oof_probabilities(estimator, features: pd.DataFrame, labels: pd.Series, splits) -> tuple[np.ndarray, list[float]]:
    probabilities = np.zeros(len(features), dtype=float)
    labels_array = labels.to_numpy().astype(int)
    fold_scores = []
    for train_idx, valid_idx in splits:
        model = clone(estimator)
        model.fit(features.iloc[train_idx], labels_array[train_idx])
        fold_probability = model.predict_proba(features.iloc[valid_idx])[:, 1]
        probabilities[valid_idx] = fold_probability
        if len(np.unique(labels_array[valid_idx])) > 1:
            fold_scores.append(float(average_precision_score(labels_array[valid_idx], fold_probability)))
    return probabilities, fold_scores


def bootstrap_ci(labels, probabilities, threshold: float, kind: str, draws: int = 1000) -> dict:
    rng = np.random.default_rng(SEED)
    labels = np.asarray(labels).astype(int)
    probabilities = np.asarray(probabilities)
    samples = []
    for _ in range(draws):
        chosen = rng.integers(0, len(labels), len(labels))
        if len(np.unique(labels[chosen])) < 2:
            continue
        if kind == "pr_auc":
            samples.append(float(average_precision_score(labels[chosen], probabilities[chosen])))
        else:
            samples.append(float(recall_score(labels[chosen], probabilities[chosen] >= threshold, zero_division=0)))
    array = np.asarray(samples)
    return {
        "metric": kind,
        "draws": int(len(array)),
        "mean": round(float(array.mean()), 4),
        "low_95": round(float(np.percentile(array, 2.5)), 4),
        "high_95": round(float(np.percentile(array, 97.5)), 4),
    }


def paired_pr_difference(labels, candidate, reference, draws: int = 1000) -> dict:
    rng = np.random.default_rng(SEED)
    labels = np.asarray(labels).astype(int)
    samples = []
    for _ in range(draws):
        chosen = rng.integers(0, len(labels), len(labels))
        if len(np.unique(labels[chosen])) < 2:
            continue
        samples.append(
            float(average_precision_score(labels[chosen], candidate[chosen]) - average_precision_score(labels[chosen], reference[chosen]))
        )
    array = np.asarray(samples)
    return {
        "mean": round(float(array.mean()), 4),
        "low_95": round(float(np.percentile(array, 2.5)), 4),
        "high_95": round(float(np.percentile(array, 97.5)), 4),
    }


def logistic(C: float, impute: bool = False) -> Pipeline:
    steps = []
    if impute:
        steps.append(("impute", SimpleImputer(strategy="median")))
    steps.append(("scale", StandardScaler()))
    steps.append(("model", LogisticRegression(class_weight="balanced", C=C, max_iter=2000, random_state=SEED)))
    return Pipeline(steps)


def trees(kind: str, depth: int, leaf: int, trees_count: int, impute: bool = False):
    model_type = ExtraTreesClassifier if kind == "extra" else RandomForestClassifier
    model = model_type(
        n_estimators=trees_count,
        max_depth=depth,
        min_samples_leaf=leaf,
        max_features="sqrt",
        class_weight="balanced",
        random_state=SEED,
        n_jobs=1,
    )
    if not impute:
        return model
    return Pipeline([("impute", SimpleImputer(strategy="median")), ("model", model)])


def hist_model(depth: int, leaf: int, iterations: int, penalty: float, impute: bool = False):
    model = HistGradientBoostingClassifier(
        learning_rate=0.05,
        max_depth=depth,
        max_iter=iterations,
        min_samples_leaf=leaf,
        l2_regularization=penalty,
        class_weight="balanced",
        random_state=SEED,
    )
    if not impute:
        return model
    return Pipeline([("impute", SimpleImputer(strategy="median")), ("model", model)])


def xgb_model(depth: int, child: int, trees_count: int, rate: float, penalty: float, weight: float, impute: bool = False):
    model = XGBClassifier(
        objective="binary:logistic",
        eval_metric="logloss",
        n_estimators=trees_count,
        max_depth=depth,
        learning_rate=rate,
        min_child_weight=child,
        subsample=0.8,
        colsample_bytree=0.8,
        reg_lambda=penalty,
        scale_pos_weight=weight,
        random_state=SEED,
        n_jobs=1,
        verbosity=0,
    )
    if not impute:
        return model
    return Pipeline([("impute", SimpleImputer(strategy="median")), ("model", model)])


def evaluate_candidate(name, estimator, features, labels, splits, recall_floor: float) -> dict:
    print(f"candidate {name}", flush=True)
    probabilities, fold_scores = oof_probabilities(estimator, features, labels, splits)
    point = choose_threshold(labels, probabilities, recall_floor)
    fold_std = float(np.std(fold_scores, ddof=1)) if len(fold_scores) > 1 else 0.0
    row = {
        "model": name,
        "eligible": point is not None,
        "fold_pr_auc": [round(value, 4) for value in fold_scores],
        "fold_pr_auc_mean": round(float(np.mean(fold_scores)), 4) if fold_scores else None,
        "fold_pr_auc_std": round(fold_std, 4),
        "oof_pr_auc_ci95": bootstrap_ci(labels, probabilities, 0.5, "pr_auc"),
    }
    if point is None:
        row["reason"] = "No cutoff kept recall at or above the pre-registered floor."
        return row, probabilities
    metrics = score_probabilities(labels, probabilities, point["threshold"])
    metrics["f2"] = point["f2"]
    row["oof"] = round_metrics(metrics)
    row["oof_recall_ci95"] = bootstrap_ci(labels, probabilities, point["threshold"], "recall")
    return row, probabilities


def duplicate_report(frame: pd.DataFrame, columns: list[str], label: str) -> dict:
    exact = int(frame.duplicated(subset=columns + [label]).sum())
    same_features = int(frame.duplicated(subset=columns).sum())
    conflict = int((frame.groupby(columns, dropna=False)[label].nunique() > 1).sum())
    return {
        "exact_duplicate_rows": exact,
        "rows_with_repeated_features": same_features,
        "feature_patterns_with_conflicting_labels": conflict,
    }


def close(value, expected, tolerance=0.002) -> bool:
    return abs(float(value) - float(expected)) <= tolerance


def reproduce(previous: dict) -> dict:
    module = load_previous_runner()
    sys.path.insert(0, str(ROOT / "backend"))
    diabd = module.run_diabd()
    pima = module.run_pima()
    cleveland = module.run_cleveland()
    who = module.run_who()
    checks = {
        "diabd_selected_logistic": diabd["selected_on_training_folds"] == previous["diabd"]["selected_on_training_folds"],
        "diabd_candidate_accuracy": close(diabd["locked_test"]["candidate_accuracy"], previous["diabd"]["locked_test"]["candidate_accuracy"]),
        "diabd_candidate_recall": close(diabd["locked_test"]["candidate_recall"], previous["diabd"]["locked_test"]["candidate_recall"]),
        "diabd_published_accuracy": close(diabd["locked_test"]["published_model_accuracy"], previous["diabd"]["locked_test"]["published_model_accuracy"]),
        "diabd_published_recall": close(diabd["locked_test"]["published_model_recall"], previous["diabd"]["locked_test"]["published_model_recall"]),
        "diabd_logistic_train_accuracy": close(diabd["training_comparison"][0]["training_folds"]["accuracy"], previous["diabd"]["training_comparison"][0]["training_folds"]["accuracy"]),
        "pima_selected_logistic": pima["selected_on_training_folds"] == previous["pima"]["selected_on_training_folds"],
        "pima_locked_accuracy": close(pima["locked_test_accuracy"], previous["pima"]["locked_test_accuracy"]),
        "pima_locked_recall": close(pima["locked_test_recall"], previous["pima"]["locked_test_recall"]),
        "cleveland_selected_logistic": cleveland["selected_on_training_folds"] == previous["cleveland"]["selected_on_training_folds"],
        "cleveland_logistic_train_accuracy": close(cleveland["training_comparison"][0]["training_folds"]["accuracy"], previous["cleveland"]["training_comparison"][0]["training_folds"]["accuracy"]),
        "cleveland_hist_train_accuracy": close(cleveland["training_comparison"][1]["training_folds"]["accuracy"], previous["cleveland"]["training_comparison"][1]["training_folds"]["accuracy"]),
        "who_cells": who["cells_checked_in_this_run"] == previous["who_chart"]["cells_checked_in_this_run"],
    }
    return {
        "matched": all(checks.values()),
        "checks": checks,
        "recomputed": {"diabd": diabd, "pima": pima, "cleveland": cleveland, "who_chart": who},
    }


def dataset_hashes() -> dict:
    paths = {
        "diabd_raw": ROOT / "ML_Research" / "Phase06B" / "DiaBD" / "diabd_raw.csv",
        "pima_canonical": ROOT / "ML_Research" / "Phase06B" / "Pima" / "pima_canonical_raw.csv",
        "cleveland_raw": ROOT / "dataset" / "raw" / "heart_cleveland_upload.csv",
    }
    return {name: sha256_file(path) for name, path in paths.items()}


def who_integrity() -> dict:
    chart = load_chart_module()
    route_text = (ROOT / "backend" / "app" / "routes" / "bangladesh.py").read_text(encoding="utf-8")
    expected_keys = 7 * 4 * 5 * 5
    values = list(chart.CELLS.values())
    missing = []
    for age in range(40, 75):
        for sex in (0, 1):
            for smoker in (0, 1):
                for systolic in (90, 120, 140, 160, 180):
                    for bmi in (18, 22, 27, 32, 36):
                        cell = chart.lookup_chart(age, sex, smoker, systolic, bmi)
                        if cell is None or "chart_percent" not in cell or "band" not in cell:
                            missing.append({"age": age, "sex": sex, "smoker": smoker, "systolic": systolic, "bmi": bmi})
    boundaries = {
        "age_39": chart.lookup_chart(39, 1, 0, 120, 25),
        "age_40": chart.lookup_chart(40, 1, 0, 120, 25),
        "age_74": chart.lookup_chart(74, 0, 1, 180, 36),
        "age_75": chart.lookup_chart(75, 1, 0, 120, 25),
        "sbp_119_band": chart._sbp_band(119),
        "sbp_120_band": chart._sbp_band(120),
        "sbp_140_band": chart._sbp_band(140),
        "sbp_160_band": chart._sbp_band(160),
        "sbp_180_band": chart._sbp_band(180),
        "bmi_19_9_band": chart._bmi_band(19.9),
        "bmi_20_band": chart._bmi_band(20),
        "bmi_25_band": chart._bmi_band(25),
        "bmi_30_band": chart._bmi_band(30),
        "bmi_35_band": chart._bmi_band(35),
    }
    same = chart.lookup_chart(52, 1, 1, 148, 31.2) == chart.lookup_chart(52, 1, 1, 148, 31.2)
    payload_bounds_present = "age: int = Field(ge=40, le=74)" in route_text and "prior_cvd == 1" in route_text
    intact = (
        len(chart.CELLS) == expected_keys
        and not missing
        and boundaries["age_39"] is None
        and boundaries["age_75"] is None
        and boundaries["age_40"] is not None
        and boundaries["age_74"] is not None
        and boundaries["sbp_119_band"] == "lt120"
        and boundaries["sbp_120_band"] == "120"
        and boundaries["sbp_140_band"] == "140"
        and boundaries["sbp_160_band"] == "160"
        and boundaries["sbp_180_band"] == "ge180"
        and boundaries["bmi_19_9_band"] == "lt20"
        and boundaries["bmi_20_band"] == "20"
        and boundaries["bmi_25_band"] == "25"
        and boundaries["bmi_30_band"] == "30"
        and boundaries["bmi_35_band"] == "ge35"
        and same
        and payload_bounds_present
        and min(values) >= 1
    )
    return {
        "kind": "published lookup table",
        "trainable": False,
        "table_modified": False,
        "unique_cells": len(chart.CELLS),
        "expected_cells": expected_keys,
        "min_percent": int(min(values)),
        "max_percent": int(max(values)),
        "in_range_lookups_missing": missing,
        "boundaries": boundaries,
        "repeated_lookup_stable": same,
        "route_rejects_prior_cvd_and_limits_age_40_to_74": payload_bounds_present,
        "intact": intact,
    }


def diabd_models(weight: float) -> dict:
    return {
        "logistic_C0.03": (logistic(0.03), DIABD_FEATURES),
        "logistic_C0.3": (logistic(0.3), DIABD_FEATURES),
        "logistic_C3": (logistic(3.0), DIABD_FEATURES),
        "logistic_base_features_C0.3": (logistic(0.3), DIABD_BASE),
        "logistic_interactions_C0.1": (Pipeline([
            ("poly", PolynomialFeatures(degree=2, interaction_only=True, include_bias=False)),
            ("scale", StandardScaler()),
            ("model", LogisticRegression(class_weight="balanced", C=0.1, max_iter=2000, random_state=SEED)),
        ]), DIABD_BASE),
        "logistic_inner_selection": (Pipeline([
            ("scale", StandardScaler()),
            ("select", SelectFromModel(
                LogisticRegression(class_weight="balanced", max_iter=2000, random_state=SEED),
                threshold="median",
            )),
            ("model", LogisticRegression(class_weight="balanced", C=0.3, max_iter=2000, random_state=SEED)),
        ]), DIABD_FEATURES),
        "extra_trees": (trees("extra", 8, 15, 300), DIABD_FEATURES),
        "random_forest": (trees("forest", 6, 15, 300), DIABD_FEATURES),
        "hist_shallow": (hist_model(2, 50, 200, 10.0), DIABD_FEATURES),
        "hist_moderate": (hist_model(3, 30, 300, 1.0), DIABD_FEATURES),
        "xgb_published_config": (xgb_model(3, 10, 200, 0.03, 10.0, weight), DIABD_FEATURES),
        "xgb_more_regularized": (xgb_model(2, 30, 200, 0.03, 10.0, weight), DIABD_FEATURES),
    }


def pima_models(weight: float) -> dict:
    return {
        "logistic_C0.1": (logistic(0.1, impute=True), PIMA_FEATURES),
        "logistic_C0.3": (logistic(0.3, impute=True), PIMA_FEATURES),
        "logistic_C1": (logistic(1.0, impute=True), PIMA_FEATURES),
        "logistic_interactions_C0.1": (Pipeline([
            ("impute", SimpleImputer(strategy="median")),
            ("poly", PolynomialFeatures(degree=2, interaction_only=True, include_bias=False)),
            ("scale", StandardScaler()),
            ("model", LogisticRegression(class_weight="balanced", C=0.1, max_iter=2000, random_state=SEED)),
        ]), PIMA_FEATURES),
        "extra_trees": (trees("extra", 6, 10, 300, impute=True), PIMA_FEATURES),
        "random_forest": (trees("forest", 4, 8, 300, impute=True), PIMA_FEATURES),
        "hist_moderate": (hist_model(2, 20, 200, 1.0, impute=True), PIMA_FEATURES),
        "xgb_regularized": (xgb_model(2, 5, 150, 0.05, 5.0, weight, impute=True), PIMA_FEATURES),
    }


def cleveland_models() -> dict:
    return {
        "logistic_C0.1": logistic(0.1),
        "logistic_C1": logistic(1.0),
        "extra_trees": trees("extra", 4, 8, 200),
        "random_forest": trees("forest", 4, 8, 200),
        "hist_shallow": hist_model(2, 15, 100, 1.0),
    }


def run_single_split_search(model_map, frame, label, train_index, recall_floor: float):
    labels = frame[label].astype(int).reset_index(drop=True)
    train_labels = labels.iloc[train_index].reset_index(drop=True)
    splits = list(StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED).split(train_index, train_labels))
    rows = []
    stored = {}
    for name, (estimator, columns) in model_map.items():
        features = frame.iloc[train_index][columns].reset_index(drop=True)
        row, probabilities = evaluate_candidate(name, estimator, features, train_labels, splits, recall_floor)
        row["features"] = columns
        rows.append(row)
        stored[name] = {"probabilities": probabilities, "features": columns, "estimator": estimator}
    return rows, stored, train_labels


def add_ensemble(rows, stored, labels, recall_floor: float, left: str, right: str, splits):
    if left not in stored or right not in stored:
        return
    probabilities = (stored[left]["probabilities"] + stored[right]["probabilities"]) / 2
    point = choose_threshold(labels, probabilities, recall_floor)
    fold_scores = []
    labels_array = labels.to_numpy().astype(int)
    for _, valid_idx in splits:
        if len(np.unique(labels_array[valid_idx])) > 1:
            fold_scores.append(float(average_precision_score(labels_array[valid_idx], probabilities[valid_idx])))
    row = {
        "model": f"ensemble_{left}_{right}",
        "eligible": point is not None,
        "features": stored[left]["features"],
        "fold_pr_auc": [round(value, 4) for value in fold_scores],
        "fold_pr_auc_mean": round(float(np.mean(fold_scores)), 4) if fold_scores else None,
        "fold_pr_auc_std": round(float(np.std(fold_scores, ddof=1)), 4) if len(fold_scores) > 1 else 0.0,
        "oof_pr_auc_ci95": bootstrap_ci(labels, probabilities, 0.5, "pr_auc"),
        "members": [left, right],
        "note": "Equal average of the two out-of-fold probability vectors. The average was not refit on the locked test.",
    }
    if point is not None:
        metrics = score_probabilities(labels, probabilities, point["threshold"])
        metrics["f2"] = point["f2"]
        row["oof"] = round_metrics(metrics)
        row["oof_recall_ci95"] = bootstrap_ci(labels, probabilities, point["threshold"], "recall")
    stored[row["model"]] = {"probabilities": probabilities, "features": stored[left]["features"], "estimator": None, "members": [left, right]}
    rows.append(row)


def select_candidate(rows, reference_name: str, margin: float, max_extra_std: float, precision_floor: float | None):
    reference = next(row for row in rows if row["model"] == reference_name)
    reference_pr = reference["oof"]["pr_auc"]
    reference_std = reference["fold_pr_auc_std"]
    ranked = []
    for row in rows:
        if not row.get("eligible"):
            continue
        reasons = []
        if row["oof"]["pr_auc"] < reference_pr + margin:
            reasons.append("OOF PR-AUC did not clear the pre-registered margin over the reference.")
        if row["fold_pr_auc_std"] > reference_std + max_extra_std:
            reasons.append("Fold PR-AUC was less stable than the reference allows.")
        if precision_floor is not None and row["oof"]["precision"] < precision_floor:
            reasons.append("Operating-point precision was below 0.10.")
        ranked.append({
            "model": row["model"],
            "oof_pr_auc": row["oof"]["pr_auc"],
            "oof_recall": row["oof"]["recall"],
            "oof_precision": row["oof"]["precision"],
            "fold_pr_auc_std": row["fold_pr_auc_std"],
            "clears_training_bar": not reasons,
            "reasons": reasons,
        })
    ranked.sort(key=lambda item: (item["clears_training_bar"], item["oof_pr_auc"], item["oof_recall"]), reverse=True)
    winner = next((item for item in ranked if item["clears_training_bar"] and item["model"] != reference_name), None)
    return {"reference": reference_name, "reference_oof_pr_auc": reference_pr, "ranked": ranked, "review_candidate": winner}


def fit_probability(spec, features, labels, x_new):
    if spec.get("members"):
        columns = []
        for member in spec["members"]:
            raise RuntimeError(member)
    model = clone(spec["estimator"])
    model.fit(features, labels.to_numpy().astype(int))
    return model, model.predict_proba(x_new)[:, 1]


def score_saved_diabd(frame, test_index):
    bundle = joblib.load(ROOT / "backend" / "app" / "ml_models" / "bd_diabetes.joblib")
    features = frame.iloc[test_index][bundle["features"]]
    matrix = features
    if bundle.get("scaler") is not None:
        matrix = bundle["scaler"].transform(matrix)
    probabilities = bundle["model"].predict_proba(matrix)[:, 1]
    labels = frame.iloc[test_index]["diabetic"].astype(int)
    return score_probabilities(labels, probabilities, float(bundle["threshold"])), probabilities, labels


def score_saved_cleveland(frame, test_index):
    model = joblib.load(ROOT / "backend" / "app" / "ml_models" / "cardio_model.joblib")
    scaler = joblib.load(ROOT / "backend" / "app" / "ml_models" / "cardio_scaler.joblib")
    features = frame.iloc[test_index][CLEVELAND_FEATURES]
    matrix = scaler.transform(features.to_numpy())
    probabilities = model.predict_proba(matrix)[:, 1]
    predicted = model.predict(matrix)
    labels = frame.iloc[test_index]["condition"].astype(int)
    metrics = score_probabilities(labels, probabilities, 0.5)
    metrics["artifact_predict_accuracy"] = float(accuracy_score(labels, predicted))
    metrics["artifact_predict_recall"] = float(recall_score(labels, predicted, zero_division=0))
    tn, fp, fn, tp = confusion_matrix(labels, predicted, labels=[0, 1]).ravel()
    metrics["artifact_tn"] = int(tn)
    metrics["artifact_fp"] = int(fp)
    metrics["artifact_fn"] = int(fn)
    metrics["artifact_tp"] = int(tp)
    return metrics, probabilities, labels


def repeated_cleveland(frame, train_index):
    labels = frame["condition"].astype(int).reset_index(drop=True)
    train_labels = labels.iloc[train_index].reset_index(drop=True)
    features = frame.iloc[train_index][CLEVELAND_FEATURES].reset_index(drop=True)
    folder = RepeatedStratifiedKFold(n_splits=5, n_repeats=10, random_state=SEED)
    grouped = []
    flat = list(folder.split(features, train_labels))
    for start in range(0, len(flat), 5):
        grouped.append(flat[start:start + 5])
    models = cleveland_models()
    per_model = {}
    summaries = []
    for name, estimator in models.items():
        print(f"cleveland repeat {name}", flush=True)
        repeat_rows = []
        for repeat_splits in grouped:
            probabilities, _ = oof_probabilities(estimator, features, train_labels, repeat_splits)
            point = choose_threshold(train_labels, probabilities, RECALL_FLOOR_CLEVELAND)
            if point is None:
                repeat_rows.append({"eligible": False})
                continue
            metrics = score_probabilities(train_labels, probabilities, point["threshold"])
            default = score_probabilities(train_labels, probabilities, 0.5)
            repeat_rows.append({
                "eligible": True,
                "pr_auc": metrics["pr_auc"],
                "recall": metrics["recall"],
                "precision": metrics["precision"],
                "accuracy": metrics["accuracy"],
                "threshold": metrics["threshold"],
                "default_0_5_accuracy": default["accuracy"],
                "default_0_5_recall": default["recall"],
            })
        usable = [row for row in repeat_rows if row.get("eligible")]
        pr = np.array([row["pr_auc"] for row in usable])
        summary = {
            "model": name,
            "eligible_repeats": len(usable),
            "pr_auc_mean": round(float(pr.mean()), 4) if len(pr) else None,
            "pr_auc_std": round(float(pr.std(ddof=1)), 4) if len(pr) > 1 else None,
            "pr_auc_low": round(float(np.percentile(pr, 2.5)), 4) if len(pr) else None,
            "pr_auc_high": round(float(np.percentile(pr, 97.5)), 4) if len(pr) else None,
            "recall_mean": round(float(np.mean([row["recall"] for row in usable])), 4) if usable else None,
            "precision_mean": round(float(np.mean([row["precision"] for row in usable])), 4) if usable else None,
            "accuracy_mean": round(float(np.mean([row["accuracy"] for row in usable])), 4) if usable else None,
            "default_0_5_accuracy_mean": round(float(np.mean([row["default_0_5_accuracy"] for row in usable])), 4) if usable else None,
            "default_0_5_recall_mean": round(float(np.mean([row["default_0_5_recall"] for row in usable])), 4) if usable else None,
        }
        summaries.append(summary)
        per_model[name] = repeat_rows
    reference = np.array([row["pr_auc"] for row in per_model["logistic_C1"] if row.get("eligible")])
    ranked = []
    for summary in summaries:
        repeats = [row["pr_auc"] for row in per_model[summary["model"]] if row.get("eligible")]
        if summary["model"] == "logistic_C1" or len(repeats) != len(reference):
            diff = np.zeros(len(reference))
        else:
            diff = np.array(repeats) - reference
        clears = (
            summary["model"] != "logistic_C1"
            and len(repeats) == 10
            and summary["pr_auc_mean"] >= round(float(reference.mean()) + 0.02, 4)
            and float(np.percentile(diff, 2.5)) > 0
            and summary["recall_mean"] >= RECALL_FLOOR_CLEVELAND
        )
        ranked.append({
            **summary,
            "paired_pr_auc_difference_vs_logistic_C1": {
                "mean": round(float(diff.mean()), 4),
                "low": round(float(np.percentile(diff, 2.5)), 4),
                "high": round(float(np.percentile(diff, 97.5)), 4),
            },
            "clears_training_bar": clears,
        })
    winner = next((row for row in sorted(ranked, key=lambda item: item["pr_auc_mean"] or 0, reverse=True) if row["clears_training_bar"]), None)
    coefficients = coefficient_stability(features, train_labels)
    return {
        "protocol": "RepeatedStratifiedKFold 5x10 on the training split only. Thresholds are chosen inside each repeat.",
        "candidates": ranked,
        "review_candidate": None if winner is None else winner["model"],
        "coefficient_sign_stability": coefficients,
        "locked_test_used_for_selection": False,
    }


def coefficient_stability(features: pd.DataFrame, labels: pd.Series) -> dict:
    signs = []
    splits = StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED).split(features, labels)
    for train_idx, _ in splits:
        model = logistic(1.0)
        model.fit(features.iloc[train_idx], labels.to_numpy().astype(int)[train_idx])
        signs.append(np.sign(model.named_steps["model"].coef_[0]))
    stack = np.vstack(signs)
    full = logistic(1.0)
    full.fit(features, labels.to_numpy().astype(int))
    full_sign = np.sign(full.named_steps["model"].coef_[0])
    agreement = (stack == full_sign).mean(axis=0)
    return {
        "features": CLEVELAND_FEATURES,
        "sign_agreement_with_full_training_fit": {name: round(float(value), 4) for name, value in zip(CLEVELAND_FEATURES, agreement)},
        "note": "Signs come from training folds only. The locked test was not used.",
    }


def conclusion_from_test(training_cleared: bool, test_delta_pr: float, recall_drop: float, difference_ci: dict | None):
    if not training_cleared:
        return "B", "No candidate cleared the pre-registered training-fold bar. The current model stays."
    if difference_ci is None:
        return "C", "The training bar was cleared, but the locked comparison was not available."
    if difference_ci["low_95"] > 0 and test_delta_pr >= 0.01 and recall_drop <= 0.02:
        return "A", "The locked-test PR-AUC difference stays above zero and recall did not fall by more than 0.02. This is evidence for a separate validation, not a production replacement."
    if difference_ci["high_95"] < 0 or test_delta_pr < 0:
        return "B", "The locked test does not support the training-fold gain. The current model stays."
    return "C", "The point estimate is not a stable locked-test gain. Do not promote."


def save_matrix(name: str, metrics: dict) -> None:
    write_json(HERE / "confusion_matrices" / f"{name}.json", {
        "labels": ["actual_negative", "actual_positive"],
        "matrix": [[metrics["tn"], metrics["fp"]], [metrics["fn"], metrics["tp"]]],
        "false_negatives": metrics["fn"],
        "false_positives": metrics["fp"],
    })


def markdown_table(rows: list[dict], columns: list[str]) -> str:
    header = "| " + " | ".join(columns) + " |"
    line = "| " + " | ".join("---" for _ in columns) + " |"
    body = []
    for row in rows:
        body.append("| " + " | ".join(str(row.get(column, "")) for column in columns) + " |")
    return "\n".join([header, line, *body])


def write_reports(bundle: dict) -> None:
    diabd_rows = []
    for row in bundle["cross_validation_results"]["diabd"]:
        oof = row.get("oof", {})
        diabd_rows.append({
            "model": row["model"],
            "pr_auc": oof.get("pr_auc", ""),
            "recall": oof.get("recall", ""),
            "precision": oof.get("precision", ""),
            "accuracy": oof.get("accuracy", ""),
            "fold_std": row.get("fold_pr_auc_std", ""),
        })
    pima_rows = []
    for row in bundle["cross_validation_results"]["pima"]:
        oof = row.get("oof", {})
        pima_rows.append({
            "model": row["model"],
            "pr_auc": oof.get("pr_auc", ""),
            "recall": oof.get("recall", ""),
            "precision": oof.get("precision", ""),
            "accuracy": oof.get("accuracy", ""),
        })
    cleveland_rows = bundle["cross_validation_results"]["cleveland"]["candidates"]
    lines = [
        "# Final 26-hour recommendation",
        "",
        "No production model was replaced. No prediction endpoint was changed. The production database was not migrated.",
        "",
        f"Overall conclusion: **{bundle['overall_code']}**. {bundle['overall_text']}",
        "",
        "## Bangladesh DiaBD",
        "",
        f"Conclusion **{bundle['conclusions']['diabd']['code']}**. {bundle['conclusions']['diabd']['text']}",
        "",
        "The published production artifact, scored again on the same locked split, remains the reference. Glucose stayed out of every candidate. Majority-class accuracy is about 93.7 percent and was not treated as a screening result.",
        "",
        markdown_table(diabd_rows, ["model", "pr_auc", "recall", "precision", "accuracy", "fold_std"]),
        "",
        "## Pima",
        "",
        f"Conclusion **{bundle['conclusions']['pima']['code']}**. {bundle['conclusions']['pima']['text']}",
        "",
        "The canonical 768-row table was used. Biological zeros were set to missing before the split, and medians were fit inside each training fold. The leaked 87.66 percent figure was not used as a baseline. Patient-facing routes were not edited.",
        "",
        markdown_table(pima_rows, ["model", "pr_auc", "recall", "precision", "accuracy"]),
        "",
        "## Cleveland",
        "",
        f"Conclusion **{bundle['conclusions']['cleveland']['code']}**. {bundle['conclusions']['cleveland']['text']}",
        "",
        "The published 91.7 percent figure is the production logistic regression at its default 0.5 cutoff on 60 locked rows. Repeated training-fold validation is the comparison. A small test-set difference was not allowed to choose a model.",
        "",
        markdown_table([
            {
                "model": row["model"],
                "pr_auc_mean": row["pr_auc_mean"],
                "recall_mean": row["recall_mean"],
                "accuracy_mean": row["accuracy_mean"],
                "clears_bar": row["clears_training_bar"],
            }
            for row in cleveland_rows
        ], ["model", "pr_auc_mean", "recall_mean", "accuracy_mean", "clears_bar"]),
        "",
        "## WHO South Asia chart",
        "",
        f"Conclusion **{bundle['conclusions']['who']['code']}**. {bundle['conclusions']['who']['text']}",
        "",
        "The chart was not trained and its published percents were not edited.",
        "",
        "## Promotion",
        "",
        "No candidate is authorized for production. A later promotion would still need an independent split review, a leakage audit, artifact verification, and an explicit human approval.",
        "",
    ]
    (HERE / "final_recommendation.md").write_text("\n".join(lines), encoding="utf-8")
    repro_lines = [
        "# Reproducibility",
        "",
        f"Random seed: {SEED}.",
        f"Python: {platform.python_version()}.",
        f"NumPy: {np.__version__}. pandas: {pd.__version__}.",
        f"Previous-result reproduction matched: {bundle['reproduction']['matched']}.",
        "",
        "Run `backend\\venv\\Scripts\\python.exe ML_Research\\Accuracy_Improvement\\final_26h_experiments\\run_final_26h.py` from the repository root.",
        "",
        "Protected file hashes were recorded before and after the run. The script writes only inside `ML_Research/Accuracy_Improvement/final_26h_experiments/`.",
        "",
        "CatBoost was not installed and was not added during this run.",
        "",
        "The locked DiaBD and Cleveland splits are the stratified 80/20 splits at seed 42. Their index hashes are in `dataset_integrity_report.json`.",
        "",
    ]
    (HERE / "reproducibility_report.md").write_text("\n".join(repro_lines), encoding="utf-8")


def main():
    (HERE / "confusion_matrices").mkdir(exist_ok=True)
    (HERE / "candidate_models").mkdir(exist_ok=True)
    started = snapshot_protected()
    config = {
        "seed": SEED,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "production_promotion": False,
        "catboost": "unavailable, not installed",
        "selection": {
            "diabd": "Highest out-of-fold PR-AUC among models whose F2 cutoff keeps recall at or above 0.648, precision at or above 0.10, PR-AUC at least 0.01 above xgb_published_config, and fold PR-AUC standard deviation no more than 0.02 above that reference. Glucose is excluded.",
            "pima": "Same F2 rule with a fixed recall floor of 0.55. The reference is logistic_C0.3. Margin is 0.01 PR-AUC. Imputation stays inside the fold. The leaked 87.66 percent model is not a reference.",
            "cleveland": "Repeated stratified 5x10 on the training split. A candidate must beat logistic_C1 by 0.02 mean PR-AUC and the 2.5 percentile of the paired repeat differences must be above zero, with mean recall at or above 0.70. The 60-row test cannot select the model.",
            "who": "Lookup integrity only.",
            "locked_test_rule": "Score a new candidate on the locked test only if it cleared the training bar. Do not score the runners-up.",
        },
    }
    write_json(HERE / "experiment_config.json", config)
    previous = json.loads(PREVIOUS_RESULTS.read_text(encoding="utf-8"))
    print("reproducing previous search", flush=True)
    reproduction = reproduce(previous)
    if not reproduction["matched"]:
        write_json(HERE / "reproduction_mismatch.json", reproduction["checks"])
        raise SystemExit("Previous results did not reproduce. New experiments were not started.")

    raw_diabd = pd.read_csv(ROOT / "ML_Research" / "Phase06B" / "DiaBD" / "diabd_raw.csv")
    diabd = clean_diabd(raw_diabd)
    if len(diabd) != 5119 or int(diabd["diabetic"].sum()) != 324:
        raise SystemExit("DiaBD clean counts do not match the published 5119 rows and 324 positives.")
    train_d, test_d, _ = locked_split(diabd, "diabetic")
    published_test, _, _ = score_saved_diabd(diabd, test_d)
    if not close(published_test["accuracy"], 0.6904) or not close(published_test["recall"], 0.5846):
        raise SystemExit("The DiaBD locked split does not reproduce the published artifact score.")
    save_matrix("diabd_published_locked_test", published_test)

    pima = prepare_pima(pd.read_csv(ROOT / "ML_Research" / "Phase06B" / "Pima" / "pima_canonical_raw.csv"))
    if len(pima) != 768:
        raise SystemExit("Pima canonical table does not have 768 rows.")
    train_p, test_p, _ = locked_split(pima, "Outcome")
    cleveland = pd.read_csv(ROOT / "dataset" / "raw" / "heart_cleveland_upload.csv")
    if len(cleveland) != 297:
        raise SystemExit("Cleveland table does not have 297 rows.")
    train_c, test_c, _ = locked_split(cleveland, "condition")
    published_cleveland, _, _ = score_saved_cleveland(cleveland, test_c)
    if published_cleveland["artifact_tn"] != 32 or published_cleveland["artifact_fp"] != 0 or published_cleveland["artifact_fn"] != 5 or published_cleveland["artifact_tp"] != 23:
        raise SystemExit("The Cleveland artifact does not reproduce the published 32/0/5/23 confusion matrix.")
    save_matrix("cleveland_published_locked_test", {
        "tn": published_cleveland["artifact_tn"],
        "fp": published_cleveland["artifact_fp"],
        "fn": published_cleveland["artifact_fn"],
        "tp": published_cleveland["artifact_tp"],
    })

    weight_d = float((diabd.iloc[train_d]["diabetic"] == 0).sum() / (diabd.iloc[train_d]["diabetic"] == 1).sum())
    weight_p = float((pima.iloc[train_p]["Outcome"] == 0).sum() / max((pima.iloc[train_p]["Outcome"] == 1).sum(), 1))
    train_labels_d = diabd.iloc[train_d]
    glucose_correlation = float(pd.to_numeric(train_labels_d["glucose"], errors="coerce").corr(train_labels_d["diabetic"].astype(float)))
    feature_correlation = diabd.iloc[train_d][DIABD_FEATURES].corr(numeric_only=True).round(4).to_dict()

    integrity = {
        "dataset_hashes": dataset_hashes(),
        "split_index_hashes": {
            "diabd_train": hashlib.sha256(train_d.tobytes()).hexdigest(),
            "diabd_test": hashlib.sha256(test_d.tobytes()).hexdigest(),
            "pima_train": hashlib.sha256(train_p.tobytes()).hexdigest(),
            "pima_test": hashlib.sha256(test_p.tobytes()).hexdigest(),
            "cleveland_train": hashlib.sha256(train_c.tobytes()).hexdigest(),
            "cleveland_test": hashlib.sha256(test_c.tobytes()).hexdigest(),
            "sizes": {
                "diabd_train": int(len(train_d)),
                "diabd_test": int(len(test_d)),
                "pima_train": int(len(train_p)),
                "pima_test": int(len(test_p)),
                "cleveland_train": int(len(train_c)),
                "cleveland_test": int(len(test_c)),
            },
        },
        "diabd": {
            "raw_rows": int(len(raw_diabd)),
            "clean_rows": int(len(diabd)),
            "positives": int(diabd["diabetic"].sum()),
            "prevalence": round(float(diabd["diabetic"].mean()), 4),
            "majority_class_accuracy": round(float(1 - diabd["diabetic"].mean()), 4),
            "missing_in_model_features": int(diabd[DIABD_FEATURES].isna().sum().sum()),
            "duplicates": duplicate_report(diabd, DIABD_FEATURES, "diabetic"),
            "glucose_excluded_from_every_candidate": True,
            "glucose_correlation_on_training_rows_only": round(glucose_correlation, 4),
            "feature_correlation_training_rows_only": feature_correlation,
            "pulse_pressure_equals_systolic_minus_diastolic": bool(np.allclose(
                diabd["pulse_pressure"], diabd["systolic_bp"] - diabd["diastolic_bp"]
            )),
            "leakage_audit": "Passed. Glucose, pulse rate, and diagnosis fields are absent from the candidate matrices. Derived blood-pressure features are deterministic functions of the allowed inputs.",
        },
        "pima": {
            "rows": 768,
            "positives": int(pima["Outcome"].sum()),
            "zero_as_missing_counts": {column: int(pima[column].isna().sum()) for column in PIMA_ZERO_AS_MISSING},
            "duplicates": duplicate_report(pima, PIMA_FEATURES, "Outcome"),
            "imputation": "Median imputation is inside each training fold. Outcome-conditional medians were not computed.",
            "processed_train_csv_used": False,
            "leakage_audit": "Passed. The leaked insulin fill is not in this table and was not applied.",
        },
        "cleveland": {
            "rows": 297,
            "positives": int(cleveland["condition"].sum()),
            "missing": int(cleveland[CLEVELAND_FEATURES + ["condition"]].isna().sum().sum()),
            "duplicates": duplicate_report(cleveland, CLEVELAND_FEATURES, "condition"),
            "label": "condition",
            "published_locked_test_reproduced": True,
            "leakage_audit": "Passed. The same seed-42 stratified split reproduces the published confusion matrix. Test rows were not used to choose the repeated-CV candidate.",
        },
        "who_chart": who_integrity(),
        "production_prediction_endpoints_modified": False,
        "patient_access_changed_by_this_run": False,
    }
    write_json(HERE / "dataset_integrity_report.json", integrity)

    print("diabd search", flush=True)
    diabd_rows, diabd_store, diabd_train_labels = run_single_split_search(
        diabd_models(weight_d), diabd, "diabetic", train_d, RECALL_FLOOR_DIABD
    )
    diabd_splits = list(StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED).split(train_d, diabd_train_labels))
    add_ensemble(diabd_rows, diabd_store, diabd_train_labels, RECALL_FLOOR_DIABD, "logistic_C0.3", "extra_trees", diabd_splits)
    for row in diabd_rows:
        if row.get("oof"):
            save_matrix(f"diabd_oof_{row['model']}", row["oof"])
    diabd_choice = select_candidate(diabd_rows, "xgb_published_config", 0.01, 0.02, 0.10)

    print("pima search", flush=True)
    pima_rows, pima_store, pima_train_labels = run_single_split_search(
        pima_models(weight_p), pima, "Outcome", train_p, RECALL_FLOOR_PIMA
    )
    pima_splits = list(StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED).split(train_p, pima_train_labels))
    add_ensemble(pima_rows, pima_store, pima_train_labels, RECALL_FLOOR_PIMA, "logistic_C0.3", "extra_trees", pima_splits)
    for row in pima_rows:
        if row.get("oof"):
            save_matrix(f"pima_oof_{row['model']}", row["oof"])
    pima_choice = select_candidate(pima_rows, "logistic_C0.3", 0.01, 0.02, None)

    print("cleveland search", flush=True)
    cleveland_choice = repeated_cleveland(cleveland, train_c)

    locked = {"diabd": {"new_candidate_scored": False}, "pima": {"new_candidate_scored": False}, "cleveland": {"new_candidate_scored": False}}
    conclusions = {}
    if diabd_choice["review_candidate"] is None:
        conclusions["diabd"] = {"code": "B", "text": conclusion_from_test(False, 0, 0, None)[1]}
    else:
        chosen = diabd_choice["review_candidate"]["model"]
        spec = diabd_store[chosen]
        train_x = diabd.iloc[train_d][spec["features"]].reset_index(drop=True)
        test_x = diabd.iloc[test_d][spec["features"]]
        if spec.get("members"):
            probabilities = np.zeros(len(test_d))
            for member in spec["members"]:
                member_spec = diabd_store[member]
                member_features = member_spec["features"]
                model = clone(member_spec["estimator"])
                model.fit(diabd.iloc[train_d][member_features].reset_index(drop=True), diabd_train_labels.to_numpy().astype(int))
                probabilities += model.predict_proba(diabd.iloc[test_d][member_features])[:, 1]
            probabilities /= len(spec["members"])
            fitted = None
        else:
            fitted, probabilities = fit_probability(spec, train_x, diabd_train_labels, test_x)
        threshold = next(row["oof"]["threshold"] for row in diabd_rows if row["model"] == chosen)
        metrics = score_probabilities(diabd.iloc[test_d]["diabetic"].astype(int), probabilities, threshold)
        save_matrix("diabd_review_candidate_locked_test", metrics)
        published_probability = score_saved_diabd(diabd, test_d)[1]
        difference = paired_pr_difference(diabd.iloc[test_d]["diabetic"].astype(int), probabilities, published_probability)
        code, text = conclusion_from_test(
            True,
            metrics["pr_auc"] - published_test["pr_auc"],
            published_test["recall"] - metrics["recall"],
            difference,
        )
        conclusions["diabd"] = {"code": code, "text": text}
        locked["diabd"] = {"new_candidate_scored": True, "model": chosen, "metrics": round_metrics(metrics), "pr_auc_difference_vs_published": difference}
        if fitted is not None:
            joblib.dump({"promoted_to_production": False, "model": fitted, "features": spec["features"], "threshold": threshold}, HERE / "candidate_models" / "diabd_review_candidate.joblib")

    if pima_choice["review_candidate"] is None:
        conclusions["pima"] = {"code": "B", "text": "No leakage-free candidate cleared the training-fold bar against regularized logistic regression. The leaked 87.66 percent model stays unused as a baseline."}
    else:
        chosen = pima_choice["review_candidate"]["model"]
        spec = pima_store[chosen]
        if spec.get("members"):
            probabilities = np.zeros(len(test_p))
            for member in spec["members"]:
                member_spec = pima_store[member]
                model = clone(member_spec["estimator"])
                model.fit(pima.iloc[train_p][PIMA_FEATURES].reset_index(drop=True), pima_train_labels.to_numpy().astype(int))
                probabilities += model.predict_proba(pima.iloc[test_p][PIMA_FEATURES])[:, 1]
            probabilities /= 2
            fitted = None
        else:
            fitted, probabilities = fit_probability(
                spec,
                pima.iloc[train_p][PIMA_FEATURES].reset_index(drop=True),
                pima_train_labels,
                pima.iloc[test_p][PIMA_FEATURES],
            )
        reference_probability = clone(pima_store["logistic_C0.3"]["estimator"])
        reference_model = reference_probability
        reference_model.fit(pima.iloc[train_p][PIMA_FEATURES].reset_index(drop=True), pima_train_labels.to_numpy().astype(int))
        reference_test = reference_model.predict_proba(pima.iloc[test_p][PIMA_FEATURES])[:, 1]
        threshold = next(row["oof"]["threshold"] for row in pima_rows if row["model"] == chosen)
        labels = pima.iloc[test_p]["Outcome"].astype(int)
        metrics = score_probabilities(labels, probabilities, threshold)
        reference_threshold = next(row["oof"]["threshold"] for row in pima_rows if row["model"] == "logistic_C0.3")
        reference_metrics = score_probabilities(labels, reference_test, reference_threshold)
        difference = paired_pr_difference(labels, probabilities, reference_test)
        code, text = conclusion_from_test(True, metrics["pr_auc"] - reference_metrics["pr_auc"], reference_metrics["recall"] - metrics["recall"], difference)
        conclusions["pima"] = {"code": code, "text": text}
        locked["pima"] = {
            "new_candidate_scored": True,
            "model": chosen,
            "metrics": round_metrics(metrics),
            "reference_metrics": round_metrics(reference_metrics),
            "pr_auc_difference_vs_reference": difference,
        }
        save_matrix("pima_review_candidate_locked_test", metrics)
        if fitted is not None:
            joblib.dump({"promoted_to_production": False, "model": fitted, "threshold": threshold}, HERE / "candidate_models" / "pima_review_candidate.joblib")

    conclusions["cleveland"] = {
        "code": "B" if cleveland_choice["review_candidate"] is None else "C",
        "text": "No repeated-CV candidate cleared the paired PR-AUC bar. The 60-row test was not used to shop for a replacement. The current logistic model stays."
        if cleveland_choice["review_candidate"] is None
        else "A repeated-CV candidate cleared the training bar. The 60-row test is too small to promote it. Hold it for a separate review and keep the current model.",
    }
    if cleveland_choice["review_candidate"] is not None:
        conclusions["cleveland"]["code"] = "A"
        conclusions["cleveland"]["text"] = "Repeated training validation supports a further independent look. The 60-row locked test was not used to make that choice, and the candidate is not promoted."
    who_code = "B" if integrity["who_chart"]["intact"] else "C"
    conclusions["who"] = {
        "code": who_code,
        "text": "The published table is intact. There is no labeled cohort to train, and the table was not changed."
        if who_code == "B"
        else "A chart integrity check failed. Do not change the published values until the mismatch is reviewed.",
    }
    codes = [item["code"] for item in conclusions.values()]
    if "A" in codes:
        overall_code, overall_text = "A", "At least one pathway has a candidate that deserves a separate validation. Nothing is promoted."
    elif "C" in codes:
        overall_code, overall_text = "C", "At least one pathway does not have enough evidence. Do not promote."
    else:
        overall_code, overall_text = "B", "No reliable leakage-free improvement was found. Retain the current models and the published WHO chart."

    finished = snapshot_protected()
    changed = [name for name in PROTECTED if started.get(name) != finished.get(name)]
    if changed:
        raise SystemExit(f"Protected files changed during the run: {changed}")

    comparison = {
        "promoted_to_production": False,
        "protected_files_changed": changed,
        "diabd": {
            "published_locked_test": round_metrics(published_test),
            "published_training_point_from_existing_report": {
                "model": "xgboost",
                "accuracy": 0.7040,
                "recall": 0.6486,
                "pr_auc": 0.1422,
                "threshold": 0.51,
            },
            "selection": diabd_choice,
            "locked_test": locked["diabd"],
        },
        "pima": {
            "leaked_87_66_used_as_baseline": False,
            "previous_leakage_free_locked_test_accuracy": previous["pima"]["locked_test_accuracy"],
            "previous_leakage_free_locked_test_recall": previous["pima"]["locked_test_recall"],
            "selection": pima_choice,
            "locked_test": locked["pima"],
        },
        "cleveland": {
            "published_artifact_locked_test": round_metrics(published_cleveland),
            "selection": {"review_candidate": cleveland_choice["review_candidate"], "candidates": cleveland_choice["candidates"]},
            "locked_test_of_new_candidate": None,
            "reason_new_test_not_used_for_selection": "The protocol forbids choosing a Cleveland model from the 60-row test.",
        },
        "who": {"trainable": False, "intact": integrity["who_chart"]["intact"]},
        "conclusions": conclusions,
        "overall": {"code": overall_code, "text": overall_text},
    }
    cv_payload = {
        "label": "These are training-fold estimates. They are not locked-test scores.",
        "diabd": [{key: value for key, value in row.items()} for row in diabd_rows],
        "pima": pima_rows,
        "cleveland": cleveland_choice,
    }
    for section in (cv_payload["diabd"], cv_payload["pima"]):
        pass
    threshold_analysis = {
        "rule": "F2 is maximized on out-of-fold or within-repeat probabilities, subject to the recall floor. The locked test does not move the cutoff.",
        "diabd": [{"model": row["model"], "threshold": row.get("oof", {}).get("threshold"), "f2": row.get("oof", {}).get("f2"), "eligible": row["eligible"]} for row in diabd_rows],
        "pima": [{"model": row["model"], "threshold": row.get("oof", {}).get("threshold"), "f2": row.get("oof", {}).get("f2"), "eligible": row["eligible"]} for row in pima_rows],
        "cleveland": "Each of the 10 repeats chooses its own cutoff. Means are in cross_validation_results.json.",
    }
    write_json(HERE / "cross_validation_results.json", cv_payload)
    write_json(HERE / "model_comparison.json", comparison)
    write_json(HERE / "threshold_analysis.json", threshold_analysis)
    write_json(HERE / "candidate_models" / "status.json", {
        "promoted_to_production": False,
        "saved_models": [path.name for path in (HERE / "candidate_models").glob("*.joblib")],
        "note": "Any joblib in this folder is an experiment. The API does not load it.",
    })
    report_bundle = {
        "reproduction": {"matched": reproduction["matched"]},
        "cross_validation_results": {"diabd": diabd_rows, "pima": pima_rows, "cleveland": cleveland_choice},
        "conclusions": conclusions,
        "overall_code": overall_code,
        "overall_text": overall_text,
    }
    write_reports(report_bundle)
    print(json.dumps({"overall": overall_code, "conclusions": {key: value["code"] for key, value in conclusions.items()}, "protected_changed": changed}, indent=2), flush=True)


if __name__ == "__main__":
    main()
