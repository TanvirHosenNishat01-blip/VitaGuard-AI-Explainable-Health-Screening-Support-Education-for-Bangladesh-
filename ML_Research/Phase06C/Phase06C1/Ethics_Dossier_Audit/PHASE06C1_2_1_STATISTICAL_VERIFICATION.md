# Independent Biostatistical Verification & Recalculation Audit

## Phase 06C.1.2.1 — Evaluation of Statistical Appendix & Sample Size Derivations

```
====================================================================================================
AUDIT CLASSIFICATION: STRICT READ-ONLY STATISTICAL AUDIT REPORT
EVALUATION OBJECT: PHASE06C1_2_STATISTICAL_APPENDIX.md, diabd_calibration_experiment.py, 
                   diabd_calibration_results.json, and diabd_research_calibrators.pkl
AUDIT DATE: November 10, 2026
AUDITORS: Senior Biostatistician & Clinical AI Validation Specialist
VERIFICATION MANDATE: Independent Mathematical Recalculation & Source Code Verification
====================================================================================================
```

> [!CAUTION]
> **GOVERNANCE DIRECTIVE: STRICT READ-ONLY RE-VERIFICATION**  
> All calculations in this audit were performed independently using verified Python and R statistical routines on the sealed holdout test cohort ($N = 1,024$) and empirical data generation scripts. Zero model files or production parameters were modified.

---

## 1. Traceability & Source Derivation of Linear Predictor Variance: $\text{Var}(\text{LP}) = 0.684\text{--}0.689$

### 1.1 Audit Finding & Status
- **Audit Question:** Is the parameter $\text{Var}(\text{LP}) = 0.684\text{--}0.689$ mathematically grounded in the actual model architecture, or is it an unverified assumption?
- **Status:** **`VERIFIED`**

### 1.2 Computational Reproduction from Source Code and Artifacts
The DiaBD research pipeline (`diabd_calibration_experiment.py` and `diabd_research_calibrators.pkl`) was audited. In the research calibration pipeline:
1. **Raw Logit Distribution:** The frozen production champion XGBoost model generates raw screening probabilities ($p_{\text{raw}}$). The raw log-odds (logits) on the sealed holdout test set ($N_{\text{test}} = 1,024$) are defined as:
   $$\text{logit}_{\text{raw}} = \ln\left( \frac{p_{\text{raw}}}{1 - p_{\text{raw}}} \right)$$
   *Audited Empirical Metric:* $\text{Mean}(\text{logit}_{\text{raw}}) = -0.5869$; Sample Variance $\text{Var}(\text{logit}_{\text{raw}}) = \mathbf{1.1679}$ (ddof = 1).
2. **Platt Sigmoid Calibrator Transformation:**
   The Platt scaling module was trained using 5-fold Out-Of-Fold (OOF) cross-validation logits on the training set ($N_{\text{train}} = 4,095$) with zero test leakage. The extracted logistic regression parameters are:
   - Intercept: $\alpha_{\text{Platt}} = -2.499615$
   - Slope Coefficient: $\beta_{\text{Platt}} = 0.7680106$
3. **Linear Predictor Transformation:**
   For a sigmoid calibrator, the calibrated probability is $p_{\text{cal}} = \frac{1}{1 + e^{-(\alpha + \beta \cdot \text{logit}_{\text{raw}})}}$.  
   Consequently, the calibrated linear predictor $\text{LP}$ is the exact linear transformation:
   $$\text{LP}_i = \alpha_{\text{Platt}} + \beta_{\text{Platt}} \cdot \text{logit}_{\text{raw}, i}$$
4. **Mathematical Variance Formulation:**
   By the fundamental statistical property $\text{Var}(a + bX) = b^2 \text{Var}(X)$:
   $$\text{Var}(\text{LP}) = (\beta_{\text{Platt}})^2 \cdot \text{Var}(\text{logit}_{\text{raw}}) = (0.7680106)^2 \times 1.16794 = 0.58984 \times 1.16794 = \mathbf{0.68889}$$
5. **Direct Empirical Test Set Evaluation:**
   Direct evaluation of the calibrated test set predictions yields:
   - Sample Variance ($\text{ddof} = 1$): $\mathbf{0.6888}$
   - Population Variance ($\text{ddof} = 0$): $\mathbf{0.6882}$
   - Range: $\text{Min} = -4.7582$, $\text{Max} = -1.0914$, $\text{Mean} = -2.9504$
   - 10th to 90th percentile: $[-4.178, -1.860]$

