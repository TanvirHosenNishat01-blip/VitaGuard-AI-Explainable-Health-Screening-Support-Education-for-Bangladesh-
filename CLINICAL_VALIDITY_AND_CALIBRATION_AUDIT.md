# CLINICAL VALIDITY & CALIBRATION AUDIT
## TriNexus | VitaGuard AI — Medical Informatics & Patient Safety Evaluation
**Audit Date:** November 10, 2026  
**Auditor:** Clinical AI Auditor, Medical Informatics Specialist & Healthcare UX Architect  
**Document Code:** VG-AUDIT-P05-CLINICAL  

---

## 1. CLINICAL SUITABILITY & INTENDED USE ASSESSMENT

A clinical decision support system (CDSS) deployed in Bangladesh must align with local epidemiology, resource availability, and clinical triage pathways. Each of the four models was audited against its intended clinical utility.

```
+-------------------------------------------------------------------------------------------------------------------------+
|                                           CLINICAL SUITABILITY AUDIT MATRIX                                             |
+--------------------------+-----------------------+-----------------------------+--------------------+-------------------+
| Predictive Pathway       | Intended Setting      | Actual Origin Population    | Population Fit     | Clinical Safety   |
+--------------------------+-----------------------+-----------------------------+--------------------+-------------------+
| DiaBD Bangladesh Screen  | Primary Community     | 63 Bangladesh Rural Unions  | High Contextual Fit| P1 (Over-alerting)|
| Pima Diabetes Model      | Tertiary Laboratory   | Pima Native American Women  | SEVERELY MISMATCHED| P0 (Target Leak)  |
| Cleveland Cardio Model   | Community Heart Screen| Angiography Referral (USA)  | Spectrum Bias      | P1 (False Reass.) |
| WHO South Asia Chart     | Primary Care Routine  | South Asia Regional Cohort  | Standardized Fit   | ACCEPTABLE        |
+--------------------------+-----------------------+-----------------------------+--------------------+-------------------+
```

---

## 2. CALIBRATION FORENSICS & PROBABILITY DISTORTION

### 2.1 DiaBD Model Calibration Failure (Severe Probability Inflation)
When binary classifiers employ artificial reweighting (`scale_pos_weight = 14.81`), the raw sigmoid output represents an **odds-weighted score**, not an epidemiological posterior probability.

1. **Calibration-in-the-Large:**
   - **True Test Set Prevalence:** **6.35%** (65 events in 1,024 patients).
   - **Mean Predicted Model Probability:** **38.73%**.
   - **Calibration Gap:** **+32.38 percentage points** of systemic over-prediction.
   - Logistic recalibration intercept: $\alpha = -2.5187$ (ideal = 0.0); slope: $\beta = 0.7683$ (ideal = 1.0).

2. **Empirical Decile Calibration Breakdown:**

```
+--------+-------+--------------------+--------------------+--------------------+-----------------------+
| Decile | N     | Mean Predicted (%) | Observed Rate (%)  | Observed Events    | 95% Wilson CI         |
+--------+-------+--------------------+--------------------+--------------------+-----------------------+
| 1      | 103   | 8.62%              | 0.00%              | 0                  | [0.00% – 3.60%]       |
| 2      | 103   | 12.93%             | 2.91%              | 3                  | [1.00% – 8.22%]       |
| 3      | 103   | 20.07%             | 2.91%              | 3                  | [1.00% – 8.22%]       |
| 4      | 103   | 26.58%             | 4.85%              | 5                  | [2.09% – 10.86%]      |
| 5      | 102   | 32.73%             | 5.88%              | 6                  | [2.72% – 12.24%]      |
| 6      | 102   | 40.23%             | 5.88%              | 6                  | [2.72% – 12.24%]      |
| 7      | 102   | 48.94%             | 4.90%              | 5                  | [2.11% – 10.97%]      |
| 8      | 102   | 57.57%             | 7.84%              | 8                  | [4.03% – 14.72%]      |
| 9      | 102   | 65.94%             | 11.76%             | 12                 | [6.86% – 19.45%]      |
| 10     | 102   | 74.51%             | 16.67%             | 17                 | [10.67% – 25.08%]     |
+--------+-------+--------------------+--------------------+--------------------+-----------------------+
```

3. **Clinical Impact on Patients:**
   - In decile 10, patients are informed their predicted risk is **74.5%**. In reality, only **16.7%** of patients in this bin had diabetes.
   - In decile 6, patients are informed their risk is **40.2%**. In reality, only **5.9%** were diabetic.
   - **Psychological and Operational Harm:** Presenting uncalibrated model scores directly as "Estimated chance: XX%" causes severe health anxiety and overwhelms Upazila Health Complexes with false alarms (PPV = 11.6%).

---

## 3. CLINICAL THRESHOLD & OPERATIONAL TRADE-OFFS

