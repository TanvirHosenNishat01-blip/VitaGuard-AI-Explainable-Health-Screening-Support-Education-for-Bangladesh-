> Documentation note, 2026-11-19: the Pima data-card sentence described below was corrected after this research run. Consented Pima access remains open. The DiaBD sampling-frame conflict remains unresolved at row level. See `submission/final_readiness/DOCUMENTATION_CONSISTENCY_AUDIT.md`.

# Final comprehensive research report

Overall conclusion: **D. CURRENT DATA IS INSUFFICIENT — NEW REPRESENTATIVE DATA REQUIRED.**

Production changes: none. Protected hashes matched after the run. The DiaBD cutoff remains 0.51.

## Answers

1. The four pathways were audited from the files in the repository, including a new age-band ranking check and two fits that earlier runs had not used for this question.
2. Overlooked issues that are real: the data card and the metrics note describe DiaBD's sampling frame differently, and the CSV cannot settle it. Family history is not enriched among positives. Pulse pressure repeats systolic pressure. The Pima card still says the patient path is disabled, while the consented route is open with a cohort limit.
3. Age, BMI, and blood-pressure products were tested inside training folds. They did not clear the young-adult rule.
4. Naive Bayes was the unused simple family. It did not beat the published XGBoost ranking. Further families on this file are low priority.
5. The age gap is partly a low base rate and a global cutoff above the young positive scores, and partly weak ranking: within-band PR-AUC for ages 21–40 is 0.0745 on 53 positives.
6. False positives were not reduced by the interaction model or naive Bayes under the pre-registered rule. Earlier boosting came close on a 15 percent false-positive margin and was rejected without a locked-test retry.
7. The binding limit is the data: few positives, weak non-lab separation, no site or time key, and glucose held out on purpose.
8. The largest difference would be a new approved sample with a pre-specified label and more labeled adults aged 21–40.
9. Feasible now: keep the current models, keep 0.51, and state the age gap and the 290/27 counts.
10. Any new cutoff, calibration claim, or young-adult rule needs an independent sample. That sample is not in this repository.

The 87.66 percent Pima figure and the Cleveland 60-row accuracy are not general-population results. The WHO chart was not treated as a model.
