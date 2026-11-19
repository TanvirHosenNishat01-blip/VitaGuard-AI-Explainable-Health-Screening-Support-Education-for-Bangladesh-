# Phase 06C — Clinical Machine Learning Validation Protocol
**TriNexus | VitaGuard AI — Clinical Machine Learning Division**  
**Protocol Version:** 1.0 (Pre-Registered Validation Standard)  
**Document Date:** November 10, 2026  
**Auditor & Biostatistician:** Senior Clinical AI Auditor & Biostatistics Reviewer  
**Standard Adherence:** TRIPOD (Transparent Reporting of Multivariable Prediction Models) & DECIDE-AI Guidelines  
**Status:** **FROZEN VALIDATION SPECIFICATION**

---

## 1. Protocol Purpose & Guiding Principles

This protocol governs the prospective statistical validation of candidate ML models and post-hoc calibrators developed during Phase 06B for TriNexus | VitaGuard AI.

### Core Principles
1. **Zero Data Leakage:** The evaluation protocol and acceptance thresholds are frozen before examining any validation dataset.
2. **Independence:** Models and post-hoc calibrators must be evaluated on observations that were not utilized in model development, cross-validation tuning, or exploratory threshold searches.
3. **Clinical Grounding:** Metrics must prioritize clinical utility (discrimination, calibration, net benefit) over raw accuracy.

---

## 2. Independent Cohort & Provenance Requirements

### 2.1 DiaBD Candidate Pathway (Bangladesh Diabetes Screening)
To establish genuine clinical validity for Bangladesh, the DiaBD Platt-calibrated XGBoost pipeline requires evaluation against an independent clinical cohort.

#### Independent Cohort Specification
- **Target Population:** Adult individuals ($\text{Age} \ge 21$) residing in Bangladesh presenting to community screening camps or outpatient primary care centers.
- **Geographic Setting:** Must represent clinics or districts **outside** the original Dhaka/Mymensingh tertiary development centers (e.g., primary care centers in Sylhet, Rajshahi, Rangpur, Khulna, or Barisal) to test transportability.
- **Reference Standard:** Definitive diabetes status verified via laboratory-standard fasting plasma glucose ($\text{FPG} \ge 7.0\text{ mmol/L}$ / $126\text{ mg/dL}$), 2-hour post-OGTT plasma glucose ($\ge 11.1\text{ mmol/L}$ / $200\text{ mg/dL}$), or standardized laboratory $\text{HbA1c} \ge 6.5\%$ ($48\text{ mmol/mol}$).
- **Required Feature Alignment:**
  1. `age`: Integer years (21–80).
  2. `sex`: Biological sex (0 = Female, 1 = Male).
  3. `bmi`: Objectively measured weight ($\text{kg}$) divided by height squared ($\text{m}^2$).
  4. `systolic_bp`: Resting systolic blood pressure ($\text{mm Hg}$).
  5. `diastolic_bp`: Resting diastolic blood pressure ($\text{mm Hg}$).
  6. `family_diabetes`: First-degree relative diagnosed with diabetes (0 = No, 1 = Yes).
  7. `pulse_pressure`: Derived feature ($\text{SBP} - \text{DBP}$).
  8. `high_bp`: Derived indicator ($\text{SBP} \ge 140 \lor \text{DBP} \ge 90$).
- **Minimum Statistical Power Sample Size:**  
  Assuming a true prevalence of $\sim 6.3\%$ and a target AUROC of $0.70$, estimating calibration slope within a $\pm 0.15$ margin of error requires a minimum of **$100$ diabetic events**, dictating an independent validation cohort of at least:
  $$N_{\text{min}} \ge \frac{100}{0.063} \approx \mathbf{1,588 \text{ participants}}$$

#### Status of Existing Repository Data
- An inspection of the codebase indicates that no independent external Bangladeshi cohort matching these 8 clinical variables is currently present in the repository. (The historical `pabna_external.json` was a 465-woman cohort collected with Pima-like laboratory units and remains incompatible with DiaBD).
- **Protocol Directive:** If no independent external DiaBD cohort is supplied for Phase 06C, external validation must be officially classified as **NOT EVALUABLE**, and internal validation must be conducted strictly using frozen k-fold or repeated bootstrap splits uncoupled from prior threshold tuning.

---

### 2.2 Cleveland Candidate Pathway (Cardiovascular Explainability)
- **Target Population:** Patients presenting with suspected ischemic cardiac symptoms.
- **Provenance Requirement:** Verification of 13 standard clinical parameters, including fluoroscopy vessel count (`ca`) and exercise scintigraphy (`thal`).
- **Subgroup Sample Constraint:** Validation cohorts must contain sufficient female representation ($N_{\text{female}} \ge 100$, with at least $30$ events) to establish non-inferiority of SHAP attributions across biological sexes.

---

## 3. Methodological Validation Framework

### 3.1 Test-Set Independence & Blinding Protocol
1. **Zero In-Sample Re-tuning:** The model weights (`best_model.pkl`, `bd_diabetes.joblib`) and calibrator parameters ($a=0.76801, b=-2.49962$) are locked. No fitting or adjusting of parameters is permitted.
2. **Exploratory Test Set Quarantine:** The 1,024-patient test split used in Phase 06B is quarantined from any new threshold selection. Operating thresholds must be derived independently.

