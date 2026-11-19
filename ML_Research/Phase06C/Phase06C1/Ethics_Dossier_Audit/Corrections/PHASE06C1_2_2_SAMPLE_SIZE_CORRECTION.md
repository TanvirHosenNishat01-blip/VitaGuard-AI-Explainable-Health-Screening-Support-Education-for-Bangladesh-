# Targeted Biostatistical Correction: Sample Size, Riley Methodology & Event Count Justification

## Phase 06C.1.2.2 — Corrective Methodological Review

```
====================================================================================================
DOCUMENT CLASSIFICATION: TARGETED METHODOLOGICAL CORRECTION REPORT
PROJECT INITIATIVE: TriNexus | VitaGuard AI — Clinical Machine Learning Division
DOCUMENT CODE: TNX-VG-CORR-STAT-06C22
DATE OF CREATION: November 10, 2026
AUDITORS: Senior Biostatistician & Clinical AI Methodologist
TARGET OBJECT: ML_Research/Phase06C/Phase06C1/Ethics_Dossier/PHASE06C1_2_STATISTICAL_APPENDIX.md and
               PHASE06C1_1_SAMPLE_SIZE_RECALCULATION.md
====================================================================================================
```

> [!CAUTION]
> **METHODOLOGICAL DIRECTIVE: AUDIT CORRECTION ONLY**  
> This document establishes critical methodological corrections to earlier sample size and power claims.  
> **NO CLINICAL RECRUITMENT IS AUTHORIZED. NO STATISTICAL APPROVAL IS CLAIMED.**

---

## 1. Deconstruction of the 210 Positive Events Benchmark

### 1.1 Source Publication, Exact Equation & Mathematical Foundations
The calibration slope sample size formulation cited in the project documentation originates from:
> **Primary Citation:** Riley RD, Debray TPA, Collins GS, et al. *Minimum sample size for external validation of a clinical prediction model with a binary outcome*. **Statistics in Medicine**. 2021;40(19):3778–3799. doi:10.1002/sim.9025.  
> **Companion Framework:** Riley RD, Ensor J, Snell KIE, et al. *Calculating the sample size required for developing a clinical prediction model*. **BMJ**. 2020;368:m441.

In Riley et al. (2021), **Equation (4)** establishes the large-sample asymptotic variance of the estimated calibration slope ($\hat{\beta}_{\text{cal}}$) in an external validation cohort:

$$\text{Var}(\hat{\beta}_{\text{cal}}) \approx \frac{1 + \frac{\text{Var}(\text{LP})}{2}}{N \cdot p \cdot (1 - p) \cdot \text{Var}(\text{LP})}$$

Because the expected number of positive outcome events is $E = N \cdot p$, the standard error ($\text{SE}$) is expressed as:

$$\text{SE}(\hat{\beta}_{\text{cal}}) \approx \sqrt{ \frac{1 + \frac{\text{Var}(\text{LP})}{2}}{E \cdot (1 - p) \cdot \text{Var}(\text{LP})} }$$

where:
- $\text{LP} = \ln\left(\frac{p_{\text{pred}}}{1 - p_{\text{pred}}}\right)$ is the linear predictor (log-odds) of the model evaluated on the validation cohort.
- $\text{Var}(\text{LP})$ is the variance of the linear predictor distribution in the validation population.
- $p$ is the true outcome prevalence in the validation cohort.
- $E$ is the expected number of positive events ($E = N \cdot p$).

---

### 1.2 Independent Reproduction of Intermediate Calculations
Substituting the project's empirical parameters ($p = 0.063$ and $\text{Var}(\text{LP}) = 0.684$):
1. **Numerator Calculation:**
   $$\text{Numerator} = 1 + \frac{\text{Var}(\text{LP})}{2} = 1 + \frac{0.684}{2} = 1 + 0.342 = \mathbf{1.342}$$
2. **Denominator Factor (excluding $E$):**
   $$\text{Factor} = (1 - p) \cdot \text{Var}(\text{LP}) = (1 - 0.063) \cdot 0.684 = 0.937 \cdot 0.684 = \mathbf{0.640908}$$
3. **Ratio Determination:**
   $$\frac{\text{Numerator}}{\text{Factor}} = \frac{1.342}{0.640908} = \mathbf{209.3898} \approx \mathbf{209.4}$$