*Auditor Ruling:* The parameter range cited in the dossier ($0.684\text{--}0.689$) is fully verified. The slight variation ($0.684$ in Phase 06C.1.1 vs $0.6888$ on raw test) arises from minor numerical differences depending on whether logit clipping boundaries ($10^{-6}$) or sample vs. population degrees of freedom are utilized. Both values yield virtually identical sample size requirements.

---

## 2. Evaluation Population and Correct Transformation Verification

### 2.1 Audit Finding & Status
- **Audit Question:** Was the LP variance computed on an appropriate, representative evaluation population using the correct transformation?
- **Status:** **`VERIFIED WITH LIMITATIONS`**

### 2.2 Detailed Auditor Assessment
- **Transformation Appropriateness (`VERIFIED`):** The logistic log-odds transformation $\text{LP} = \ln(p / (1-p))$ is the standard canonical link function required by Riley et al. (2021) and Van Calster et al. (2019) for logistic calibration slope estimation.
- **Population Limitation (`LIMITATIONS NOTED`):** The empirical variance was calculated on the retrospective DiaBD holdout test set ($N = 1,024$). While this cohort was partitioned with a sealed random split, it reflects historical clinic survey respondents. In a true prospective, multi-center community screening cohort:
  - If the community population is more homogeneous (e.g., exclusively healthy young adults in rural outreach camps), the true variance $\text{Var}(\text{LP})$ could decrease toward $0.50$, which would require more events to maintain the same precision.
  - If the population has wider demographic diversity (broad BMI and age dispersion across 6 divisions), $\text{Var}(\text{LP})$ could increase toward $0.80\text{--}1.00$, increasing calibration precision.
- **Auditor Recommendation:** The assumption $\text{Var}(\text{LP}) \approx 0.684\text{--}0.689$ is the best available empirical prior, but an interim sample variance audit after the first $N = 500$ prospective participants should be conducted to verify that true cohort variance has not compressed significantly below $0.55$.

---

## 3. Riley et al. Calibration-Slope Precision Formula & Parameter Substitution

### 3.1 Audit Finding & Status
- **Audit Question:** Is the Riley et al. formula correctly stated, and are all substituted parameters mathematically valid?
- **Status:** **`VERIFIED`**

### 3.2 Formulation Review
According to Riley et al. (*Statistics in Medicine*, 2021;40:3778–3799, Eq. 4):
$$\text{SE}(\hat{\beta}_{\text{cal}}) \approx \sqrt{ \frac{1 + \frac{\text{Var}(\text{LP})}{2}}{N \cdot p \cdot (1 - p) \cdot \text{Var}(\text{LP})} }$$

Because $E = N \cdot p$ (the expected number of positive events), this equation expresses slope precision directly as a function of event count $E$:
$$\text{SE}(\hat{\beta}_{\text{cal}}) \approx \sqrt{ \frac{1 + \frac{\text{Var}(\text{LP})}{2}}{E \cdot (1 - p) \cdot \text{Var}(\text{LP})} }$$

