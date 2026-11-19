# Data cards

**Governance:** NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED

These cards describe datasets already in the project. They are not a license grant, an ethics approval, or permission to collect new patient data. Where a license or redistribution right was not confirmed in the repository, the status is **NOT VERIFIED**.

## DiaBD (DS-06)

| Item | Record |
| --- | --- |
| File | `ML_Research/Phase06B/DiaBD/diabd_raw.csv` |
| Rows | 5,288 raw; 5,119 cleaned in the internal inventory |
| Target | `diabetic` |
| File hash recorded in the inventory | `d9f868c9ce8eefe545294156ed1626f60fdb33f507f9ca021fd34fa4b575741a` |
| Rows used by the published model | 5,119 clean rows, 324 positives. Locked test: 1,024 rows, accuracy 0.6904, precision 0.1159, recall 0.5846, 290 false positives, 27 false negatives, cutoff 0.51 |
| Published description | `ML_Model/evaluation/bd_diabetes_metrics.json` cites Mendeley DOI 10.17632/m8cgwxs9s6 and says "63 Bangladesh unions, women and men, ages 21 to 80. Not a national sample and not WHO STEPS." The data article for that DOI (Data in Brief, PMC12221696) describes community-health-worker collection across 63 unions. This audit did not byte-compare the CSV to a Mendeley download. |
| Older internal inventory | `PHASE06C0_DATASET_INVENTORY.md` describes an urban outpatient survey in a BIRDEM Dhaka and Mymensingh catchment. That sentence is an inventory statement. The data article cited above does not describe that catchment, and the CSV cannot confirm it. |
| What the CSV can show | Columns are age, gender, pulse rate, blood pressure, glucose, height, weight, BMI, family and diagnosis fields, and the diabetic label. There is no site, union, district, hospital, or date column. |
| Sampling frame | Dataset sampling frame and site-level provenance have not been independently verified from the available source documentation. |
| Product use | Bangladesh diabetes screening score. The score is not a calibrated personal probability and is not a diagnosis. It is not a national accuracy. |
| External license | NOT VERIFIED. The data article states CC BY 4.0. This repository has not completed an independent redistribution review, so that statement is not treated as a verified right. |
| New collection | Not authorized |

## Pima (DS-01)

| Item | Record |
| --- | --- |
| Historical file | `dataset/raw/diabetes.csv`. This is the file tied to the leaked pipeline. It is not the leakage-free research table. |
| Leakage-free research file | `ML_Research/Phase06B/Pima/pima_canonical_raw.csv`, 768 rows, 268 positives |
| Cohort | Historical Phoenix-area study population: women aged 21–81. Not a model for men, children, or patients in Bangladesh. |
| Application permission | Consented access is open. `POST /api/predict` and `POST /api/predict/diabetes` accept guests and signed-in patients when `screening_consent` is true. A missing consent returns 400. The current route does not return 403 for a consented request. The API enforces the research-table ranges, including age 21–81. It has no sex field, so the women-only limit is stated, not enforced as a sex filter. |
| Research restriction, historical | Older research notes said the patient path should stay closed. Those notes are archives. They do not describe the current route. |
| Output | A screening estimate. Not a diagnosis. |
| Invalid historical accuracy | 87.66 percent in `ML_Model/evaluation/metrics.json` is invalid because insulin values were imputed using the label. |
| Valid research result | Leakage-free logistic regression, C=0.3, median imputation inside training folds, seed 42, five-fold out-of-fold on 614 training rows: PR-AUC 0.7166, Brier score 0.1627. This is a research evaluation, not a production replacement and not a locked-test accuracy. |
| Redistribution | NOT VERIFIED |

## Cleveland heart disease (DS-05)

| Item | Record |
| --- | --- |
| File | `dataset/raw/heart_cleveland_upload.csv` |
| Rows | 297 |
| Origin described in project materials | Cleveland Clinic, 1984, Robert Detrano. Target is catheterization stenosis, not community screening. |
| Product use | Historical referral model. Global coefficients, not local SHAP for this pathway. Do not present it as general-population screening. |
| External license | NOT VERIFIED |

## WHO South Asia non-laboratory CVD chart

| Item | Record |
| --- | --- |
| Code | `backend/app/services/bd_cvd_chart.py` |
| What it is | A deterministic lookup of published chart cells. It is not an internally trained model. |
| Ages | 40–74. Ages outside that range are refused. |
| Prior CVD | A prior event stops the chart lookup. |
| Redistribution of chart values | NOT VERIFIED |

## Not production validation

DS-08 (downloaded CVD file) and DS-09 (Pabna metadata) are unverified or absent as production evidence. They are not a validation cohort for this product.
