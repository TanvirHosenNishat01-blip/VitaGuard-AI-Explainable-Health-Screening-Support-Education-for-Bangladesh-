# External validation protocol

Governance: NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.

This protocol does not collect data, contact a hospital, contact a patient, or submit an ethics application. A later study needs human approval before any of those steps.

## DiaBD-style screening

Fields: age, sex as recorded, BMI, systolic pressure, diastolic pressure, family history of diabetes, and a label defined before the model is scored. Glucose may be used only to define or audit the label. It is not a model input for this pathway.

Inclusion: ages 21 to 80, BMI 14 to 45, systolic 80 to 220, diastolic 50 to 130 and below systolic. Exclusion: missing model fields, inconsistent height and weight, and any row whose label was created by the model itself.

Split: lock a site or a time period that the model never saw. Fit imputation, scaling, and thresholds only on the development portion. Score the locked portion once.

De-identification: remove names, phone numbers, national IDs, and exact addresses before the file reaches the research environment.

## Pima and Cleveland

An external file must use the same measurement definitions. Pima remains a historical cohort of women aged 21 to 81 near Phoenix unless a new approved dataset says otherwise. Cleveland remains a catheterization cohort, not a community screen.

## WHO chart

Do not refit the chart. An external check compares inputs and published cells. It does not create a new accuracy.