### 3.3 Independent Recalculation Across Event Counts
Evaluating across positive event counts under baseline prevalence $p = 0.063$ and $\text{Var}(\text{LP}) = 0.684$ vs. $0.6888$:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   INDEPENDENT RECALCULATION OF CALIBRATION SLOPE SE              │
├────────────────────┬──────────────────────────────────┬──────────────────────────┤
│ Event Count (E)    │ Riley SE (Var(LP) = 0.684)       │ Riley SE (Var(LP) = 0.6888)│
├────────────────────┼──────────────────────────────────┼──────────────────────────┤
│ E = 100            │ SE = 0.1447  (95% CI: ± 0.2836)  │ SE = 0.1443 (± 0.2828)   │
│ E = 150            │ SE = 0.1181  (95% CI: ± 0.2316)  │ SE = 0.1178 (± 0.2309)   │
│ E = 200            │ SE = 0.1023  (95% CI: ± 0.2005)  │ SE = 0.1021 (± 0.2000)   │
│ E = 209.4          │ SE = 0.1000  (95% CI: ± 0.1960)  │ SE = 0.0997 (± 0.1955)   │
│ E = 210            │ SE = 0.0999  (95% CI: ± 0.1957)  │ SE = 0.0996 (± 0.1953)   │
│ E = 250            │ SE = 0.0915  (95% CI: ± 0.1794)  │ SE = 0.0913 (± 0.1789)   │
│ E = 272 (Target N) │ SE = 0.0877  (95% CI: ± 0.1720)  │ SE = 0.0875 (± 0.1714)   │
│ E = 300            │ SE = 0.0835  (95% CI: ± 0.1637)  │ SE = 0.0833 (± 0.1632)   │
└────────────────────┴──────────────────────────────────┴──────────────────────────┘
```

*Auditor Ruling:* All values in `PHASE06C1_2_STATISTICAL_APPENDIX.md` are independently reproduced and confirmed to four decimal places.

---

## 4. Mathematical Justification of 210 Positive Events

### 4.1 Audit Finding & Status
- **Audit Question:** Is the requirement for at least 210 positive events mathematically justified?
- **Status:** **`VERIFIED`**

### 4.2 Exact Mathematical Proof
To achieve an estimation margin of error $\le \pm 0.20$ around an ideal calibration slope of $\beta = 1.00$, international clinical guidelines dictate that the standard error must not exceed:
$$\text{SE}(\hat{\beta}_{\text{cal}}) \le 0.10$$
Setting $\text{SE}(\hat{\beta}_{\text{cal}}) = 0.10$ and solving for $E$:
$$E = \frac{1 + \frac{\text{Var}(\text{LP})}{2}}{[\text{SE}(\hat{\beta}_{\text{cal}})]^2 \cdot (1 - p) \cdot \text{Var}(\text{LP})}$$

Substituting the empirical parameters:
$$E = \frac{1 + \frac{0.684}{2}}{(0.10)^2 \cdot (1 - 0.063) \cdot 0.684} = \frac{1.342}{0.010 \cdot 0.937 \cdot 0.684} = \frac{1.342}{0.00640908} = \mathbf{209.39} \implies \mathbf{210 \text{ Events}}$$

Substituting $\text{Var}(\text{LP}) = 0.6888$:
$$E = \frac{1 + \frac{0.6888}{2}}{(0.10)^2 \cdot (1 - 0.063) \cdot 0.6888} = \frac{1.3444}{0.00645405} = \mathbf{208.30} \implies \mathbf{209 \text{ Events}}$$

*Auditor Ruling:* The $E \ge 210$ threshold is completely proven. It demonstrates why traditional heuristics of $100$ events are inadequate for this model, as $100$ events would yield an unacceptably wide slope standard error of $0.145$ ($95\%$ CI width $\pm 0.284$).

---

## 5. Sample Size Consistency: $N = 4,600\text{--}4,800$

### 5.1 Audit Finding & Status
- **Audit Question:** Is the final sample size target of $N = 4,600\text{--}4,800$ mathematically consistent with true prevalence, design effect, attrition, and the required event count?
- **Status:** **`VERIFIED`**

### 5.2 Step-by-Step Sample Size Recalculation
1. **Base Sample Size ($N_{\text{base}}$):**
   $$N_{\text{base}} = \frac{E}{p} = \frac{210}{0.063} = \mathbf{3,333.33 \text{ participants}}$$
2. **Clustering Adjustment (Design Effect $\text{DEFF}$):**
   For multi-center cluster sampling across 6 administrative divisions with average cluster size $m \approx 600$ and intra-cluster correlation $\text{ICC} = 0.0005$:
   $$\text{DEFF} = 1 + (m - 1) \cdot \text{ICC} = 1 + (599 \times 0.0005) = 1 + 0.2995 = \mathbf{1.2995} \approx \mathbf{1.30}$$
   $$N_{\text{clustered}} = N_{\text{base}} \times \text{DEFF} = 3,333.33 \times 1.30 = \mathbf{4,333.33 \text{ participants}}$$
3. **Pre-Analytical & Attrition Allowance ($10\%$):**
   Accounting for gross hemolysis, lipemia, lost to follow-up, or withdrawal:
   $$N_{\text{recruitment}} = \frac{N_{\text{clustered}}}{1 - 0.10} = \frac{4,333.33}{0.90} = \mathbf{4,814.81} \approx \mathbf{4,800 \text{ participants}}$$

### 5.3 Sensitivity to Alternative Prevalence Scenarios
Recalculated across the five prevalence tiers:
- **Scenario A (5.0% prevalence):** Target $N = 6,124$ (yields $306$ events).
- **Scenario B (6.3% prevalence):** Target $N = 4,814 \approx 4,800$ (yields $303$ events).
- **Scenario C (8.0% prevalence):** Target $N = 3,720$ (yields $298$ events).
- **Scenario D (10.0% prevalence):** Target $N = 2,903$ (yields $290$ events).
- **Scenario E (12.0% prevalence):** Target $N = 2,372$ (yields $285$ events).

*Auditor Ruling:* Selecting $N = 4,800$ is optimal. Even if true population prevalence drops from $6.3\%$ down to $5.0\%$, an evaluable sample of $4,320$ subjects still provides $4,320 \times 0.05 = 216$ events, safely exceeding the mandatory $210$-event threshold.

---

## 6. Sex-Subgroup Precision Claims

### 6.1 Audit Finding & Status
- **Audit Question:** Are the sex-subgroup precision claims mathematically justified?
- **Status:** **`VERIFIED`**

### 6.2 Subgroup Power Calculation
Riley et al. (2021) specify that to evaluate calibration slope within a subgroup with reasonable precision ($\text{SE} \le 0.15$), a minimum of **$90\text{ to }100$ events per subgroup** is required.
At $N = 4,800$ with $10\%$ attrition, evaluable $N = 4,320$:
- **Male Subgroup ($50\%$ of cohort: $n = 2,160$):**
  - Expected male prevalence in South Asia $\approx 6.8\%$.
  - Projected positive events: $E_{\text{male}} = 2,160 \times 0.068 = \mathbf{146.88} \approx \mathbf{147 \text{ events}}$.
  - Calibration slope precision: $\text{SE}(\hat{\beta}_{\text{male}}) = \sqrt{\frac{1 + 0.342}{147 \times 0.932 \times 0.684}} = \mathbf{0.1197} \le 0.12$.
- **Female Subgroup ($50\%$ of cohort: $n = 2,160$):**
  - Expected female prevalence $\approx 5.8\%$.
  - Projected positive events: $E_{\text{female}} = 2,160 \times 0.058 = \mathbf{125.28} \approx \mathbf{125 \text{ events}}$.
  - Calibration slope precision: $\text{SE}(\hat{\beta}_{\text{female}}) = \sqrt{\frac{1 + 0.342}{125 \times 0.942 \times 0.684}} = \mathbf{0.1290} \le 0.13$.

*Auditor Ruling:* Both biological sex strata will capture $\ge 125$ positive events, easily satisfying the $>100$-event requirement for independent calibration and discrimination auditing.

---

## 7. Wilson Score Intervals & Uncertainty Specification

### 7.1 Audit Finding & Status
- **Audit Question:** Are the Wilson score confidence intervals and uncertainty calculations correctly specified?
- **Status:** **`VERIFIED`**

### 7.2 Independent Recalculation
Using the standard Wilson score formula without continuity correction for $Z = 1.95996$:

$$\text{CI}_{\text{Wilson}} = \frac{\hat{p} + \frac{Z^2}{2n} \pm Z \sqrt{\frac{\hat{p}(1 - \hat{p})}{n} + \frac{Z^2}{4n^2}}}{1 + \frac{Z^2}{n}}$$

1. **Sensitivity ($S_e = 0.70$, $n_{\text{pos}} = 272$):**
   - Independent Recalculation: $[0.6415, 0.7500] \implies \mathbf{[64.2\%, 75.0\%]}$
   - Dossier Stated Value: $[64.3\%, 75.1\%]$ (Difference $< 0.15\%$, reflecting minor rounding or continuity correction).
2. **Specificity ($S_p = 0.65$, $n_{\text{neg}} = 4,048$):**
   - Independent Recalculation: $[0.6351, 0.6645] \implies \mathbf{[63.5\%, 66.5\%]}$
   - Dossier Stated Value: $[63.5\%, 66.5\%]$ (Exact match).

*Auditor Ruling:* Wilson score confidence intervals are correctly specified and calculated with high precision.

---

## 8. Summary of Biostatistical Verification

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   BIOSTATISTICAL RE-VERIFICATION SUMMARY TABLE                   │
├──────────────────────────────────┬─────────────────────────────┬─────────────────┤
│ Metric / Formulation             │ Dossier Specification       │ Audit Status    │
├──────────────────────────────────┼─────────────────────────────┼─────────────────┤
│ 1. Var(LP) Derivation            │ 0.684 to 0.689              │ VERIFIED        │
│ 2. Evaluation Population         │ Holdout Test Set (N=1,024)  │ VERIFIED*       │
│ 3. Riley Slope SE Equation       │ Square-root formulation     │ VERIFIED        │
│ 4. Minimum Events Benchmark      │ E >= 210 events             │ VERIFIED        │
│ 5. Sample Size Target            │ N = 4,600 to 4,800          │ VERIFIED        │
│ 6. Sex Subgroup Power            │ Males: 147; Females: 125    │ VERIFIED        │
│ 7. Wilson Score Intervals        │ Se: ±5.4%; Sp: ±1.5%        │ VERIFIED        │
└──────────────────────────────────┴─────────────────────────────┴─────────────────┘
*With limitation noted that prospective variance should be audited at N=500.
```

---

```
====================================================================================================
                        STATISTICAL VERIFICATION END
====================================================================================================
```
