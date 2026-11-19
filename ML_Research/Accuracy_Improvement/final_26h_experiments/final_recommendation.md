# Final 26-hour recommendation

No production model was replaced. No prediction endpoint was changed. The production database was not opened for writing. Protected artifact hashes were identical before and after the run.

Overall conclusion: **B. No reliable improvement found; retain the current models and the published WHO chart.**

The previous leakage-free search was reproduced before any new candidate was fit. CatBoost is not installed in this environment and was not added. Every new comparison below is a training-fold estimate. A new candidate was scored on a locked test only if it first cleared a margin written down in `experiment_config.json`. None did, so no new locked-test score was produced.

## Bangladesh DiaBD

Conclusion **B**. The current production model should remain unchanged. No candidate is suitable for a promotion review.

Existing production performance, recomputed from `bd_diabetes.joblib` on the seed-42 stratified 20 percent split (1,024 rows): accuracy 0.6904, recall 0.5846, precision 0.1159, specificity 0.6976, F1 0.1934, PR-AUC 0.1658, ROC-AUC 0.7038. Confusion matrix: 669 true negatives, 290 false positives, 27 false negatives, 38 true positives. Threshold 0.51. Majority-class accuracy on the cleaned table is 0.9367 and was not used as a target.

Best experimental candidate by out-of-fold PR-AUC: `xgb_more_regularized`, PR-AUC 0.1501 (bootstrap 95 percent interval 0.1262 to 0.1855). The published XGBoost configuration, refit only inside the same folds, had PR-AUC 0.1463 (0.1217 to 0.1813). The difference is 0.0038, below the pre-registered margin of 0.01. The intervals overlap. At the F2 cutoff chosen on those folds, the candidate had recall 0.7259, precision 0.1199, specificity 0.6403, and 71 false negatives out of 259 training positives. That cutoff is an exploratory operating point. It was not applied to the locked test.

Evaluation: stratified 5-fold out-of-fold probabilities on the 4,095 training rows. Imputation was unnecessary because the eight model fields had no missing values. Feature selection for one logistic candidate ran inside the fold. Glucose stayed out. Its training-row correlation with the label is 0.2978 and that column was only reported, never passed to a model. Three exact duplicate rows exist and none have conflicting labels; they were left in place so the locked split would stay the published split. `pulse_pressure` correlates 0.8369 with systolic pressure. Dropping `pulse_pressure` and `high_bp` changed logistic PR-AUC from 0.1418 to 0.1421.

Leakage audit: passed. Further review: no.

## Pima

Conclusion **B**. Keep the current production artifact untouched. No leakage-free candidate is suitable for a promotion review.

The leaked 87.66 percent figure was not a baseline. The leakage-free reference is regularized logistic regression (`C=0.3`) on the canonical 768-row table. Its out-of-fold PR-AUC is 0.7166 (bootstrap 95 percent interval 0.6543 to 0.7886), ROC-AUC 0.8399. The earlier leakage-free locked test for that family of models remains accuracy 0.7078 and recall 0.5185, and that earlier result reproduced.

Best experimental candidates, `hist_moderate` and the logistic/extra-trees average, both reached PR-AUC 0.7174. That is 0.0008 above the reference, below the margin of 0.01. Fold PR-AUC standard deviation is about 0.08 to 0.10, so the candidates are not stable enough to treat a 0.0008 difference as a gain. Random forest reached a higher F2-threshold accuracy (0.7117) with a lower PR-AUC (0.7031), which is why accuracy was not the selection metric.

Zero values in glucose (5), blood pressure (35), skin thickness (227), insulin (374), and BMI (11) were set to missing before the split. Medians were fit inside each training fold. Outcome-conditional insulin fills were not computed. There were no duplicate rows. The processed train/test CSVs were not used. Patient-facing routes were not edited.

Leakage audit: passed. Further review: no.

## Cleveland

Conclusion **B**. Keep the current logistic regression. The 60-row test was not used to pick a replacement.

The production artifact, at its saved 0.5 cutoff, reproduces the published locked test: accuracy 0.9167, recall 0.8214, precision 1.0, specificity 1.0, F1 0.902, PR-AUC 0.9626, ROC-AUC 0.9542. Confusion matrix: 32 true negatives, 0 false positives, 5 false negatives, 23 true positives. The same split, the same 13 features, and the `condition` label were used. There are 297 rows, 137 positives, no missing model fields, and no duplicate rows.

Repeated stratified cross-validation (5 folds, 10 repeats) on the 237 training rows is the comparison. `logistic_C0.1` had the highest mean PR-AUC, 0.8807 versus 0.8697 for `logistic_C1`. The paired difference across repeats averages 0.011, with a 2.5 to 97.5 percentile range of 0.0049 to 0.0179. The pre-registered margin was 0.02, so this does not clear the bar. Under the F2 cutoff the same model’s mean accuracy is 0.6662, while its mean accuracy at the production-style 0.5 cutoff is 0.8207. Those are different operating points. Coefficient signs agreed with the full training fit on every feature except age and `restecg`, which agreed on 4 of 5 folds.

A small locked-test advantage was not available to select a model, because no candidate was sent to that test. Further review: no. The current model stays.

## WHO South Asia chart

Conclusion **B**. Retain the published table.

This pathway was not trained. The lookup has 700 of 700 expected cells. Recorded percents run from 1 to 40. Ages 40 and 74 resolve, ages 39 and 75 do not. Systolic and BMI band edges match the published cuts. The same input returns the same cell. The route source still limits age to 40–74 and rejects `prior_cvd == 1` before the lookup. The chart file was not modified.

Further review: no.

## Promotion

No promotion package is opened. A later replacement would still need an independent evaluation, a leakage audit, a statistical review, artifact verification, and an explicit human approval.
