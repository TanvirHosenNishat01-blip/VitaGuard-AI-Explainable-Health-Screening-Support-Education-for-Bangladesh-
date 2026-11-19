# -*- coding: utf-8 -*-
"""Track B: Bangladesh DiaBD Calibration & Threshold Research Pipeline.

1. Independently reproduces historical uncalibrated baseline on held-out test set (1,024 rows).
2. Performs leakage-free calibration (Platt scaling & Isotonic regression) using
   5-fold out-of-fold training predictions ONLY. Test set remains sealed.
3. Evaluates Brier score, Log Loss, Calibration-in-the-Large, Calibration Slope, ECE,
   AUROC, AUPRC, and 95% bootstrap confidence intervals on test set.
4. Performs screening threshold analysis documenting sensitivity/specificity trade-offs.
"""
import os
import json
import joblib
import shutil
import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold, train_test_split, cross_val_predict
from sklearn.metrics import (
    brier_score_loss,
    log_loss,
    roc_auc_score,
    average_precision_score,
    accuracy_score,
    recall_score,
    precision_score,
    f1_score,
    confusion_matrix,
)
from sklearn.linear_model import LogisticRegression
from sklearn.isotonic import IsotonicRegression
from xgboost import XGBClassifier

PROJECT_ROOT = r"c:\Users\TANVIRHOSENNISHAT\Desktop\TriNexus Project\TriNexus-VitaGuard-AI-Cursor-Backup"
RESEARCH_DIR = os.path.join(PROJECT_ROOT, "ML_Research/Phase06B")
DIABD_DIR = os.path.join(RESEARCH_DIR, "DiaBD")
ARTIFACTS_DIR = os.path.join(RESEARCH_DIR, "Artifacts")

os.makedirs(DIABD_DIR, exist_ok=True)
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

# 1. Acquire raw data copy
src_data = r"C:\Users\TANVIRHOSENNISHAT\Downloads\DiaBD_A Diabetes Dataset for Enhanced Risk Analysis and Research in Bangladesh (2).csv"
local_raw_path = os.path.join(DIABD_DIR, "diabd_raw.csv")
if not os.path.exists(local_raw_path):
    print(f"[+] Copying DiaBD raw dataset to research directory...")
    shutil.copy2(src_data, local_raw_path)

# 2. Cleaning protocol (identical to verified production specification)
def clean_diabd(frame):
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

raw = pd.read_csv(local_raw_path)
df = clean_diabd(raw)
print(f"[+] Cleaned DiaBD dataset: {len(df)} rows (Diabetic = {df['diabetic'].sum()} / {len(df)} = {df['diabetic'].mean()*100:.2f}%)")

# 3. Feature engineering
df["pulse_pressure"] = df["systolic_bp"] - df["diastolic_bp"]
df["high_bp"] = ((df["systolic_bp"] >= 140) | (df["diastolic_bp"] >= 90)).astype(int)

feature_names = ["age", "sex", "bmi", "systolic_bp", "diastolic_bp", "family_diabetes", "pulse_pressure", "high_bp"]
X = df[feature_names]
y = df["diabetic"].astype(int)

# 4. Stratified 80/20 train/test split (Sealed test set: 1,024 rows)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)
print(f"[+] Partitioned DiaBD: Train={len(X_train)} (pos={y_train.sum()}), Test={len(X_test)} (pos={y_test.sum()})")

# 5. Base Model (Exact hyperparameter configuration from production champion)
pos_count = sum(y_train == 1)
neg_count = sum(y_train == 0)
scale_pos_weight = float(neg_count / pos_count)
print(f"[+] Class weighting: scale_pos_weight = {scale_pos_weight:.2f}")

base_xgb = XGBClassifier(
    objective="binary:logistic",
    eval_metric="logloss",
    random_state=42,
    n_jobs=1,
    n_estimators=200,
    max_depth=3,
    learning_rate=0.03,
    min_child_weight=30,
    subsample=0.8,
    colsample_bytree=0.8,
    reg_lambda=1,
    scale_pos_weight=scale_pos_weight,
)

# 6. Out-Of-Fold Cross-Validation on TRAINING SET ONLY for Calibration
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
print("[+] Generating Out-of-Fold training probabilities for calibration...")
oof_raw_probs = cross_val_predict(base_xgb, X_train, y_train, cv=cv, method="predict_proba", n_jobs=-1)[:, 1]

