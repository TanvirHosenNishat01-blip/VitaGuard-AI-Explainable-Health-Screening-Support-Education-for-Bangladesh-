"""DiaBD screening model, following an end-to-end classification workflow.

Steps, in order: frame the problem, acquire the CSV, split, explore only the
training rows, prepare features in a pipeline, select and fine-tune on
training folds, then score the held-out test once.

Glucose is not an input. A candidate replaces the published model only when
its training-fold accuracy is at least 0.5 points higher and its training-fold
recall stays at or above 0.648. That floor is the first logistic model minus 0.02.
"""
import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import ExtraTreesClassifier, HistGradientBoostingClassifier, RandomForestClassifier
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
from sklearn.model_selection import GridSearchCV, RandomizedSearchCV, StratifiedKFold, cross_val_predict, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from xgboost import XGBClassifier

DATA = Path(r"C:\Users\TANVIRHOSENNISHAT\Downloads\DiaBD_A Diabetes Dataset for Enhanced Risk Analysis and Research in Bangladesh (2).csv")
MODEL_DIR = Path(__file__).resolve().parent / "app" / "ml_models"
OUT = Path(__file__).resolve().parents[1] / "ML_Model" / "evaluation" / "bd_diabetes_metrics.json"
BASE_FEATURES = ["age", "sex", "bmi", "systolic_bp", "diastolic_bp", "family_diabetes"]
MODEL_FEATURES = BASE_FEATURES + ["pulse_pressure", "high_bp"]
FOLDS = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
RECALL_FLOOR = 0.648
MIN_ACCURACY_GAIN = 0.005


def clean(frame):
    work = frame.copy()
    work["sex"] = work["gender"].str.strip().map({"Female": 0, "Male": 1})
    for column in ["age", "bmi", "systolic_bp", "diastolic_bp", "height", "weight", "family_diabetes", "glucose"]:
        work[column] = pd.to_numeric(work[column], errors="coerce")
    work["diabetic"] = work["diabetic"].str.strip().map({"Yes": 1, "No": 0})
    expected = work["weight"] / (work["height"] ** 2)
    bmi_gap = (work["bmi"] - expected).abs() / expected.replace(0, pd.NA)
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
        & bmi_gap.le(0.15)
    )
    return work.loc[keep].reset_index(drop=True)


def design(frame, feature_names):
    work = frame.copy()
    work["pulse_pressure"] = work["systolic_bp"] - work["diastolic_bp"]
    work["high_bp"] = ((work["systolic_bp"] >= 140) | (work["diastolic_bp"] >= 90)).astype(int)
    return work[feature_names]


def explore(train):
    columns = BASE_FEATURES + ["glucose", "diabetic"]
    correlation = train[columns].corr(numeric_only=True)["diabetic"].drop("diabetic")
    return {
        "train_rows": int(len(train)),
        "positive_rate": round(float(train["diabetic"].mean()), 4),
        "missing_in_model_inputs": int(train[BASE_FEATURES].isna().sum().sum()),
        "correlation_with_label": {key: round(float(value), 4) for key, value in correlation.items()},
        "glucose_note": "Glucose correlation is reported from the training rows and the column stays excluded.",
    }


def oof_probabilities(estimator, x_train, y_train):
    return cross_val_predict(estimator, x_train, y_train, cv=FOLDS, method="predict_proba", n_jobs=-1)[:, 1]


def best_point(name, feature_names, probabilities, y_train, fitted):
    pr_auc = float(average_precision_score(y_train, probabilities))
    eligible = []
    for step in range(2, 99):
        threshold = step / 100
        predictions = probabilities >= threshold
        recall = float(recall_score(y_train, predictions, zero_division=0))
        if recall < RECALL_FLOOR:
            continue
        eligible.append((float(accuracy_score(y_train, predictions)), recall, -threshold))
    if not eligible:
        return None
    accuracy, recall, negative_threshold = max(eligible)
    return {
        "model": name,
        "features": feature_names,
        "threshold": -negative_threshold,
        "accuracy": accuracy,
        "recall": recall,
        "pr_auc": pr_auc,
        "fitted": fitted,
    }


