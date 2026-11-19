# -*- coding: utf-8 -*-
"""Track A: Pima Leakage-Free Research Pipeline.

Trains and evaluates leakage-free pipelines on canonical Pima data.
Precludes target conditioning: imputers and scalers are fit strictly on training splits.
Computes 95% bootstrap confidence intervals, Brier scores, and compares with historical metrics.
"""
import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.impute import SimpleImputer, KNNImputer
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import (
    roc_auc_score,
    average_precision_score,
    accuracy_score,
    recall_score,
    precision_score,
    f1_score,
    confusion_matrix,
    brier_score_loss,
)

PROJECT_ROOT = r"c:\Users\TANVIRHOSENNISHAT\Desktop\TriNexus Project\TriNexus-VitaGuard-AI-Cursor-Backup"
RESEARCH_DIR = os.path.join(PROJECT_ROOT, "ML_Research/Phase06B")
PIMA_DIR = os.path.join(RESEARCH_DIR, "Pima")
ARTIFACTS_DIR = os.path.join(RESEARCH_DIR, "Artifacts")
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

# 1. Load canonical raw data
raw_path = os.path.join(PIMA_DIR, "pima_canonical_raw.csv")
df = pd.read_csv(raw_path)

# 2. Biological zero replacement to NaN (ONLY for valid physiological variables)
zero_cols = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
df_clean = df.copy()
for col in zero_cols:
    df_clean[col] = df_clean[col].replace(0, np.nan)

# Target separation
target_col = 'Outcome'
X = df_clean.drop(columns=[target_col])
y = df_clean[target_col]

# 3. Stratified 80/20 train/test split (Sealed test set: 154 rows)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)
print(f"[+] Partitioned data: Train={X_train.shape[0]} rows (pos={y_train.sum()}), Test={X_test.shape[0]} rows (pos={y_test.sum()})")

# 4. Cross-Validation Experiments on Training Set Only
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

imputation_strategies = {
    "median": SimpleImputer(strategy="median"),
    "mean": SimpleImputer(strategy="mean"),
    "knn5": KNNImputer(n_neighbors=5),
}

model_configs = {
    "LogisticRegression": lambda: LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42),
    "RandomForest": lambda: RandomForestClassifier(n_estimators=200, max_depth=5, class_weight="balanced", random_state=42),
    "XGBoost": lambda: XGBClassifier(n_estimators=100, max_depth=3, learning_rate=0.05, eval_metric="logloss", random_state=42),
}

cv_results = {}

print("\n--- Running 5-Fold Stratified CV across Imputation & Model Combinations ---")
for imp_name, imputer in imputation_strategies.items():
    for model_name, model_fn in model_configs.items():
        pipe = Pipeline([
            ("imputer", imputer),
            ("scaler", StandardScaler()),
            ("model", model_fn())
        ])
        
        fold_aurocs = []
        fold_auprcs = []
        fold_accs = []
        fold_recalls = []
        fold_f1s = []
        
        for train_idx, val_idx in cv.split(X_train, y_train):
            X_tr, y_tr = X_train.iloc[train_idx], y_train.iloc[train_idx]
            X_val, y_val = X_train.iloc[val_idx], y_train.iloc[val_idx]
            
            pipe.fit(X_tr, y_tr)
            y_val_prob = pipe.predict_proba(X_val)[:, 1]
            y_val_pred = (y_val_prob >= 0.50).astype(int)
            
            fold_aurocs.append(roc_auc_score(y_val, y_val_prob))
            fold_auprcs.append(average_precision_score(y_val, y_val_prob))
            fold_accs.append(accuracy_score(y_val, y_val_pred))
            fold_recalls.append(recall_score(y_val, y_val_pred, zero_division=0))
            fold_f1s.append(f1_score(y_val, y_val_pred, zero_division=0))
            
        key = f"{imp_name}_{model_name}"
        cv_results[key] = {
            "imputation": imp_name,
            "model": model_name,
            "mean_auroc": float(np.mean(fold_aurocs)),
            "std_auroc": float(np.std(fold_aurocs)),
            "mean_auprc": float(np.mean(fold_auprcs)),
            "mean_accuracy": float(np.mean(fold_accs)),
            "mean_recall": float(np.mean(fold_recalls)),
            "mean_f1": float(np.mean(fold_f1s)),
        }
        print(f"[{key}] CV AUROC: {np.mean(fold_aurocs):.4f} +/- {np.std(fold_aurocs):.4f} | Recall: {np.mean(fold_recalls):.4f} | F1: {np.mean(fold_f1s):.4f}")

