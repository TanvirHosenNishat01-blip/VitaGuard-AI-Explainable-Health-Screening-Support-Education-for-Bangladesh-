"""Choose a model from training folds only, then score the locked test once.

The held-out files are not used to pick a winner. A candidate replaces the
current model only when its training-fold accuracy is higher and its
training-fold recall does not fall by more than 0.02.
"""
import json
from pathlib import Path

import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, recall_score, roc_auc_score
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

ROOT = Path(__file__).resolve().parents[1]
FOLDS = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)


def positive_weight(y_values):
    negatives = int((y_values == 0).sum())
    positives = int((y_values == 1).sum())
    return float(negatives / max(positives, 1))


def fold_scores(estimator, x_values, y_values):
    scores = cross_validate(
        estimator,
        x_values,
        y_values,
        cv=FOLDS,
        scoring={"accuracy": "accuracy", "recall": "recall", "roc_auc": "roc_auc"},
        n_jobs=-1,
    )
    return {
        "accuracy": round(float(scores["test_accuracy"].mean()), 4),
        "recall": round(float(scores["test_recall"].mean()), 4),
        "roc_auc": round(float(scores["test_roc_auc"].mean()), 4),
    }


def locked_test(estimator, x_train, y_train, x_test, y_test):
    estimator.fit(x_train, y_train)
    predictions = estimator.predict(x_test)
    probabilities = estimator.predict_proba(x_test)[:, 1]
    return {
        "accuracy": round(float(accuracy_score(y_test, predictions)), 4),
        "recall": round(float(recall_score(y_test, predictions)), 4),
        "roc_auc": round(float(roc_auc_score(y_test, probabilities)), 4),
        "correct": int((predictions == y_test).sum()),
        "rows": int(len(y_test)),
    }


def diabetes_candidates():
    train = pd.read_csv(ROOT / "dataset" / "processed" / "train.csv")
    test = pd.read_csv(ROOT / "dataset" / "processed" / "test.csv")
    x_train = train.drop(columns=["Outcome"])
    y_train = train["Outcome"]
    weight = positive_weight(y_train)
    candidates = {
        "xgboost_current": XGBClassifier(
            n_estimators=200, max_depth=3, learning_rate=0.01,
            scale_pos_weight=weight, eval_metric="logloss", random_state=42,
        ),
        "logistic": LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42),
        "random_forest": RandomForestClassifier(
            n_estimators=200, max_depth=5, min_samples_split=5,
            class_weight="balanced", random_state=42,
        ),
        "hist_gradient": HistGradientBoostingClassifier(
            learning_rate=0.05, max_depth=3, random_state=42,
        ),
    }
    return candidates, x_train, y_train, test.drop(columns=["Outcome"]), test["Outcome"]


def heart_candidates():
    frame = pd.read_csv(ROOT / "dataset" / "raw" / "heart_cleveland_upload.csv")
    features = ["age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"]
    from sklearn.model_selection import train_test_split
    x_train, x_test, y_train, y_test = train_test_split(
        frame[features], frame["condition"].astype(int), test_size=0.2, random_state=42,         stratify=frame["condition"],
    )
    weight = positive_weight(y_train)
    candidates = {
        "random_forest_current": Pipeline([
            ("scale", StandardScaler()),
            ("model", RandomForestClassifier(n_estimators=200, max_depth=6, class_weight="balanced", random_state=42)),
        ]),
        "logistic": Pipeline([
            ("scale", StandardScaler()),
            ("model", LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42)),
        ]),
        "xgboost": Pipeline([
            ("scale", StandardScaler()),
            ("model", XGBClassifier(
                n_estimators=200, max_depth=3, learning_rate=0.05,
                scale_pos_weight=weight, eval_metric="logloss", random_state=42,
            )),
        ]),
    }
    return candidates, x_train, y_train, x_test, y_test


def report(title, candidates, x_train, y_train, x_test, y_test, current_name):
    rows = []
    for name, estimator in candidates.items():
        scores = fold_scores(estimator, x_train, y_train)
        scores["name"] = name
        rows.append(scores)
        print(f"{title} CV {name}: {scores}")
    current = next(row for row in rows if row["name"] == current_name)
    eligible = [
        row for row in rows
        if row["accuracy"] > current["accuracy"] and row["recall"] >= current["recall"] - 0.02
    ]
    winner_name = max(eligible, key=lambda row: (row["accuracy"], row["roc_auc"]))["name"] if eligible else current_name
    print(f"{title} selected_by_training_folds: {winner_name}")
    test_scores = locked_test(candidates[winner_name], x_train, y_train, x_test, y_test)
    print(f"{title} locked_test_once: {json.dumps(test_scores)}")


if __name__ == "__main__":
    report("diabetes", *diabetes_candidates(), "xgboost_current")
    report("heart", *heart_candidates(), "random_forest_current")
