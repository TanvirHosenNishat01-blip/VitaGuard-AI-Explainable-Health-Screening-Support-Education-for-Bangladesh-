# Phase 06B — Pima Leakage-Free Pipeline Architecture & Forensic Report
**TriNexus | VitaGuard AI — Clinical Machine Learning Division**  
**Date:** November 10, 2026  
**Status:** Forensic Audit Complete & Leakage-Free Architecture Verified  
**Author:** Senior Machine Learning Engineer & Clinical Data Auditor  

---

## 1. Forensic Investigation of the Historical Data Leakage

During Phase 05, the audit team flagged that the production Pima model achieved an improbably high test AUROC of 0.9519 and accuracy of 87.66% on a clinical dataset historically known to have a Bayes error rate bounding AUROC around 0.82–0.84. In Phase 06B, script `ML_Research/Phase06B/Pima/pima_investigation.py` executed a forensic byte- and row-level comparison between the project's historical `dataset/raw/diabetes.csv` and the canonical benchmark Pima dataset (National Institute of Diabetes and Digestive and Kidney Diseases, NIH / UCI Machine Learning Repository).

### 1.1 The Forensic Mechanism: Target-Conditional Mean Imputation

In the canonical Pima cohort, biological zero measurements in `Insulin`, `SkinThickness`, `Glucose`, `BloodPressure`, and `BMI` represent unmeasured/missing clinical values. Rather than using an unsupervised imputer or fold-isolated transformer, the legacy author replaced missing values conditionally upon the ground truth diagnosis label (`Outcome`):

| Variable | Canonical Missing Count (Zeros) | Legacy Replaced Value when Outcome = 0 | Legacy Replaced Value when Outcome = 1 | Forensic Audit Finding |
| :--- | :--- | :--- | :--- | :--- |
| **`Insulin`** | 374 rows (48.7%) | **`102.5`** $\mu\text{U/mL}$ | **`169.5`** $\mu\text{U/mL}$ | **100% Target Leakage:** Every single missing insulin value was filled with the class-specific median. A model simply has to check whether insulin equals 169.5 to know with near certainty that Outcome = 1. |
| **`SkinThickness`** | 227 rows (29.6%) | **`27.0`** $\text{mm}$ | **`32.0`** $\text{mm}$ | **100% Target Leakage:** Missing triceps skinfold thickness values were conditionally partitioned by outcome label. |
| **`Glucose`** | 5 rows (0.7%) | Preserved as 0 or mean-filled | Preserved as 0 or mean-filled | Minimal impact due to small missing count. |
| **`BloodPressure`** | 35 rows (4.6%) | Preserved as 0 or mean-filled | Preserved as 0 or mean-filled | Class-agnostic imputation. |
| **`BMI`** | 11 rows (1.4%) | Preserved as 0 or mean-filled | Preserved as 0 or mean-filled | Class-agnostic imputation. |

### 1.2 Mathematical Proof of Data Poisoning

Let $Y \in \{0, 1\}$ be the diagnosis label, $X_i$ be the true underlying feature, and $M_i \in \{0, 1\}$ be the missingness indicator ($M_i = 1$ when $X_i = 0$ in canonical data).  
In valid clinical machine learning:
$$\hat{X}_i = f(X_{\text{observed}})$$
The imputer function $f$ must be independent of $Y$, such that $P(\hat{X}_i \mid M_i=1, Y=0) = P(\hat{X}_i \mid M_i=1, Y=1)$.

In the legacy codebase:
$$\hat{X}_i = \text{Median}(X_i \mid Y = y)$$
This injected the conditional target distribution directly into the feature matrix:
$$P(\hat{X}_{\text{Insulin}} = 169.5 \mid Y = 1) \gg P(\hat{X}_{\text{Insulin}} = 169.5 \mid Y = 0) = 0$$
When this dataset was partitioned into train and test splits (`dataset/processed/train.csv` and `dataset/processed/test.csv`), the test set already carried the label encoded into the feature values. The model did not learn physiological diabetes biology; it learned the artifact of the target-conditional median assignment.

---

## 2. Corrected Leakage-Free Architecture

To establish the genuine machine learning capability of the Pima feature set, an airtight research pipeline was constructed in `ML_Research/Phase06B/Pima/pima_leakage_free_experiment.py`.

```
                         CANONICAL RAW PIMA DATASET (768 Rows)
                                          │
                         Stratified 80/20 Holdout Split (Seed 42)
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
         RESEARCH TRAIN SET                               SEALED TEST SET
             (614 Rows)                                      (154 Rows)
                  │                                               │
        5-Fold Stratified CV                                      │
   (Fitted Strictly Within Folds)                                 │
                  │                                               │
   ┌──────────────┴──────────────┐                                │
   ▼                             ▼                                │
Feature NaN Encoding      Feature NaN Encoding                    │
   │                             │                                │
Class-Agnostic Imputer    Robust/Standard Scaler                  │
(Mean, Median, KNN-5)            │                                │
   │                      Model Fitting                           │
   └──────────────┬──────────────┘                                │
                  │                                               │
     Select Champion Pipeline                                     │
                  │                                               │
     Final Fit on Full Train Set (614 rows)                       │
                  │                                               │
                  └───────────────────────┬───────────────────────┘
                                          ▼
                             Unbiased Test Evaluation
                              (AUROC, Accuracy, CIs)
```

### 2.1 Pipeline Engineering Safeguards
1. **Source Data Authenticity:** Sourced exclusively from untouched canonical raw data (`ML_Research/Phase06B/Pima/pima_canonical_raw.csv`).
2. **Biological Zero Replacement:** Features where 0 is physiologically non-viable (`Glucose`, `BloodPressure`, `SkinThickness`, `Insulin`, `BMI`) were mapped to `np.nan` prior to splitting.
3. **Encapsulated Pipeline Primitives:** All transformations were wrapped inside `sklearn.pipeline.Pipeline`:
   ```python
   Pipeline([
       ('imputer', SimpleImputer(strategy='mean')),
       ('scaler', StandardScaler()),
       ('classifier', LogisticRegression(random_state=42, max_iter=1000))
   ])
   ```
4. **Strict Isolation:** Imputer statistics ($\mu, \sigma$, medians, KNN graphs) were calculated exclusively from the training fold or training split. Zero target $Y$ values were accessed during imputation.
5. **Sealed Test Set:** The 154-sample hold-out test set remained unobserved until hyperparameter and imputer selection was frozen across 5-fold cross-validation.

---

## 3. Verification of Zero-Leakage Compliance

The script verified that:
- Imputer transformers do not take $Y$ as an argument during `.fit()`.
- Imputed values in test data are identical regardless of whether test samples have true $Y=0$ or $Y=1$.
- No overlap exists between training fold indices and validation fold indices.

This confirms the complete eradication of data leakage in the Track A research environment.