# 5. Champion Selection on CV and Single Test Set Evaluation
best_config_name = max(cv_results, key=lambda k: cv_results[k]["mean_auroc"])
best_imp = cv_results[best_config_name]["imputation"]
best_mod = cv_results[best_config_name]["model"]
print(f"\n[+] Champion Research Pipeline on Training CV: {best_config_name}")

champion_pipe = Pipeline([
    ("imputer", imputation_strategies[best_imp]),
    ("scaler", StandardScaler()),
    ("model", model_configs[best_mod]())
])

# Fit on ALL 614 training rows
champion_pipe.fit(X_train, y_train)

# Evaluate on the SEALED test set (154 rows) ONCE
y_test_prob = champion_pipe.predict_proba(X_test)[:, 1]
y_test_pred = (y_test_prob >= 0.50).astype(int)

# Specificity & NPV helper
tn, fp, fn, tp = confusion_matrix(y_test, y_test_pred).ravel()
spec = tn / (tn + fp) if (tn + fp) > 0 else 0.0
npv = tn / (tn + fn) if (tn + fn) > 0 else 0.0
brier = brier_score_loss(y_test, y_test_prob)

# 6. Bootstrap 95% Confidence Intervals (1000 iterations)
np.random.seed(42)
n_boot = 1000
boot_aurocs = []
boot_accs = []
boot_recalls = []
boot_specs = []
boot_briers = []

for _ in range(n_boot):
    idx = np.random.randint(0, len(y_test), len(y_test))
    if len(np.unique(y_test.iloc[idx])) < 2:
        continue
    y_b_true = y_test.iloc[idx]
    y_b_prob = y_test_prob[idx]
    y_b_pred = y_test_pred[idx]
    
    b_tn, b_fp, b_fn, b_tp = confusion_matrix(y_b_true, y_b_pred, labels=[0, 1]).ravel()
    
    boot_aurocs.append(roc_auc_score(y_b_true, y_b_prob))
    boot_accs.append(accuracy_score(y_b_true, y_b_pred))
    boot_recalls.append(recall_score(y_b_true, y_b_pred, zero_division=0))
    boot_specs.append(b_tn / (b_tn + b_fp) if (b_tn + b_fp) > 0 else 0.0)
    boot_briers.append(brier_score_loss(y_b_true, y_b_prob))

final_test_metrics = {
    "auroc": {
        "point": round(float(roc_auc_score(y_test, y_test_prob)), 4),
        "ci95": [round(float(np.percentile(boot_aurocs, 2.5)), 4), round(float(np.percentile(boot_aurocs, 97.5)), 4)]
    },
    "auprc": {
        "point": round(float(average_precision_score(y_test, y_test_prob)), 4),
    },
    "accuracy": {
        "point": round(float(accuracy_score(y_test, y_test_pred)), 4),
        "ci95": [round(float(np.percentile(boot_accs, 2.5)), 4), round(float(np.percentile(boot_accs, 97.5)), 4)]
    },
    "sensitivity_recall": {
        "point": round(float(recall_score(y_test, y_test_pred)), 4),
        "ci95": [round(float(np.percentile(boot_recalls, 2.5)), 4), round(float(np.percentile(boot_recalls, 97.5)), 4)]
    },
    "specificity": {
        "point": round(float(spec), 4),
        "ci95": [round(float(np.percentile(boot_specs, 2.5)), 4), round(float(np.percentile(boot_specs, 97.5)), 4)]
    },
    "precision_ppv": {
        "point": round(float(precision_score(y_test, y_test_pred, zero_division=0)), 4)
    },
    "npv": {
        "point": round(float(npv), 4)
    },
    "f1_score": {
        "point": round(float(f1_score(y_test, y_test_pred)), 4)
    },
    "brier_score": {
        "point": round(float(brier), 4),
        "ci95": [round(float(np.percentile(boot_briers, 2.5)), 4), round(float(np.percentile(boot_briers, 97.5)), 4)]
    },
    "confusion_matrix": {
        "tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)
    }
}

