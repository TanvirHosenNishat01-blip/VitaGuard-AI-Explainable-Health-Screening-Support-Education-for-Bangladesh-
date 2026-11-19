# Model architecture audit

The production DiaBD artifact is an XGBoost classifier with cutoff 0.51. The production Cleveland artifact is class-weighted logistic regression with the library default cutoff 0.5. Pima's saved pickle is the historical artifact; its leakage-free research reference is logistic regression with C=0.3. The WHO path has no model.

Earlier leakage-free comparisons in `long_term_research` and `final_26h_experiments` already covered logistic regression, in-fold selection, random forest, extra trees, histogram gradient boosting, XGBoost, and a simple average of logistic and extra trees. None cleared the pre-registered margins. CatBoost is not installed and was not added.

This audit added one family that those runs did not fit: Gaussian naive Bayes, inside a training-fold scaler. Out-of-fold at cutoff 0.51: {"n": 4095, "positives": 259, "tp": 70, "fp": 388, "fn": 189, "tn": 3448, "recall": 0.2703, "precision": 0.1528}. PR-AUC 0.1382 against the XGBoost reference PR-AUC 0.1463. Pre-registered pass: False.

A more complex model is not justified by these tables. The DiaBD PR-AUC of 0.1658 on 1,024 locked rows sits near a 6.3 percent base rate. Cleveland's 0.9167 accuracy is 55 of 60 catheterization rows. Pima's leakage-free out-of-fold PR-AUC remains 0.7166.