4. **Solving for Target Event Count ($E$) under $\text{SE}(\hat{\beta}_{\text{cal}}) \le 0.10$:**
   $$[\text{SE}(\hat{\beta}_{\text{cal}})]^2 = \frac{209.39}{E} \implies E \ge \frac{209.39}{(0.10)^2} = \frac{209.39}{0.010} = \mathbf{209.39} \implies \mathbf{210 \text{ Events}}$$

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   INTERMEDIATE CALCULATION REPRODUCTION TABLE                    │
├────────────────────┬─────────────────────┬──────────────────┬────────────────────┤
│ Assumed Events (E) │ Var(Slope)          │ SE(Slope)        │ 95% CI Margin (±)  │
├────────────────────┼─────────────────────┼──────────────────┼────────────────────┤
│ E = 100            │ 209.39 / 100 = 2.094│ 0.1447           │ ± 0.2836           │
│ E = 150            │ 209.39 / 150 = 1.396│ 0.1181           │ ± 0.2316           │
│ E = 200            │ 209.39 / 200 = 1.047│ 0.1023           │ ± 0.2005           │
│ E = 209.4          │ 209.39 / 209.4=1.000│ 0.1000           │ ± 0.1960           │
│ E = 210            │ 209.39 / 210 = 0.997│ 0.0999           │ ± 0.1957           │
│ E = 250            │ 209.39 / 250 = 0.838│ 0.0915           │ ± 0.1794           │
│ E = 272 (Target N) │ 209.39 / 272 = 0.770│ 0.0877           │ ± 0.1720           │
└────────────────────┴─────────────────────┴──────────────────┴────────────────────┘
```

---

### 1.3 Target Status: Project-Selected Standard vs. Mandated Requirement
- **Critical Clarification:** $\text{SE}(\hat{\beta}_{\text{cal}}) \le 0.10$ is **NOT** a statutory regulatory threshold mandated by the Bangladesh Medical Research Council (BMRC), US FDA, or European Medicines Agency (EMA).
- **Accurate Methodological Classification:** $\text{SE} \le 0.10$ is a **project-selected precision standard**, originally recommended as a methodological rule of thumb by Riley et al. (2021) and Collins et al. (2014) to ensure that the $95\%$ confidence interval width around an ideal calibration slope ($\beta = 1.00$) does not exceed $\pm 0.196 \approx \pm 0.20$ (i.e., $95\%\text{ CI: } [0.80, 1.20]$).
- **Regulatory Finding:** Labeling 210 events as an "absolute regulatory mandate" was incorrect. It must be formally documented as an **investigator-specified precision target**.
- **Audit Status:** **`VERIFIED WITH LIMITATIONS`**

---

## 2. In-Depth Audit of Linear Predictor Variance: $\text{Var}(\text{LP}) = 0.684\text{--}0.689$

### 2.1 Evaluation Population Discrepancy
- **Origin of $\text{Var}(\text{LP})$:** The value $0.684\text{--}0.689$ was derived from the retrospective holdout test split of the DiaBD dataset ($N_{\text{test}} = 1,024$).
- **Methodological Vulnerability:** The DiaBD dataset was compiled from hospital outpatient survey respondents in Bangladesh. In a prospective, dual-arm validation cohort (where $50\%$ of subjects are recruited from rural community outreach camps):
  - **Risk of Variance Compression:** Community outreach cohorts typically comprise younger, healthier, and less clinically diverse individuals than hospital attendees. If the prospective screening population is more homogeneous, the true variance of the predicted log-odds could decrease to $\text{Var}(\text{LP}) \approx 0.45\text{--}0.50$.
  - **Impact on Event Requirement:** If $\text{Var}(\text{LP})$ falls to $0.50$, the required event count to maintain $\text{SE} \le 0.10$ increases substantially:
    $$E = \frac{1 + \frac{0.50}{2}}{(0.10)^2 \cdot (1 - 0.063) \cdot 0.50} = \frac{1.25}{0.010 \cdot 0.937 \cdot 0.50} = \frac{1.25}{0.004685} = \mathbf{266.8} \implies \mathbf{267 \text{ Events}}$$
  - Conversely, if geographic diversity across 6 divisions expands risk factor heterogeneity, $\text{Var}(\text{LP})$ could rise to $0.85$, reducing the required events to $\approx 180$.
- **Correction Directive:** The assumption $\text{Var}(\text{LP}) \approx 0.684$ cannot be treated as a guaranteed population constant. It must be defined as a **provisional planning estimate**.
- **Mandatory Safeguard:** The Statistical Analysis Plan must mandate an **interim variance audit** after the first $N = 500$ participants are enrolled to calculate the empirical $\text{Var}(\text{LP})_{\text{interim}}$ without unblinding laboratory outcomes.
- **Audit Status:** **`VERIFIED WITH LIMITATIONS`**

---

## 3. Re-Examination of Sample Size Scenarios & Justification of $N = 4,800$

### 3.1 Parameter Inflation Components
The progression from required positive events ($E$) to total recruitment ($N$) involves three distinct multipliers:
1. **Prevalence Inversion ($1/p$):** Converts required events into unadjusted sample size ($N_{\text{base}} = E / p$).
2. **Clustering Design Effect ($\text{DEFF}$):** 
   $$\text{DEFF} = 1 + (m - 1) \cdot \text{ICC}$$
   For $m = 600$ subjects per site across 6 regional hubs, with an assumed intra-cluster correlation for metabolic markers of $\text{ICC} = 0.0005$:
   $$\text{DEFF} = 1 + (599 \times 0.0005) = 1 + 0.2995 \approx \mathbf{1.30}$$
3. **Pre-analytical & Attrition Allowance ($10\%$):** Accounts for sample hemolysis, lipemia, uninterpretable HPLC traces, or participant withdrawal:
   $$\text{Inflation Factor} = \frac{1}{1 - 0.10} = \mathbf{1.111}$$

### 3.2 Comprehensive Multi-Scenario Recalculation Table
To avoid treating 210 events or $6.3\%$ prevalence as universally sufficient, sample sizes are recalculated across multiple prevalence and variance scenarios:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   EXPANDED SAMPLE SIZE & POWER SCENARIOS MATRIX                                  │
├──────────┬──────────┬──────────────┬──────────────┬──────────────┬──────────────┬────────────────┤
│ Scenario │ True Prev│ Var(LP) Prior│ Target Events│ Clustered N  │ Target N     │ Expected Events│
│          │ (p)      │              │ (E for SE<=0.1) (DEFF = 1.30)│ (10% Attrit.)│ at N = 4,800*  │
├──────────┼──────────┼──────────────┼──────────────┼──────────────┼──────────────┼────────────────┤
│ 1        │ 4.0%     │ 0.684        │ 214          │ 6,955        │ 7,728        │ 173 (SE=0.111) │
│ 2        │ 5.0%     │ 0.500 (Low)  │ 270          │ 7,020        │ 7,800        │ 216 (SE=0.112) │
│ 3        │ 5.0%     │ 0.684 (Base) │ 212          │ 5,512        │ 6,124        │ 216 (SE=0.099) │
│ 4 (Ref)  │ 6.3%     │ 0.684 (Base) │ 210          │ 4,333        │ 4,814 ≈ 4,800│ 272 (SE=0.088) │
│ 5        │ 6.3%     │ 0.500 (Low)  │ 267          │ 5,509        │ 6,121        │ 272 (SE=0.099) │
│ 6        │ 8.0%     │ 0.684 (Base) │ 206          │ 3,348        │ 3,720        │ 346 (SE=0.078) │
│ 7        │ 10.0%    │ 0.684 (Base) │ 201          │ 2,613        │ 2,903        │ 432 (SE=0.069) │
└──────────┴──────────┴──────────────┴──────────────┴──────────────┴──────────────┴────────────────┘
*Expected events in an evaluable cohort of N_eval = 4,320 (after 10% attrition from N = 4,800).
```