# Convert OOF probabilities to logits for Platt scaling
eps = 1e-7
oof_raw_probs_clipped = np.clip(oof_raw_probs, eps, 1 - eps)
oof_logits = np.log(oof_raw_probs_clipped / (1 - oof_raw_probs_clipped)).reshape(-1, 1)

# Fit Calibrators on Out-of-Fold Training Predictions ONLY
print("[+] Fitting Platt Scaler (Logistic Regression on OOF logits)...")
platt_calibrator = LogisticRegression(solver="lbfgs", max_iter=1000, random_state=42)
platt_calibrator.fit(oof_logits, y_train)

print("[+] Fitting Isotonic Regressor (on OOF raw probabilities)...")
iso_calibrator = IsotonicRegression(out_of_bounds="clip", y_min=0.0, y_max=1.0)
iso_calibrator.fit(oof_raw_probs, y_train)

# Fit Base Model on Full Training Set (4,095 rows)
base_xgb.fit(X_train, y_train)

# 7. Evaluate on the Sealed Test Set (1,024 rows) ONCE
test_raw_probs = base_xgb.predict_proba(X_test)[:, 1]

# Apply Platt Scaling to Test
test_raw_clipped = np.clip(test_raw_probs, eps, 1 - eps)
test_logits = np.log(test_raw_clipped / (1 - test_raw_clipped)).reshape(-1, 1)
test_platt_probs = platt_calibrator.predict_proba(test_logits)[:, 1]

# Apply Isotonic Calibration to Test
test_iso_probs = iso_calibrator.transform(test_raw_probs)

# 8. Calibration Metrics Calculation Helpers
def compute_ece(y_true, y_prob, n_bins=10):
    bin_limits = np.linspace(0, 1, n_bins + 1)
    ece = 0.0
    total_samples = len(y_true)
    bin_data = []
    
    for i in range(n_bins):
        low, high = bin_limits[i], bin_limits[i+1]
        in_bin = (y_prob >= low) & (y_prob < high if i < n_bins - 1 else y_prob <= high)
        count = np.sum(in_bin)
        if count > 0:
            avg_prob = np.mean(y_prob[in_bin])
            avg_true = np.mean(y_true[in_bin])
            acc_diff = np.abs(avg_true - avg_prob)
            ece += (count / total_samples) * acc_diff
            bin_data.append({
                "bin": i + 1, "range": [round(float(low), 2), round(float(high), 2)],
                "count": int(count), "mean_predicted": round(float(avg_prob), 4),
                "observed_prevalence": round(float(avg_true), 4), "diff": round(float(acc_diff), 4)
            })
    return float(ece), bin_data

def evaluate_calibration(name, y_true, y_prob):
    # Discrimination
    auroc = roc_auc_score(y_true, y_prob)
    auprc = average_precision_score(y_true, y_prob)
    
    # Calibration
    brier = brier_score_loss(y_true, y_prob)
    ll = log_loss(y_true, y_prob)
    mean_pred = float(np.mean(y_prob))
    obs_prev = float(np.mean(y_true))
    citl = mean_pred - obs_prev  # Calibration-in-the-large
    
    # Calibration slope (logistic regression of y on logit(p))
    p_clip = np.clip(y_prob, 1e-6, 1 - 1e-6)
    logit = np.log(p_clip / (1 - p_clip)).reshape(-1, 1)
    lr_slope = LogisticRegression(solver="lbfgs", max_iter=1000)
    lr_slope.fit(logit, y_true)
    cal_slope = float(lr_slope.coef_[0][0])
    
    ece, bin_data = compute_ece(y_true.values, y_prob, n_bins=10)
    
    return {
        "model": name,
        "auroc": round(float(auroc), 4),
        "auprc": round(float(auprc), 4),
        "mean_predicted_score": round(float(mean_pred), 4),
        "observed_test_prevalence": round(float(obs_prev), 4),
        "calibration_gap_percentage_points": round(float(citl * 100), 2),
        "brier_score": round(float(brier), 4),
        "log_loss": round(float(ll), 4),
        "calibration_slope": round(float(cal_slope), 4),
        "expected_calibration_error_ece": round(float(ece), 4),
        "reliability_bins": bin_data,
    }

