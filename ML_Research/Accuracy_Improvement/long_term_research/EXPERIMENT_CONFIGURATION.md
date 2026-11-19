# Experiment configuration

Random seed 42. Stratified 80/20 split, then 5-fold shuffled cross-validation on the training rows only.

CatBoost and matplotlib are not installed. No package was added. Precision-recall points are saved as CSV instead of a rendered plot.

```json
{
  "seed": 42,
  "started_at": "2026-11-19T13:32:24.301853+00:00",
  "python": "3.14.4",
  "packages": "sklearn, xgboost, numpy, pandas, shap are already installed. matplotlib and catboost are not installed and were not added.",
  "production_changes_allowed": false,
  "locked_test_rule": "Score a new candidate once only after the training-fold rule passes. Do not use the locked test to choose the candidate or the cutoff.",
  "diabd": {
    "objective": "Fewer false positives on training out-of-fold rows, without dropping recall more than 0.05 below the published-config out-of-fold recall at cutoff 0.51.",
    "margin": "False positives at most 85 percent of the published-config out-of-fold count, PR-AUC no more than 0.01 below that config, and the bootstrap interval for the false-positive reduction stays above zero.",
    "glucose": "excluded"
  },
  "pima": {
    "objective": "Out-of-fold PR-AUC at least 0.02 above regularized logistic C=0.3, with Brier score no more than 0.01 worse.",
    "invalid_baseline": "87.66 percent is not a baseline.",
    "imputation": "median inside each training fold"
  },
  "cleveland": {
    "objective": "Repeated stratified 5x10. Mean PR-AUC at least 0.02 above logistic C=1 and the 2.5 percentile of paired repeat differences above zero.",
    "locked_test": "Reproduce the published 60-row score once. Do not select with it."
  },
  "who": "Lookup integrity only. No trained replacement."
}
```
