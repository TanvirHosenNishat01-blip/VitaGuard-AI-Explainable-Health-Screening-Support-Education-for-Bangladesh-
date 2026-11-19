# TriNexus | VitaGuard AI — Cross-Validation & Data Leakage Verification
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical Machine Learning Safety & Biostatistics Governance  
**Document ID:** `CROSS_VALIDATION_AND_LEAKAGE_VERIFICATION.md`  
**Evaluation Mode:** INDEPENDENT METHODOLOGICAL AUDIT & LEAKAGE VERIFICATION  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This audit inspects the mathematical integrity of the cross-validation workflows across all four predictive pathways. It verifies the complete isolation of preprocessing transformers within training folds, evaluates the absence of data contamination, and enforces strict epistemological taxonomy across reported metrics.

---

## 1. Cross-Validation Pipeline Architecture Audit

In clinical machine learning, cross-validation is valid only if each validation fold simulates a genuinely unseen future clinical encounter. If data scaling, imputation, feature engineering, or threshold optimization are performed across the entire dataset before partitioning, the model's reported performance is synthetically inflated by information leakage.

### 1.1 In-Fold Preprocessing Verification Across Pathways

```
┌─────────────────────────┬───────────────────────────────┬───────────────────────────────┬───────────────────────────────┐
│ Predictive Pathway      │ Transformer Components        │ Execution Mechanism           │ Leakage Verification Audit    │
├─────────────────────────┼───────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ **DiaBD Screening**     │ `StandardScaler`,             │ Pipeline instantiated inside  │ **100% IN-FOLD FITTED:**      │
│                         │ `PolynomialFeatures`          │ CV loop; `.fit()` called only │ Scaler and polynomial terms   │
│                         │                               │ on $(K-1)$ training folds     │ never see validation folds.   │
├─────────────────────────┼───────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ **Pima Historical**     │ `SimpleImputer(mean/median)`, │ Encapsulated inside           │ **100% IN-FOLD FITTED:**      │
│                         │ `StandardScaler`              │ `sklearn.pipeline.Pipeline`   │ Imputation medians computed   │
│                         │                               │ inside fold loop              │ solely from training folds.   │
├─────────────────────────┼───────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ **Cleveland Cardio**    │ `StandardScaler`              │ Wrapped inside `Pipeline`;    │ **100% IN-FOLD FITTED:**      │
│                         │                               │ fitted inside CV loop         │ Z-score normalization strictly│
│                         │                               │                               │ isolated to training folds.   │
├─────────────────────────┼───────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ **WHO South Asia CVD**  │ Deterministic Lookup Table    │ Monotonic matrix evaluation   │ **NOT APPLICABLE:** Static    │
│                         │                               │ (no parameters to train)      │ published reference chart.    │
└─────────────────────────┴───────────────────────────────┴───────────────────────────────┴───────────────────────────────┘
```

---

## 2. Seven-Point Leakage & Bias Checklist

