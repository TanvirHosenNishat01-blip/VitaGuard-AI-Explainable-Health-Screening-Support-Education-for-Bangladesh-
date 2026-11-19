# -*- coding: utf-8 -*-
"""Track A: Pima Dataset Forensic Investigation.

Inspects the repository's dataset/raw/diabetes.csv versus the canonical UCI Pima benchmark,
identifying the exact mechanism of target-conditional imputation leakage.
Saves research-only canonical dataset to ML_Research/Phase06B/Pima/pima_canonical_raw.csv.
"""
import os
import hashlib
import json
import urllib.request
import pandas as pd
import numpy as np

PROJECT_ROOT = r"c:\Users\TANVIRHOSENNISHAT\Desktop\TriNexus Project\TriNexus-VitaGuard-AI-Cursor-Backup"
PIMA_DIR = os.path.join(PROJECT_ROOT, "ML_Research/Phase06B/Pima")
REPRO_DIR = os.path.join(PROJECT_ROOT, "ML_Research/Phase06B/Reproducibility")

os.makedirs(PIMA_DIR, exist_ok=True)
os.makedirs(REPRO_DIR, exist_ok=True)

# 1. Inspect production raw file
prod_raw_path = os.path.join(PROJECT_ROOT, "dataset/raw/diabetes.csv")
with open(prod_raw_path, "rb") as f:
    prod_hash = hashlib.sha256(f.read()).hexdigest()

df_prod = pd.read_csv(prod_raw_path)
print(f"[+] Loaded production raw diabetes.csv: shape={df_prod.shape}, SHA-256={prod_hash}")

# 2. Fetch canonical UCI benchmark
canonical_url = "https://raw.githubusercontent.com/plotly/datasets/master/diabetes.csv"
canonical_save_path = os.path.join(PIMA_DIR, "pima_canonical_raw.csv")

if not os.path.exists(canonical_save_path):
    print(f"[+] Fetching canonical UCI Pima dataset from {canonical_url}...")
    urllib.request.urlretrieve(canonical_url, canonical_save_path)

with open(canonical_save_path, "rb") as f:
    canonical_hash = hashlib.sha256(f.read()).hexdigest()

df_canonical = pd.read_csv(canonical_save_path)
print(f"[+] Canonical dataset saved to {canonical_save_path}: shape={df_canonical.shape}, SHA-256={canonical_hash}")

# 3. Biological zero and missing value analysis
zero_cols = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
investigation = {
    "production_raw": {
        "path": "dataset/raw/diabetes.csv",
        "sha256": prod_hash,
        "rows": len(df_prod),
        "columns": list(df_prod.columns),
        "zero_counts": {c: int((df_prod[c] == 0).sum()) for c in zero_cols},
        "outcome_distribution": {int(k): int(v) for k, v in df_prod['Outcome'].value_counts().items()}
    },
    "canonical_uci": {
        "path": "ML_Research/Phase06B/Pima/pima_canonical_raw.csv",
        "sha256": canonical_hash,
        "rows": len(df_canonical),
        "columns": list(df_canonical.columns),
        "zero_counts": {c: int((df_canonical[c] == 0).sum()) for c in zero_cols},
        "outcome_distribution": {int(k): int(v) for k, v in df_canonical['Outcome'].value_counts().items()}
    },
    "leakage_evidence": {}
}

# 4. Forensic analysis of how zeros were replaced in production raw
for col in zero_cols:
    canonical_zeros = (df_canonical[col] == 0)
    replaced_values = df_prod.loc[canonical_zeros, col]
    value_counts_by_outcome = df_prod.loc[canonical_zeros].groupby('Outcome')[col].value_counts().unstack(fill_value=0)
    
    investigation["leakage_evidence"][col] = {
        "canonical_zeros_count": int(canonical_zeros.sum()),
        "production_zeros_count": int((df_prod[col] == 0).sum()),
        "injected_values_summary": {
            str(val): {
                "outcome_0_count": int(df_prod.loc[canonical_zeros & (df_prod['Outcome'] == 0), col].eq(val).sum()),
                "outcome_1_count": int(df_prod.loc[canonical_zeros & (df_prod['Outcome'] == 1), col].eq(val).sum()),
                "total": int(replaced_values.eq(val).sum())
            }
            for val in replaced_values.unique()[:5]
        }
    }

out_json = os.path.join(PIMA_DIR, "pima_investigation_results.json")
with open(out_json, "w", encoding="utf-8") as f:
    json.dump(investigation, f, indent=2)

print("\n=== PIMA FORENSIC LEAKAGE SUMMARY ===")
print(f"Canonical zeros in Insulin: {investigation['leakage_evidence']['Insulin']['canonical_zeros_count']}")
for val, stats in investigation['leakage_evidence']['Insulin']['injected_values_summary'].items():
    print(f"  Insulin={val}: Outcome 0 = {stats['outcome_0_count']}, Outcome 1 = {stats['outcome_1_count']}")

print(f"\nCanonical zeros in SkinThickness: {investigation['leakage_evidence']['SkinThickness']['canonical_zeros_count']}")
for val, stats in investigation['leakage_evidence']['SkinThickness']['injected_values_summary'].items():
    print(f"  SkinThickness={val}: Outcome 0 = {stats['outcome_0_count']}, Outcome 1 = {stats['outcome_1_count']}")

print(f"\nInvestigation output saved to {out_json}")