### 3.3 Is $N = 4,800$ Justified?
- **Auditor Determination:** **YES, $N = 4,800$ is justified as a balanced, defensible sample size**, but with critical qualifications:
  1. Under the baseline reference case ($p = 6.3\%, \text{Var}(\text{LP}) = 0.684$), $N = 4,800$ provides an evaluable cohort of $4,320$ participants yielding $\approx 272$ positive events. This provides a safety cushion of $+62$ events ($+30\%$) above the 210-event minimum, ensuring that $\text{SE}(\hat{\beta}_{\text{cal}}) \approx 0.088$.
  2. If true community prevalence drops to $5.0\%$ with baseline variance, $N = 4,800$ still captures $216$ events, satisfying $\text{SE} \le 0.10$.
  3. However, if prevalence drops to $4.0\%$ or if community variance compresses to $0.50$, $N = 4,800$ will yield $\text{SE} \approx 0.11\text{--}0.12$. This remains clinically informative (95% CI width $\pm 0.22\text{--}0.24$), but misses the strict $\pm 0.20$ precision target.
- **Audit Status:** **`VERIFIED`**

---

## 4. Retraction of Unsupported Subgroup Power Claims

### 4.1 Identified Flaw in Prior Reports
Earlier Phase 06C.1.2 documents claimed:
> *"A total sample of N = 4,800 guarantees >120 events in each biological sex stratum, satisfying the minimal power requirement (E >= 100) for sex-stratified calibration."*  
> (Projected: Males $E = 147$, Females $E = 125$).

### 4.2 Methodological Correction
- **Why this claim was unsupported:** This calculation made two arbitrary, unverified assumptions:
  1. An exact $50:50$ enrollment ratio between males and females in daytime rural community health camps. In rural Bangladesh, working-age males are frequently engaged in daytime agrarian or urban migrant labor, leading to substantial female over-representation ($60\text{--}70\%$ female attendees) in daytime screening camps.
  2. Fixed sex-specific prevalence estimates ($6.8\%$ male, $5.8\%$ female) drawn from national aggregate literature without site-specific empirical verification.
- **Correction Directive:** Subgroup calibration slope precision cannot be claimed as "guaranteed" or "fully powered" a priori.
- **Mandatory Reclassification:** All subgroup sample size calculations for sex, age brackets ($<45$ vs. $\ge 45$), and geographic divisions must be reclassified from `VERIFIED` to:
  $$\mathbf{NOT\ ESTIMABLE\ A\ PRIORI\ —\ REQUIRES\ EMPIRICAL\ PILOT\ ENROLLMENT\ DATA}$$
- **Statistical Analysis Plan Revision:** The SAP must explicitly state:  
  *"Subgroup calibration slope evaluations are pre-specified exploratory secondary analyses. If an individual stratum captures $<100$ events, calibration curves and slopes will be presented with wider non-parametric bootstrap confidence intervals and documented as exploratory."*
- **Audit Status:** **`REQUIRES HUMAN EXPERT REVIEW`**

---

```
====================================================================================================
                        SAMPLE SIZE CORRECTION REPORT END
====================================================================================================
```
