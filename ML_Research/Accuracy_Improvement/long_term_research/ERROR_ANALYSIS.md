# Error analysis

Published DiaBD locked test: 290 false positives and 27 false negatives out of 1024 rows.
Same configuration, training out-of-fold, cutoff 0.51: 1145 false positives and 96 false negatives out of 4095 rows.

Mean inputs by training out-of-fold error group at cutoff 0.51. These are descriptions, not causes.

| feature | false_positive | true_negative | false_negative | true_positive |
| --- | --- | --- | --- | --- |
| age | 53.6044 | 41.6793 | 46.5312 | 54.4847 |
| bmi | 23.7075 | 21.625 | 21.7575 | 24.6294 |
| systolic_bp | 152.2646 | 124.5184 | 132.0312 | 156.3558 |
| diastolic_bp | 91.3904 | 77.5321 | 80.9479 | 93.8712 |

Cleveland locked test: 0 false positives and 5 false negatives on 60 rows. That pattern can move on another 60-row draw. It is not a population screening result.