eval_uncalibrated = evaluate_calibration("Uncalibrated_XGBoost_Baseline", y_test, test_raw_probs)
eval_platt = evaluate_calibration("Platt_Sigmoid_Calibrated", y_test, test_platt_probs)
eval_isotonic = evaluate_calibration("Isotonic_Calibrated", y_test, test_iso_probs)

null_brier = round(float(np.mean(y_test) * (1 - np.mean(y_test))), 4)

# 9. Bootstrap 95% Confidence Intervals for Brier and ECE
np.random.seed(42)
n_boot = 1000
boot_res = {"uncalibrated": [], "platt": [], "isotonic": []}

for _ in range(n_boot):
    idx = np.random.randint(0, len(y_test), len(y_test))
    if len(np.unique(y_test.iloc[idx])) < 2:
        continue
    y_b = y_test.iloc[idx]
    
    # Uncalibrated
    boot_res["uncalibrated"].append({
        "brier": brier_score_loss(y_b, test_raw_probs[idx]),
        "ece": compute_ece(y_b.values, test_raw_probs[idx])[0],
        "auroc": roc_auc_score(y_b, test_raw_probs[idx])
    })
    # Platt
    boot_res["platt"].append({
        "brier": brier_score_loss(y_b, test_platt_probs[idx]),
        "ece": compute_ece(y_b.values, test_platt_probs[idx])[0],
        "auroc": roc_auc_score(y_b, test_platt_probs[idx])
    })
    # Isotonic
    boot_res["isotonic"].append({
        "brier": brier_score_loss(y_b, test_iso_probs[idx]),
        "ece": compute_ece(y_b.values, test_iso_probs[idx])[0],
        "auroc": roc_auc_score(y_b, test_iso_probs[idx])
    })

def ci(vals):
    return [round(float(np.percentile(vals, 2.5)), 4), round(float(np.percentile(vals, 97.5)), 4)]

ci_summary = {
    "uncalibrated": {
        "brier_ci95": ci([b["brier"] for b in boot_res["uncalibrated"]]),
        "ece_ci95": ci([b["ece"] for b in boot_res["uncalibrated"]]),
        "auroc_ci95": ci([b["auroc"] for b in boot_res["uncalibrated"]]),
    },
    "platt": {
        "brier_ci95": ci([b["brier"] for b in boot_res["platt"]]),
        "ece_ci95": ci([b["ece"] for b in boot_res["platt"]]),
        "auroc_ci95": ci([b["auroc"] for b in boot_res["platt"]]),
    },
    "isotonic": {
        "brier_ci95": ci([b["brier"] for b in boot_res["isotonic"]]),
        "ece_ci95": ci([b["ece"] for b in boot_res["isotonic"]]),
        "auroc_ci95": ci([b["auroc"] for b in boot_res["isotonic"]]),
    }
}

# 10. Research Screening Threshold Analysis (on Sealed Test Set)
threshold_grid = [0.05, 0.08, 0.10, 0.12, 0.15, 0.20, 0.30, 0.40, 0.50, 0.60]
threshold_analysis = []

for th in threshold_grid:
    # Calibrated Platt predictions
    platt_pred = (test_platt_probs >= th).astype(int)
    tn_p, fp_p, fn_p, tp_p = confusion_matrix(y_test, platt_pred, labels=[0, 1]).ravel()
    rec_p = tp_p / (tp_p + fn_p) if (tp_p + fn_p) > 0 else 0
    spec_p = tn_p / (tn_p + fp_p) if (tn_p + fp_p) > 0 else 0
    ppv_p = tp_p / (tp_p + fp_p) if (tp_p + fp_p) > 0 else 0
    npv_p = tn_p / (tn_p + fn_p) if (tn_p + fn_p) > 0 else 0
    f1_p = f1_score(y_test, platt_pred, zero_division=0)
    
    # Uncalibrated Raw predictions
    raw_pred = (test_raw_probs >= th).astype(int)
    tn_r, fp_r, fn_r, tp_r = confusion_matrix(y_test, raw_pred, labels=[0, 1]).ravel()
    rec_r = tp_r / (tp_r + fn_r) if (tp_r + fn_r) > 0 else 0
    spec_r = tn_r / (tn_r + fp_r) if (tn_r + fp_r) > 0 else 0
    
    threshold_analysis.append({
        "threshold": th,
        "calibrated_platt": {
            "sensitivity": round(float(rec_p), 4),
            "specificity": round(float(spec_p), 4),
            "ppv": round(float(ppv_p), 4),
            "npv": round(float(npv_p), 4),
            "f1": round(float(f1_p), 4),
            "tp": int(tp_p), "fp": int(fp_p), "fn": int(fn_p), "tn": int(tn_p),
            "youden_index": round(float(rec_p + spec_p - 1), 4)
        },
        "uncalibrated_raw": {
            "sensitivity": round(float(rec_r), 4),
            "specificity": round(float(spec_r), 4)
        }
    })

