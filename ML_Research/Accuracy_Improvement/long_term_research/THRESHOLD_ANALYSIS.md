# Threshold analysis

These cutoffs are applied to the published DiaBD configuration's training out-of-fold probabilities. They do not change the production cutoff of 0.51.

A higher cutoff lowers false positives and raises false negatives. That is an operating-point choice, not evidence that the model ranks cases better.

| threshold | precision | recall | specificity | fp | fn | pr_auc | brier |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0.3 | 0.0932 | 0.8417 | 0.4468 | 2122 | 41 | 0.1463 | 0.1871 |
| 0.4 | 0.1066 | 0.7568 | 0.5717 | 1643 | 63 | 0.1463 | 0.1871 |
| 0.51 | 0.1246 | 0.6293 | 0.7015 | 1145 | 96 | 0.1463 | 0.1871 |
| 0.6 | 0.1386 | 0.4633 | 0.8055 | 746 | 139 | 0.1463 | 0.1871 |
| 0.7 | 0.1797 | 0.2664 | 0.9179 | 315 | 190 | 0.1463 | 0.1871 |
| 0.8 | 0.2353 | 0.0309 | 0.9932 | 26 | 251 | 0.1463 | 0.1871 |

Precision-recall points for the same out-of-fold scores are in `curves/diabd_reference_pr_curve.csv`. Matplotlib is not installed, so no image was rendered.

Pima logistic reference at cutoff 0.5 on training out-of-fold rows: precision 0.6379, recall 0.7243, false positives 88, false negatives 59.