# Final research report

Recommendation: **NO IMPROVEMENT FOUND**.

No pathway produced a candidate that cleared its pre-registered training rule.

Production models, thresholds, prediction routes, and `backend/vitaguard.db` were not modified. Protected hashes matched after the run.

## DiaBD

Published locked test stays at precision 0.1159, false positives 290, false negatives 27.
Training out-of-fold reference at cutoff 0.51: false positives 1145, false negatives 96, PR-AUC 0.1463, Brier 0.1871.
Models compared on that same out-of-fold protocol: logistic regression, inner-fold feature selection, random forest, histogram gradient boosting, the published XGBoost configuration, and a more regularized XGBoost. None cleared the 15 percent false-positive reduction with the recall floor and the PR-AUC guard.

## Pima

Leakage-free logistic out-of-fold PR-AUC 0.7166, Brier 0.1627, n=614. Random forest, histogram gradient boosting, XGBoost, and C=1 logistic did not clear +0.02 PR-AUC without a worse Brier score. The 87.66 percent claim was not used.

## Cleveland

The published 60-row result reproduced and was not used for selection. Repeated training validation did not show a model beating logistic regression by the 0.02 PR-AUC margin with a paired interval above zero.

## WHO

The published table was checked and left unchanged. No accuracy was invented.

Calibration bins for the DiaBD reference are below. A gap between mean predicted value and observed rate is a calibration description, not a license to change the production cutoff.

| bin_low | bin_high | n | mean_predicted | observed_rate |
| --- | --- | --- | --- | --- |
| 0.0 | 0.1515 | 819 | 0.1034 | 0.0171 |
| 0.1515 | 0.2803 | 819 | 0.2146 | 0.0317 |
| 0.2803 | 0.4404 | 819 | 0.3581 | 0.0415 |
| 0.4404 | 0.6094 | 819 | 0.5266 | 0.0806 |
| 0.6094 | 1.0 | 819 | 0.7001 | 0.1453 |