# 7. Comparison with Historical Leaked Metrics
historical_metrics = {
    "auroc": 0.9519,
    "accuracy": 0.8766,
    "f1_score": 0.8252,
    "precision": 0.8039,
    "recall": 0.8478
}

comparison = {
    "metric": ["AUROC", "Accuracy", "Recall", "Precision", "F1-Score"],
    "historical_leaked": [0.9519, 0.8766, 0.8478, 0.8039, 0.8252],
    "corrected_leakage_free": [
        final_test_metrics["auroc"]["point"],
        final_test_metrics["accuracy"]["point"],
        final_test_metrics["sensitivity_recall"]["point"],
        final_test_metrics["precision_ppv"]["point"],
        final_test_metrics["f1_score"]["point"],
    ],
    "inflation_delta": [
        round(0.9519 - final_test_metrics["auroc"]["point"], 4),
        round(0.8766 - final_test_metrics["accuracy"]["point"], 4),
        round(0.8478 - final_test_metrics["sensitivity_recall"]["point"], 4),
        round(0.8039 - final_test_metrics["precision_ppv"]["point"], 4),
        round(0.8252 - final_test_metrics["f1_score"]["point"], 4),
    ]
}

# 8. Save Research Artifacts
artifact_pkg = {
    "pipeline": champion_pipe,
    "features": list(X.columns),
    "imputation_strategy": best_imp,
    "model_name": best_mod,
    "test_metrics": final_test_metrics,
    "comparison": comparison,
    "cv_results": cv_results
}

research_artifact_path = os.path.join(ARTIFACTS_DIR, "pima_leakage_free_pipeline.pkl")
joblib.dump(artifact_pkg, research_artifact_path)

summary_json_path = os.path.join(PIMA_DIR, "pima_experiment_summary.json")
with open(summary_json_path, "w", encoding="utf-8") as f:
    json.dump({
        "cv_results": cv_results,
        "champion": best_config_name,
        "test_metrics": final_test_metrics,
        "historical_comparison": comparison
    }, f, indent=2)

print("\n=== CORRECTED PIMA TEST METRICS (LEAKAGE-FREE) ===")
print(f"AUROC           : {final_test_metrics['auroc']['point']} (95% CI: {final_test_metrics['auroc']['ci95']})")
print(f"Accuracy        : {final_test_metrics['accuracy']['point']} (95% CI: {final_test_metrics['accuracy']['ci95']})")
print(f"Sensitivity     : {final_test_metrics['sensitivity_recall']['point']} (95% CI: {final_test_metrics['sensitivity_recall']['ci95']})")
print(f"Specificity     : {final_test_metrics['specificity']['point']} (95% CI: {final_test_metrics['specificity']['ci95']})")
print(f"Brier Score     : {final_test_metrics['brier_score']['point']} (95% CI: {final_test_metrics['brier_score']['ci95']})")
print(f"\nHistorical Leakage Inflation Delta:")
for m, h, c, d in zip(comparison['metric'], comparison['historical_leaked'], comparison['corrected_leakage_free'], comparison['inflation_delta']):
    print(f"  {m:12s}: Historical={h:.4f} -> Corrected={c:.4f} (Inflation: +{d*100:.2f}%)")

print(f"\nSaved research pipeline to {research_artifact_path}")
print(f"Saved experiment summary to {summary_json_path}")
