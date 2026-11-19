> Documentation note, 2026-11-19: after this research run, `docs/governance/DATA_CARDS.md` was corrected. The card now records both the metrics-file description and the older inventory description, and it states that the sampling frame is not independently verified. The findings below describe the repository at the time of the research run.

# Complete dataset audit

Governance: NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.

No rows were deleted for this audit. The published cleaning rules were counted, not changed.

## Bangladesh DiaBD

The file is `ML_Research/Phase06B/DiaBD/diabd_raw.csv`, 5288 raw rows and 15 columns. The repository describes it in two ways: the metrics note says 63 Bangladesh unions, ages 21 to 80, not a national sample and not WHO STEPS; the data card says an urban outpatient survey in the BIRDEM Dhaka and Mymensingh catchment. The CSV has no site or date column, so those two descriptions cannot be checked from the table. External license: NOT VERIFIED.

Clean rows used by the published model: 5,119. Positives: 324. Prevalence: 0.0633. Exclusion counts under the existing rules: `{"sex_not_female_or_male": 0, "label_not_yes_or_no": 0, "age_outside_21_80": 0, "bmi_outside_14_45": 36, "sbp_outside_80_220": 6, "dbp_outside_50_130": 6, "dbp_not_below_sbp": 0, "family_not_binary": 0, "height_outside_1_35_2_05": 66, "weight_outside_35_140": 85, "bmi_disagrees_with_height_weight": 0}`.

Model fields have no missing values after cleaning. Exact duplicate feature rows in the earlier audit: 3, with no conflicting labels. Rows whose model fields match after rounding to 1 decimal: 6 extra copies. They were kept.

Glucose correlation with the label on the training split only: 0.2978. Glucose is not a model input. Pulse pressure correlates 0.8336 with systolic pressure. Systolic and diastolic correlate 0.7183. Family-history rate is 0.0154 among training positives and 0.0313 among training negatives.

The label is the published DiaBD diabetes field. This audit cannot prove how the glucose test or the questionnaire was taken.

## Pima

Canonical file: 768 rows, 268 positives. Zeros set to missing: {"Glucose": 5, "BloodPressure": 35, "SkinThickness": 227, "Insulin": 374, "BMI": 11}. The data card names `dataset/raw/diabetes.csv` and says the patient path is disabled. The leakage-free research file is `pima_canonical_raw.csv`, and the current consented route is open with a cohort limit. Redistribution: NOT VERIFIED. Cohort: women aged 21 to 81 near Phoenix. Not a Bangladesh sample.

## Cleveland

`dataset/raw/heart_cleveland_upload.csv`: 297 complete rows, 137 positives. Target `condition` is a catheterization-cohort label. External license: NOT VERIFIED. No site or year column is present for a temporal split.

## WHO South Asia chart

Published lookup, 700 cells, ages 40 to 74. Not a dataset with labels. Chart-value redistribution: NOT VERIFIED.
