# Baseline reproduction

DiaBD production artifact on the seed-42 locked test: accuracy 0.6904, precision 0.1159, recall 0.5846, PR-AUC 0.1658, false positives 290, false negatives 27, cutoff 0.51, n=1024.

Cleveland production artifact on the same split style: accuracy 0.9167, confusion counts 32/0/5/23, n=60.

Pima leakage-free logistic C=0.3 training out-of-fold PR-AUC is 0.7166 on 614 training rows. The 87.66 percent file was not used.

WHO lookup: 700 cells, ages 39 and 75 return no cell, ages 40 and 74 resolve, sampled in-range misses 0. The table was not edited.

These locked-test numbers reproduce the published models. They were not used to choose a new model.