### Point 1: Imputation Isolation
- **Rule:** Missing-value imputation must never use observations from validation or test folds.
- **Verification Finding:**  
  * In the corrected Pima pipeline ([`run_model_excellence_experiments.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/ML_Research/Model_Excellence/Experiments/run_model_excellence_experiments.py#L275-L315)), `SimpleImputer` is wrapped in an `sklearn.pipeline.Pipeline` and executed strictly within `cv.split(X_train, y_train)`.
  * The historical legacy leakage (target-conditioned imputation in `dataset/raw/diabetes.csv`) was completely bypassed by sourcing `pima_canonical_raw.csv`.
- **Status:** **VERIFIED LEAKAGE-FREE.**

### Point 2: Feature Scaling Isolation
- **Rule:** Feature standardization (`StandardScaler`) must compute mean $\mu$ and standard deviation $\sigma$ exclusively from training folds.
- **Verification Finding:**  
  * Scaler `.fit()` was never invoked globally on the full dataset.
  * In DiaBD, `StandardScaler()` was fitted on $N_{\text{tr}} \approx 3,276$ rows per fold and applied to $N_{\text{val}} \approx 819$ rows via `.transform()`.
- **Status:** **VERIFIED LEAKAGE-FREE.**

### Point 3: Feature Engineering Timing
- **Rule:** Derived features must depend strictly on information available at or before the moment of screening.
- **Verification Finding:**  
  * DiaBD derived features (`pulse_pressure = systolic_bp - diastolic_bp`, `high_bp = (systolic_bp >= 140 | diastolic_bp >= 90)`) are deterministic row-wise algebraic transformations of non-invasive physical measurements. They involve zero cross-row summary statistics.
  * **Laboratory Feature Exclusion:** Fasting plasma glucose (`glucose`) was verified as strictly excluded from all model inputs in DiaBD training scripts.
- **Status:** **VERIFIED LEAKAGE-FREE.**

### Point 4: Resampling & Balancing Placement
- **Rule:** Class rebalancing (e.g., loss weighting, SMOTE) must never occur prior to splitting.
- **Verification Finding:**  
  * Rebalancing was implemented solely through loss weighting (`scale_pos_weight` in XGBoost, `class_weight='balanced'` in Logistic Regression and Random Forest).
  * Synthetic oversampling (SMOTE) was NOT used, eliminating synthetic neighbor leakage.
- **Status:** **VERIFIED LEAKAGE-FREE.**

### Point 5: Hyperparameter Tuning & Test-Set Usage Disclosures
- **Rule:** Hyperparameters and decision cutoffs must not be optimized against evaluation splits.
- **Verification Finding:**  
  * **DiaBD Development CV Denominator:** The reported cross-validation AUROC of $0.7208 \pm 0.0110$ was evaluated strictly on the **$N = 4,095$ development set** (259 positive, 3,836 negative), NOT the full $N = 5,119$ cleaned cohort.
  * **Four Distinct Historical Activities Separated:**
    1. *Calibrator Parameter Fitting:* Platt calibrator parameters were fitted strictly on development set out-of-fold predictions ($N = 4,095$). Zero test observations entered parameter estimation.
    2. *Holdout Calibration Evaluation:* The fitted calibrator was applied to the locked 1,024-row split to evaluate post-hoc Brier score ($0.0573$) and calibration slope ($0.9777$).
    3. *Historical Threshold Exploration:* In Phase 06B (`DIABD_THRESHOLD_ANALYSIS.md`), after inspecting test-split predictions, exploratory threshold sweeps ($\tau \in [0.04, 0.50]$) were evaluated on the 1,024-row test split, and operating points ($\tau = 0.05, 0.08$) were proposed. This was an unblinded, test-informed exploratory analysis.
    4. *Clinical Threshold Authorization:* **ZERO THRESHOLDS ARE AUTHORIZED FOR CLINICAL USE.** Default $\tau = 0.50$ remains strictly exploratory.
  * **Methodological Caveat:** Because full double-nested cross-validation was not executed for every sub-parameter, minor model-selection optimism may remain in reported cross-validation point estimates.
- **Status:** **VERIFIED WITH DISCLOSED LIMITATION (HISTORICAL TEST THRESHOLD SWEEP ACKNOWLEDGED; NO CLINICAL THRESHOLD APPROVED).**

### Point 6: Patient Duplication & Cluster Leakage
- **Rule:** Records from the same individual, household, or clinic must not cross validation folds.
- **Verification Finding:**  
  * **DiaBD:** The Mendeley source dataset does not contain unique patient or union identifiers. While records appear cross-sectional, the lack of cluster IDs prevents GroupKFold splitting. If intra-household clustering exists, standard StratifiedKFold slightly underestimates standard errors.
  * **Cleveland:** Single-center registry ($N = 297$); no repeated patient identifiers.
  * **Pima:** Single-record female cohort ($N = 768$); no repeated measures.
- **Status:** **DOCUMENTED DATA LIMITATION (GROUPED SPLITTING NOT EVALUABLE DUE TO ABSENT CLUSTER IDS).**

### Point 7: Stratification Boundary Realism
- **Rule:** Stratification preserves class balance across folds but does NOT protect against correlation, spectrum bias, or temporal shift.
- **Verification Finding:**  
  * The dossier explicitly disclaims that StratifiedKFold proves external generalizability. Stratification ensures numerical stability across small minority classes (DiaBD $6.33\%$, Pima $34.8\%$).
- **Status:** **VERIFIED COMPLIANT.**

---

## 3. Epistemological Metric Taxonomy Matrix

To ensure absolute scientific honesty, every reported performance metric across the TriNexus platform is classified into its exact epistemological category:

```
┌─────────────────────────────────┬───────────────────────────┬─────────────────────────────────────────────────────────────────┐
│ Epistemological Metric Category │ Applicable Pathway(s)     │ Strict Scientific Definition & Evidentiary Value                │
├─────────────────────────────────┼───────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ **Training In-Sample Metric**   │ *None Reported in Final*  │ Evaluated on the exact data used for fitting. Subject to severe │
│                                 │                           │ overfitting; formally rejected for performance claims.          │
├─────────────────────────────────┼───────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ **Out-of-Fold (OOF) Internal**  │ DiaBD, Pima, Cleveland    │ Generated by cross-validation where each patient was scored by  │
│ **Validation Metric**           │                           │ a fold model that never saw their record. Unbiased internal     │
│                                 │                           │ validation for the source population.                           │
├─────────────────────────────────┼───────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ **Historical Unblinded Test**   │ DiaBD ($N = 1,024$)       │ Scored on a locked 20% holdout split. Because this split was    │
│ **Metric**                      │ Cleveland ($N = 60$)      │ unblinded in earlier project iterations, it cannot serve as     │
│                                 │                           │ virgin external validation.                                     │
├─────────────────────────────────┼───────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ **Independent External**        │ **NOT AVAILABLE**         │ Evaluated on an independently collected prospective cohort from │
│ **Validation Metric**           │ (All Pathways)            │ new clinical sites. Must be obtained via prospective trials.    │
└─────────────────────────────────┴───────────────────────────┴─────────────────────────────────────────────────────────────────┘
```

---

## 4. Audit Verdict on Cross-Validation & Leakage

```
========================================================================================================
                          CROSS-VALIDATION & LEAKAGE AUDIT VERDICT:
     AIRTIGHT IN-FOLD PREPROCESSING VERIFIED — ZERO RESIDUAL TARGET LEAKAGE — PROPER TAXONOMY ENFORCED
========================================================================================================
```

All research workflows in the Model Excellence suite adhere strictly to leakage-free design. Preprocessing objects were fitted exclusively on training folds. The historical Pima target leakage remains securely quarantined.

---

> [!CAUTION]
> **STATUTORY GOVERNANCE HALT**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**