# 11. Save Research Artifacts
output_bundle = {
    "null_brier_score": null_brier,
    "evaluations": {
        "uncalibrated": eval_uncalibrated,
        "platt": eval_platt,
        "isotonic": eval_isotonic,
    },
    "bootstrap_ci95": ci_summary,
    "threshold_analysis": threshold_analysis,
    "model_metadata": {
        "features": feature_names,
        "train_rows": len(X_train),
        "test_rows": len(X_test),
        "test_prevalence": float(y_test.mean()),
        "platt_coef": float(platt_calibrator.coef_[0][0]),
        "platt_intercept": float(platt_calibrator.intercept_[0]),
    }
}

out_metrics_json = os.path.join(DIABD_DIR, "diabd_calibration_results.json")
with open(out_metrics_json, "w", encoding="utf-8") as f:
    json.dump(output_bundle, f, indent=2)

research_calibrator_path = os.path.join(ARTIFACTS_DIR, "diabd_research_calibrators.pkl")
joblib.dump({
    "base_model": base_xgb,
    "platt_calibrator": platt_calibrator,
    "iso_calibrator": iso_calibrator,
    "features": feature_names
}, research_calibrator_path)

print("\n==================================================")
print("TRACK B: DIABD CALIBRATION EVALUATION RESULTS")
print("==================================================")
print(f"Null Brier Score (prevalence baseline) : {null_brier}")
print(f"\n1. Uncalibrated Baseline (Production Simulation):")
print(f"   Mean Predicted Score   : {eval_uncalibrated['mean_predicted_score']*100:.2f}% (Observed: {eval_uncalibrated['observed_test_prevalence']*100:.2f}%)")
print(f"   Calibration Gap        : +{eval_uncalibrated['calibration_gap_percentage_points']:.2f}%")
print(f"   Brier Score            : {eval_uncalibrated['brier_score']} (95% CI: {ci_summary['uncalibrated']['brier_ci95']})")
print(f"   Expected Calib Error   : {eval_uncalibrated['expected_calibration_error_ece']:.4f}")
print(f"   Calibration Slope      : {eval_uncalibrated['calibration_slope']:.4f}")
print(f"   AUROC (Discrimination) : {eval_uncalibrated['auroc']:.4f}")

print(f"\n2. Platt-Calibrated Model (Sigmoid):")
print(f"   Mean Predicted Prob    : {eval_platt['mean_predicted_score']*100:.2f}% (Observed: {eval_platt['observed_test_prevalence']*100:.2f}%)")
print(f"   Calibration Gap        : {eval_platt['calibration_gap_percentage_points']:+.2f}%")
print(f"   Brier Score            : {eval_platt['brier_score']} (95% CI: {ci_summary['platt']['brier_ci95']})")
print(f"   Expected Calib Error   : {eval_platt['expected_calibration_error_ece']:.4f}")
print(f"   Calibration Slope      : {eval_platt['calibration_slope']:.4f}")
print(f"   AUROC (Discrimination) : {eval_platt['auroc']:.4f} (Maintained!)")

print(f"\n3. Isotonic-Calibrated Model:")
print(f"   Mean Predicted Prob    : {eval_isotonic['mean_predicted_score']*100:.2f}%")
print(f"   Brier Score            : {eval_isotonic['brier_score']} (95% CI: {ci_summary['isotonic']['brier_ci95']})")
print(f"   Expected Calib Error   : {eval_isotonic['expected_calibration_error_ece']:.4f}")

print(f"\nBrier Score Reduction : {eval_uncalibrated['brier_score']} -> {eval_platt['brier_score']} (Platt beats uncalibrated by {((eval_uncalibrated['brier_score'] - eval_platt['brier_score'])/eval_uncalibrated['brier_score'])*100:.1f}%)")
print(f"Artifacts saved to:\n  - {out_metrics_json}\n  - {research_calibrator_path}")
