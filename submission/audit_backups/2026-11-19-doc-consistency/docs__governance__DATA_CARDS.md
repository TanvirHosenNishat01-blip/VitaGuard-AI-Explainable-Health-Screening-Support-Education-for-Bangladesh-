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
| What the internal inventory says | Urban Bangladesh outpatient survey, BIRDEM Dhaka and Mymensingh catchment |
| Product use | Bangladesh diabetes screening score. The score is not a calibrated personal probability and is not a diagnosis. |
| External license | NOT VERIFIED |
| New collection | Not authorized |

## Pima (DS-01)

| Item | Record |
| --- | --- |
| File | `dataset/raw/diabetes.csv` |
| Rows | 768 |
| Origin described in project materials | UCI / NIDDK Pima Indian women near Phoenix, Arizona |
| Product use | Patient-facing pathway is disabled. Administrator or research use only. |
| Ethics note | This is a Native American community dataset. It is not a model for men, children, or patients in Bangladesh. |
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