### 3.2 Calibration Validation Methodology
Calibration must be assessed using both parametric and non-parametric indices:
1. **Calibration Slope & Intercept:** Estimated via **unregularized** logistic regression:
   $$\text{logit}(P(Y=1 \mid s)) = \alpha + \beta \cdot \text{logit}(s)$$
   Ideal values: $\beta = 1.00$ (spread), $\alpha = 0.00$ (calibration-in-the-large).
2. **Brier Score & Skill Score:**
   $$\text{Brier} = \frac{1}{N} \sum_{i=1}^N (p_i - y_i)^2$$
   $$\text{Brier Skill Score (BSS)} = 1 - \frac{\text{Brier}}{\text{Brier}_{\text{null}}}$$
   where $\text{Brier}_{\text{null}} = \bar{y}_{\text{val}}(1 - \bar{y}_{\text{val}})$. A valid model must demonstrate $\text{BSS} > 0$.
3. **Expected Calibration Error (ECE):**
   Evaluated under both 10 equal-width bins and 10 equal-frequency (quantile) bins.

### 3.3 Threshold Validation & Decision Curve Analysis (DCA)
1. **Pre-Specified Operating Thresholds:**  
   Thresholds must be selected a priori from development folds (e.g., targeting fixed sensitivities such as 80% or 60%), **not** after observing validation outcomes.
2. **Decision Curve Analysis (Net Benefit):**  
   Clinical utility must be evaluated across clinical decision thresholds $p_t \in [0.03, 0.20]$:
   $$\text{Net Benefit} = \frac{\text{True Positives}}{N} - \frac{\text{False Positives}}{N} \left( \frac{p_t}{1 - p_t} \right)$$
   The model must achieve higher Net Benefit than both the "Screen All" and "Screen None" strategies.
3. **Uncertainty Quantification:**  
   Sensitivity, Specificity, PPV, NPV, and Youden's $J$ must be reported with **95% bootstrap confidence intervals** (1,000 resamples).

### 3.4 Subgroup Disparity Analysis
Validation must report stratified performance across:
- **Sex:** Male vs. Female (evaluating whether female false-negative rate is elevated).
- **Age Categories:** Younger ($< 40$ years), Middle-aged ($40–59$ years), Older ($\ge 60$ years).
- **Hypertension Status:** Hypertensive vs. Normotensive.

---

## 4. Explicit Pass / Fail / Not-Evaluable Acceptance Criteria

Each evaluated candidate pathway in Phase 06C must be graded according to the pre-registered thresholds below:

| Evaluation Dimension | Primary Metric | Passing Criterion (PASS) | Conditional Criterion (LIMITATIONS) | Failing Criterion (FAIL) |
| :--- | :--- | :--- | :--- | :--- |
| **DiaBD Discrimination** | AUROC | $\ge 0.70$ (95% CI lower bound $\ge 0.65$) | $0.65 \le \text{AUROC} < 0.70$ | $\text{AUROC} < 0.65$ |
| **DiaBD Calibration Slope**| Slope ($\beta$) | $0.85 \le \beta \le 1.15$ | $0.75 \le \beta < 0.85 \lor 1.15 < \beta \le 1.25$ | $\beta < 0.75 \lor \beta > 1.25$ |
| **DiaBD Probabilistic Skill**| Brier Skill Score | $\text{BSS} \ge +2.0\%$ vs cohort null | $0.0\% < \text{BSS} < +2.0\%$ | $\text{BSS} \le 0.0\%$ (Worse than null) |
| **DiaBD Calibration Error**| ECE (Quantile) | $\text{ECE} \le 0.030$ (3.0%) | $0.030 < \text{ECE} \le 0.060$ | $\text{ECE} > 0.060$ |
| **DiaBD Decision Utility** | Net Benefit (DCA) | Higher than "Screen All" in $0.04 \le p_t \le 0.15$ | Equivalent to "Screen All" | Lower than "Screen All" or "Screen None" |
| **Cleveland SHAP Additivity**| Max Test Additivity Error| $\max |\epsilon| < 1.0 \times 10^{-5}$ | $1.0 \times 10^{-5} \le \max |\epsilon| < 1.0 \times 10^{-3}$ | $\max |\epsilon| \ge 1.0 \times 10^{-3}$ |
| **Cleveland Sex Equity** | Subgroup AUROC Gap | $|\text{AUROC}_{\text{male}} - \text{AUROC}_{\text{female}}| \le 0.08$ | $0.08 < |\Delta| \le 0.15$ | $|\Delta| > 0.15$ with $N_{\text{pos}} \ge 20$ |
| **External Cohort Availability**| Data Completeness | Valid independent dataset available | Partial cohort requiring imputation | **No independent cohort $\to$ NOT EVALUABLE** |

---

## 5. Protocol Sign-Off & Freeze

This validation protocol is formally frozen. Any future execution of Phase 06C must strictly measure findings against these exact quantitative benchmarks.