### 3.1 DiaBD Decision Cutoffs
The operational decision threshold was set at $\tau = 0.51$ based on a recall floor ($R \ge 0.648$) during 5-fold training cross-validation:

```
+--------------------+------------------+------------------+------------------+--------------------------------------+
| Cutoff Level       | Test Sensitivity | Test Specificity | Test PPV         | Clinical Consequence                 |
+--------------------+------------------+------------------+------------------+--------------------------------------+
| 0.35 ("Moderate")  | 75.38% (49/65)   | 49.84% (478/959) | 9.25% (49/530)   | Catches 49 cases; 481 false alarms.  |
| 0.51 (Operational) | 58.46% (38/65)   | 69.76% (669/959) | 11.59% (38/328)  | Misses 27 cases; 290 false alarms.   |
| 0.60 ("High Risk") | 46.15% (30/65)   | 79.35% (761/959) | 13.16% (30/228)  | Misses 35 cases (over half missed!). |
+--------------------+------------------+------------------+------------------+--------------------------------------+
```
- **False Negative Analysis:** At the operational threshold ($0.51$), the model fails to detect **27 out of 65 diabetic individuals** (41.5% false negative rate). In rural Bangladesh, a false reassurance ("Under cutoff") may delay diagnosis until microvascular complications manifest.
- **Young Adult Vulnerability:** For patients under age 40, the model missed **19 out of 22 diabetic individuals** (sensitivity: **13.64%**). The model attributes risk primarily to older age and hypertension, failing to identify young, lean individuals with diabetes.

### 3.2 Cleveland Model Threshold ($\tau = 0.50$)
- In the held-out test split ($n=60$), the model misclassified **5 out of 28 individuals with coronary artery disease** as low-risk (false negative rate: **17.86%**).
- In a cardiology context, sending home 5 symptomatic individuals with severe coronary stenosis (who were about to undergo fluoroscopy) represents a significant clinical risk.

---

## 4. POPULATION SHIFT & BIOLOGICAL PLAUSIBILITY RISKS

### 4.1 Pima Indians vs Bangladeshi Phenotype
- **Genetic & Physiological Differences:** Pima Indians possess unique genetic determinants (e.g., thrifty gene variants) and high rates of extreme obesity. South Asians exhibit the "thin-fat phenotype" — developing insulin resistance, diabetes, and cardiovascular disease at significantly lower BMI thresholds ($\ge 23 \text{ kg/m}^2$ overweight, $\ge 27.5 \text{ kg/m}^2$ obese vs Western cutoffs of 25 and 30).
- **Measurement Disconnect:** Fasting serum insulin and triceps skinfold thickness are virtually never available in primary rural health facilities across Bangladesh. Forcing users to enter or guess these values invalidates screening.

### 4.2 Spectrum Bias in Cleveland Cardiovascular Model
- **Tertiary Referral Distortion:** The Cleveland cohort consists entirely of patients with high clinical suspicion who underwent invasive coronary catheterization (disease prevalence = 46.1%).
- **Community Reality:** In a community screening setting in Bangladesh, prevalence of angiographic CAD is far lower (~5–10%). Applying this model in primary care will lead to significant over-referral for invasive procedures.

---

## 5. WHO SOUTH ASIA CHART — CLINICAL EVALUATION

### 5.1 Verification of Clinical Logic
1. **Age Range Enforcement:** The model strictly limits evaluation to ages 40–74. Patients younger than 40 have low 10-year absolute risk, and calculating lifetime risk requires different clinical tools.
2. **Exclusion of Established CVD:** Patients with previous myocardial infarction, angina, or stroke already have known secondary cardiovascular disease. The chart logic in `bd_cvd_chart.py` correctly blocks calculation (`prior_cvd == 1` raises HTTP 400 with an explicit refusal to guess a 10-year primary risk).
3. **Blood Pressure Consistency:** Rejects diastolic $\ge$ systolic blood pressure.
4. **Clinical Clarity:** The UI describes the output as a "10-year epidemiological risk category" rather than an acute individual diagnostic verdict.

---

## 6. RECOMMENDATIONS FOR CLINICAL DEPLOYMENT

1. **Probability Display Reform:** Cease displaying raw, uncalibrated probability percentages for the DiaBD model. Replace with calibrated risk tiers (Low / Average / Elevated) derived from isotonic or Platt recalibration.
2. **Explicit Warning on Young Adults:** Add a clinical disclaimer to the DiaBD screening wizard stating: *"For individuals under age 40, normal screening results do not rule out diabetes. Consult a healthcare provider if experiencing symptoms (increased thirst, frequent urination, unexplained weight loss)."*
3. **Retire Pima Model from Patient UI:** Complete withdrawal of the Pima diabetes pathway from production to eliminate risks from target-conditional imputation leakage.
4. **Clarify Secondary Nature of Heart Model:** Re-label the Cleveland model as *"Cardiology Referral Decision Aid for Confirmed Hospital Workups"*, reserving the WHO chart for general community screening.