def tune(name, estimator, space, x_train, y_train, n_iter=None):
    search_type = GridSearchCV if n_iter is None else RandomizedSearchCV
    options = {
        "estimator": estimator,
        "param_grid" if n_iter is None else "param_distributions": space,
        "scoring": "average_precision",
        "cv": FOLDS,
        "n_jobs": -1,
        "refit": True,
    }
    if n_iter is not None:
        options["n_iter"] = n_iter
        options["random_state"] = 42
    search = search_type(**options)
    search.fit(x_train, y_train)
    probabilities = oof_probabilities(search.best_estimator_, x_train, y_train)
    point = best_point(name, list(x_train.columns), probabilities, y_train, search.best_estimator_)
    params = {key: (value.item() if hasattr(value, "item") else value) for key, value in search.best_params_.items()}
    print(json.dumps({
        "tuned": name,
        "cv_pr_auc": None if point is None else round(point["pr_auc"], 4),
        "train_accuracy": None if point is None else round(point["accuracy"], 4),
        "train_recall": None if point is None else round(point["recall"], 4),
        "threshold": None if point is None else point["threshold"],
        "params": params,
    }), flush=True)
    if point is not None:
        point["params"] = params
    return point


def main():
    raw = pd.read_csv(DATA)
    frame = clean(raw)
    y = frame["diabetic"].astype(int)
    index_train, index_test = train_test_split(frame.index, test_size=0.2, random_state=42, stratify=y)
    train = frame.loc[index_train]
    y_train = y.loc[index_train]
    exploration = explore(train)
    print(json.dumps({"step": "explore_training_only", **exploration}, indent=2), flush=True)

    positive = int((y_train == 1).sum())
    negative = int((y_train == 0).sum())
    weight = negative / max(positive, 1)
    base_x = design(train, BASE_FEATURES)
    model_x = design(train, MODEL_FEATURES)
    published = RandomForestClassifier(
        n_estimators=300, max_depth=5, min_samples_leaf=10, class_weight="balanced", random_state=42,
    )
    published_probabilities = oof_probabilities(published, base_x, y_train)
    bar = best_point("published_random_forest", BASE_FEATURES, published_probabilities, y_train, published)
    print(json.dumps({
        "published_training_accuracy": round(bar["accuracy"], 4),
        "published_training_recall": round(bar["recall"], 4),
        "recall_floor": RECALL_FLOOR,
        "required_training_accuracy": round(bar["accuracy"] + MIN_ACCURACY_GAIN, 4),
    }), flush=True)

    points = [tune(
        "logistic_interactions",
        Pipeline([
            ("poly", PolynomialFeatures(degree=2, interaction_only=True, include_bias=False)),
            ("scale", StandardScaler()),
            ("model", LogisticRegression(class_weight="balanced", max_iter=2000, random_state=42)),
        ]),
        {"model__C": [0.01, 0.03, 0.1, 0.3, 1, 3, 10]},
        base_x,
        y_train,
    )]
    points.append(tune(
        "random_forest",
        RandomForestClassifier(random_state=42, n_jobs=1),
        {
            "n_estimators": [300, 600],
            "max_depth": [4, 6, 8, 12],
            "min_samples_leaf": [5, 15, 30],
            "max_features": ["sqrt", 0.6],
            "class_weight": ["balanced", "balanced_subsample"],
        },
        model_x,
        y_train,
        n_iter=20,
    ))
    points.append(tune(
        "extra_trees",
        ExtraTreesClassifier(random_state=42, n_jobs=1),
        {
            "n_estimators": [300, 600],
            "max_depth": [4, 8, 12],
            "min_samples_leaf": [5, 15, 30],
            "max_features": ["sqrt", 0.6],
            "class_weight": ["balanced"],
        },
        model_x,
        y_train,
        n_iter=12,
    ))
    points.append(tune(
        "hist_gradient_boosting",
        HistGradientBoostingClassifier(class_weight="balanced", random_state=42),
        {
            "learning_rate": [0.03, 0.08],
            "max_depth": [2, 3, 5],
            "max_iter": [200, 400],
            "min_samples_leaf": [20, 50],
            "l2_regularization": [0.1, 1.0, 10.0],
        },
        model_x,
        y_train,
        n_iter=16,
    ))
    points.append(tune(
        "xgboost",
        XGBClassifier(
            objective="binary:logistic", eval_metric="logloss", random_state=42, n_jobs=1,
        ),
        {
            "n_estimators": [200, 400],
            "max_depth": [2, 3, 4],
            "learning_rate": [0.03, 0.08],
            "min_child_weight": [10, 30],
            "subsample": [0.8, 1.0],
            "colsample_bytree": [0.8, 1.0],
            "reg_lambda": [1, 10],
            "scale_pos_weight": [weight],
        },
        model_x,
        y_train,
        n_iter=16,
    ))
    eligible = [point for point in points if point is not None]
    winner = max(eligible, key=lambda item: (item["accuracy"], item["recall"], item["pr_auc"], -item["threshold"]))
    print(json.dumps({
        "winner": winner["model"],
        "train_accuracy": round(winner["accuracy"], 4),
        "train_recall": round(winner["recall"], 4),
        "threshold": winner["threshold"],
        "beats_published": winner["accuracy"] >= bar["accuracy"] + MIN_ACCURACY_GAIN,
    }), flush=True)
    if winner["accuracy"] < bar["accuracy"] + MIN_ACCURACY_GAIN:
        print("unchanged")
        return

    feature_names = winner["features"]
    model = winner["fitted"]
    test_x = design(frame.loc[index_test], feature_names)
    y_test = y.loc[index_test]
    probabilities = model.predict_proba(test_x)[:, 1]
    predictions = (probabilities >= winner["threshold"]).astype(int)
    matrix = confusion_matrix(y_test, predictions, labels=[0, 1]).tolist()
    report = {
        "dataset": "DiaBD",
        "source": "Mendeley 10.17632/m8cgwxs9s6, CC BY 4.0",
        "population": "63 Bangladesh unions, women and men, ages 21 to 80. Not a national sample and not WHO STEPS.",
        "problem": "Supervised classification. The target is the published DiaBD diabetes label. The screen uses basic inputs only.",
        "workflow": [
            "Split 80/20 before exploration",
            "Explore training rows only",
            "Prepare derived blood-pressure features and a preprocessing pipeline",
            "Fine-tune on stratified training folds with average precision",
            "Choose the cutoff on those folds under the recall floor",
            "Score the held-out test once",
        ],
        "training_exploration": exploration,
        "raw_rows": int(len(raw)),
        "clean_rows": int(len(frame)),
        "clean_positive": int(y.sum()),
        "train_rows": int(len(index_train)),
        "test_rows": int(len(index_test)),
        "features": feature_names,
        "excluded_inputs": ["glucose", "pulse_rate", "hypertensive", "family_hypertension", "cardiovascular_disease", "stroke"],
        "exclusion_reason": "Glucose is a laboratory value and is associated with the diabetes label. Pulse and diagnosis fields are not part of this basic screening.",
        "selection_rule": "Replace the published model only when training-fold accuracy gains at least 0.5 points and training-fold recall stays at or above 0.648. The cutoff is chosen on training folds. The test is scored once.",
        "selected_training_point": {
            "model": winner["model"],
            "threshold": winner["threshold"],
            "accuracy": winner["accuracy"],
            "recall": winner["recall"],
            "pr_auc": winner["pr_auc"],
            "params": winner["params"],
        },
        "selected_model": type(model).__name__ if not isinstance(model, Pipeline) else "LogisticRegression",
        "threshold": winner["threshold"],
        "test_metrics": {
            "accuracy": float(accuracy_score(y_test, predictions)),
            "precision": float(precision_score(y_test, predictions, zero_division=0)),
            "recall": float(recall_score(y_test, predictions, zero_division=0)),
            "f1": float(f1_score(y_test, predictions, zero_division=0)),
            "roc_auc": float(roc_auc_score(y_test, probabilities)),
            "pr_auc": float(average_precision_score(y_test, probabilities)),
            "majority_no_accuracy": float((y_test == 0).mean()),
        },
        "confusion_matrix": matrix,
        "note": "This is a screening estimate on cleaned DiaBD rows. It is not a diagnosis and not a national Bangladesh accuracy.",
    }
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": model, "scaler": None, "features": feature_names, "threshold": winner["threshold"]}, MODEL_DIR / "bd_diabetes.joblib")
    OUT.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps({"test": report["test_metrics"], "matrix": matrix}, indent=2), flush=True)


if __name__ == "__main__":
    main()
