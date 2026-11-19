# Phase 06B — Corrected Pima Validation Metrics & Leakage Impact Report
**TriNexus | VitaGuard AI — Clinical Machine Learning Division**  
**Date:** November 10, 2026  
**Status:** Complete  
**Author:** Lead Data Scientist & Biostatistics Reviewer  

---

## 1. Cross-Validation Model Selection Across Strategies

In Phase 06B, a full factorial grid of 3 missing-value imputation strategies ($\text{Mean}$, $\text{Median}$, and $\text{KNN-5}$) and 3 classification architectures ($\text{LogisticRegression}$, $\text{RandomForestClassifier}$, and $\text{XGBClassifier}$) was evaluated under 5-fold stratified cross-validation on the 614-sample training split.

### 1.1 5-Fold Stratified CV Benchmark (Fitted Strictly In-Fold)

| Pipeline ID | Imputation Strategy | Classifier Model | Mean CV AUROC $\pm$ Std | Mean CV AUPRC | Mean CV Accuracy | Mean CV Recall | Mean CV F1 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`mean_LogisticRegression`** *(Champion)* | Mean Imputation | Logistic Regression | **0.8449 $\pm$ 0.0148** | **0.7481** | **76.38%** | 70.58% | **0.6753** |
| `median_LogisticRegression` | Median Imputation | Logistic Regression | 0.8444 $\pm$ 0.0161 | 0.7477 | 76.22% | 70.10% | 0.6724 |
| `knn5_LogisticRegression` | 5-Nearest Neighbors | Logistic Regression | 0.8430 $\pm$ 0.0162 | 0.7455 | 75.89% | 70.56% | 0.6709 |
| `median_RandomForest` | Median Imputation | Random Forest | 0.8386 $\pm$ 0.0215 | 0.7273 | 75.89% | 75.23% | 0.6854 |
| `knn5_RandomForest` | 5-Nearest Neighbors | Random Forest | 0.8368 $\pm$ 0.0177 | 0.7259 | 75.57% | 76.18% | 0.6850 |
| `mean_RandomForest` | Mean Imputation | Random Forest | 0.8367 $\pm$ 0.0204 | 0.7251 | 76.38% | 75.69% | 0.6910 |
| `mean_XGBoost` | Mean Imputation | XGBoost Classifier | 0.8262 $\pm$ 0.0163 | 0.7220 | 75.08% | 56.08% | 0.6101 |
| `knn5_XGBoost` | 5-Nearest Neighbors | XGBoost Classifier | 0.8256 $\pm$ 0.0196 | 0.7285 | 76.71% | 59.36% | 0.6399 |
| `median_XGBoost` | Median Imputation | XGBoost Classifier | 0.8254 $\pm$ 0.0196 | 0.7209 | 75.40% | 56.08% | 0.6141 |

*Selection Justification:* `mean_LogisticRegression` achieved the highest cross-validation AUROC (0.8449) and lowest variance ($\pm 0.0148$) with regularized L2 penalty, providing a well-calibrated linear baseline free of decision tree over-partitioning.

---

## 2. Sealed Holdout Test Set Evaluation

The champion pipeline was refitted on the entire 614-sample training set and evaluated exactly once on the untouched 154-sample test set (100 negative cases, 54 positive cases; 35.06% prevalence).

### 2.1 Complete Diagnostic Performance (1,000 Bootstrap Replicates)

| Metric | Point Estimate | 95% Confidence Interval | Clinical Interpretation |
| :--- | :--- | :--- | :--- |
| **AUROC** | **0.8117** | **[0.7368, 0.8760]** | Acceptable diagnostic discrimination in line with NIH benchmark literature. |
| **AUPRC** | **0.6702** | — | Area under precision-recall curve reflects clinical trade-off on imbalanced class. |
| **Accuracy** | **73.38%** | **[0.6623, 0.7987]** | Total correct classification proportion at 0.50 cutoff. |
| **Sensitivity (Recall)** | **70.37%** | **[0.5769, 0.8236]** | Identifies 38 of 54 true diabetic cases; 16 cases missed (29.6% false-negative rate). |
| **Specificity** | **75.00%** | **[0.6666, 0.8350]** | Correctly clears 75 of 100 non-diabetic controls; 25 false positives. |
| **Precision (PPV)** | **60.32%** | — | When model flags a patient, positive predictive value is 60.3%. |
| **Negative Predictive Value (NPV)** | **82.42%** | — | Probability of true negative given negative screening result. |
| **F1-Score** | **0.6496** | — | Harmonic mean of precision and recall. |
| **Brier Score** | **0.1818** | **[0.1457, 0.2218]** | Mean squared probabilistic error (well below null benchmark). |

### 2.2 Sealed Test Confusion Matrix ($N = 154$)
- **True Negatives (TN):** 75
- **False Positives (FP):** 25
- **False Negatives (FN):** 16
- **True Positives (TP):** 38

---

## 3. Quantification of Data Leakage Inflation

A side-by-side comparison between the historical production model (trained on target-leaked data) and the corrected leakage-free model reveals the exact magnitude of synthetic performance inflation:

| Performance Metric | Historical Leaked Production Model | Corrected Leakage-Free Research Model | Synthetic Inflation Delta |
| :--- | :--- | :--- | :--- |
| **AUROC** | 0.9519 | **0.8117** | **+14.02% points** |
| **Accuracy** | 87.66% | **73.38%** | **+14.28% points** |
| **Sensitivity (Recall)** | 84.78% | **70.37%** | **+14.41% points** |
| **Precision (PPV)** | 80.39% | **60.32%** | **+20.07% points** |
| **F1-Score** | 0.8252 | **0.6496** | **+17.56% points** |

---

## 4. Key Biostatistical Conclusions

1. **Target Leakage Proof Confirmed:** The historical model's 0.9519 AUROC was an artificial construct resulting from outcome-conditional imputation. On genuine canonical data, the true AUROC is 0.8117.
2. **Clinical Irrelevance:** Even in its corrected, leakage-free state, the Pima model requires fasting insulin and skinfold measurements, which are inappropriate and inaccessible for primary care screening in Bangladesh.
3. **Safety Directive:** The Pima model must remain permanently decommissioned from patient-facing use in TriNexus | VitaGuard AI.
