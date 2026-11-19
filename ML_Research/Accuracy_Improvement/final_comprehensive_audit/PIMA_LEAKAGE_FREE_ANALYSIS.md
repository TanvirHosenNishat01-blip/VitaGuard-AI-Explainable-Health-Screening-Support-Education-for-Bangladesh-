# Pima leakage-free analysis

Canonical rows: 768. Positives: 268. Missing after zero-as-missing: {"Glucose": 5, "BloodPressure": 35, "SkinThickness": 227, "Insulin": 374, "BMI": 11}.

Training out-of-fold logistic regression, C=0.3, median imputation inside each fold, n=614: PR-AUC 0.7166, Brier 0.1627. This matches the prior leakage-free reference of 0.7166 and 0.1627.

The 87.66 percent figure comes from `ML_Model/evaluation/metrics.json` after target-conditional insulin fills. It is not a baseline and it is not shown as a performance claim.

Earlier comparisons with random forest, histogram gradient boosting, and regularized XGBoost did not clear a +0.02 PR-AUC margin. This audit did not refit those failures.

Cohort limit: women aged 21 to 81 near Phoenix. The consented screen states that limit. This file cannot represent men, children, or patients in Bangladesh.
