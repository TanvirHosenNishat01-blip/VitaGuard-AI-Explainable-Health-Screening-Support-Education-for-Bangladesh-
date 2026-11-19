"""Train the heart model chosen on training folds, then score the locked test once.

Logistic regression won the training-fold comparison against the previous
forest and XGBoost: higher accuracy and higher recall. Do not pick a new
model by looking at this test score.
"""
import json
from pathlib import Path
import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "dataset" / "raw" / "heart_cleveland_upload.csv"
MODEL_DIR = Path(__file__).resolve().parent / "app" / "ml_models"
FEATURES = ["age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"]

frame = pd.read_csv(DATA)
x_train, x_test, y_train, y_test = train_test_split(
    frame[FEATURES], frame["condition"].astype(int), test_size=0.2, random_state=42, stratify=frame["condition"]
)
scaler = StandardScaler()
model = LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42)
model.fit(scaler.fit_transform(x_train), y_train)
probabilities = model.predict_proba(scaler.transform(x_test))[:, 1]
predictions = model.predict(scaler.transform(x_test))
report = {
    "dataset": "heart_cleveland_upload.csv",
    "rows": int(len(frame)),
    "train_rows": int(len(x_train)),
    "test_rows": int(len(x_test)),
    "model": "LogisticRegression",
    "split": "Stratified 80/20 holdout, random_state 42",
    "features": FEATURES,
    "model_settings": "LogisticRegression class_weight=balanced, max_iter=1000, StandardScaler fit on train only",
    "selection_rule": "Highest training-fold accuracy among the current forest, logistic regression, and XGBoost, with recall allowed to fall by at most 0.02. The locked test was scored once after that choice.",
    "note": "Public Cleveland-style table. Not validated on patients in Bangladesh. Replaces the earlier RandomForest, which had locked-test accuracy 0.8667 and recall 0.7143.",
    "compared_with": {
        "model": "RandomForest",
        "accuracy": 0.8667,
        "roc_auc": 0.9654,
        "recall": 0.7143,
        "training_fold_accuracy": 0.7808,
        "training_fold_recall": 0.7446,
    },
    "test_metrics": {
        "accuracy": round(float(accuracy_score(y_test, predictions)), 4),
        "roc_auc": round(float(roc_auc_score(y_test, probabilities)), 4),
        "f1_score": round(float(f1_score(y_test, predictions)), 4),
        "precision": round(float(precision_score(y_test, predictions)), 4),
        "recall": round(float(recall_score(y_test, predictions)), 4),
        "confusion_matrix": {
            "labels": ["actual_negative", "actual_positive"],
            "matrix": confusion_matrix(y_test, predictions).tolist(),
        },
    },
}
MODEL_DIR.mkdir(parents=True, exist_ok=True)
joblib.dump(model, MODEL_DIR / "cardio_model.joblib")
joblib.dump(scaler, MODEL_DIR / "cardio_scaler.joblib")
(ROOT / "ML_Model" / "evaluation" / "cardio_metrics.json").write_text(json.dumps(report, indent=4), encoding="utf-8")
print(json.dumps(report["test_metrics"], indent=2))
