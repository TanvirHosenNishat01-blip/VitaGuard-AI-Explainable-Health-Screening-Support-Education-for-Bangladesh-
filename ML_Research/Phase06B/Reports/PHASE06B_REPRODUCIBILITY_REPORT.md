# Phase 06B — Research Reproducibility & Environment Report
**TriNexus | VitaGuard AI — Clinical Machine Learning Division**  
**Date:** November 10, 2026  
**Status:** Certified Fully Reproducible  
**Author:** Senior Machine Learning Engineer & Lead Data Scientist  

---

## 1. Reproducibility Guarantee & Principles

To adhere to clinical and biostatistical audit standards, every numerical output, cross-validation split, bootstrap confidence interval, and SHAP attribution generated during Phase 06B is 100% deterministic and reproducible from canonical source data.

### 1.1 Master Deterministic Parameters
- **Global Pseudo-Random Seed:** `42`
- **Data Splitting Strategy:** `StratifiedKFold(n_splits=5, shuffle=True, random_state=42)`
- **Bootstrap Iterations:** `1,000` replicates with `numpy.random.seed(42)`
- **Test Set Isolation:** 80/20 stratified hold-out split performed once using `random_state=42`; test sets remained unobserved during all hyperparameter selection, scaler fitting, and calibration tuning.

---

## 2. Computational Environment

The research experiments were executed within the project's dedicated virtual Python environment:

| Component | Specification / Version |
| :--- | :--- |
| **Operating System** | Windows 11 Enterprise / PowerShell 5.1 |
| **Python Runtime** | Python 3.12.3 (64-bit) |
| **Interpreter Path** | `c:\Users\TANVIRHOSENNISHAT\Desktop\TriNexus Project\TriNexus-VitaGuard-AI-Cursor-Backup\backend\venv\Scripts\python.exe` |
| **NumPy** | 1.26.4 |
| **Pandas** | 2.2.2 |
| **Scikit-Learn** | 1.5.0 |
| **XGBoost** | 2.0.3 |
| **SHAP** | 0.45.1 |
| **SciPy** | 1.13.1 |

---

## 3. Step-by-Step Reproduction Guide

To independently reproduce all Phase 06B results from terminal:

### Step 1: Navigate to Project Root
```powershell
cd "c:\Users\TANVIRHOSENNISHAT\Desktop\TriNexus Project\TriNexus-VitaGuard-AI-Cursor-Backup"
```

### Step 2: Reproduce Track A (Pima Leakage Audit & Leakage-Free Pipeline)
```powershell
# 1. Run forensic leakage audit on raw vs canonical Pima:
python ML_Research/Phase06B/Pima/pima_investigation.py

# 2. Run leak-free 5-fold CV and test evaluation:
python ML_Research/Phase06B/Pima/pima_leakage_free_experiment.py
```
*Outputs generated:*
- `ML_Research/Phase06B/Pima/pima_investigation_results.json`
- `ML_Research/Phase06B/Pima/pima_experiment_summary.json`
- `ML_Research/Phase06B/Artifacts/pima_leakage_free_pipeline.pkl`

### Step 3: Reproduce Track B (DiaBD Out-of-Fold Calibration)
```powershell
# Run Out-Of-Fold Platt Sigmoid & Isotonic calibration experiments:
python ML_Research/Phase06B/DiaBD/diabd_calibration_experiment.py
```
*Outputs generated:*
- `ML_Research/Phase06B/DiaBD/diabd_calibration_results.json`
- `ML_Research/Phase06B/Artifacts/diabd_research_calibrators.pkl`

### Step 4: Reproduce Track C (Cleveland Explainability & Exact LinearExplainer)
```powershell
# Run feature standardized effect sizes and exact SHAP LinearExplainer:
python ML_Research/Phase06B/Cleveland/cleveland_explainability_experiment.py
```
*Outputs generated:*
- `ML_Research/Phase06B/Cleveland/cleveland_research_results.json`
- `ML_Research/Phase06B/Artifacts/cleveland_shap_explainer.pkl`

---

## 4. Verification Checksums of Research Artifacts

| Research Artifact | File Size | SHA-256 Hash |
| :--- | :--- | :--- |
| `pima_canonical_raw.csv` | 23,873 bytes | `78403bc68ef342f2eb67e7eb16a7f5024bf1fecb7e5ec46f888eb1950e3aa0e5` |
| `pima_leakage_free_pipeline.pkl` | 4,199 bytes | `eb6fa68b9286d9a0d81000ee2ebef9ce89622d1033b9ee0ee8f1eeb6b95b451d` |
| `diabd_research_calibrators.pkl` | 227,960 bytes | `95bb663e80d21051fa8b88d227f717cf7b73c448bbcf06db49b56f8f553f1911` |
| `cleveland_shap_explainer.pkl` | 24,803 bytes | `bdf5591cfd01ba03fc0fb7e96b1b6eb1b262d04a6e8df8ae5eec061c40ea46a7` |
| `diabd_raw.csv` | 286,998 bytes | `3e9a03975a6c11fc6e23293e50257257dfbdfec1368297686bfa3e8c148286a1` |

---

## 5. Summary Conclusion

All research experiments run self-contained scripts, load versioned local data files, use fixed random seeds, and log exact point estimates and confidence intervals to structured JSON. External network access is neither requested nor required for reproduction.
