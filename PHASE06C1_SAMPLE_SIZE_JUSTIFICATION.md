# Phase 06C.1 — Sample Size Justification & Biostatistical Power Protocol
**TriNexus | VitaGuard AI — Clinical Machine Learning Division**  
**Protocol Section:** Statistical Power & Sample Size Methodology  
**Document Date:** November 10, 2026  
**Auditor & Lead Biostatistician:** Senior Clinical Biostatistician & AI Validation Specialist  
**Methodological Standard:** Riley et al. (BMJ 2020;368:m441; Stat Med 2021) & Buderer (Acad Emerg Med 1996)  
**Status:** **FROZEN BIOSTATISTICAL SPECIFICATION**

---

## 1. Biostatistical Framework & Objective

In Phase 06C.0, a preliminary assumption of $N \ge 1,588$ ($100$ positive events at $6.3\%$ prevalence) was cited. This document formalizes the rigorous biostatistical sample size calculations for external validation of the DiaBD Bangladesh diabetes model, demonstrating explicit mathematical derivations across multiple epidemiological scenarios.

### 1.1 Why Traditional Rule-of-Thumb Sample Sizes are Inadequate
Validating a clinical risk prediction model requires satisfying three simultaneous statistical objectives:
1. **Diagnostic Accuracy Precision:** Sufficient positive cases to estimate **Sensitivity** and **Specificity** within an acceptable confidence interval half-width ($d$).
2. **Calibration Performance Precision:** Sufficient event count to estimate the **Calibration Slope** ($\beta$) and **Calibration-in-the-Large** ($\alpha$) with narrow standard error ($\text{SE}(\hat{\beta}) \le 0.10$).
3. **Subgroup Disparity Power:** Adequate sample size to evaluate calibration and discrimination across biological sexes (male vs. female) and age tiers.

---

## 2. Mathematical Sample Size Formulations

### 2.1 Diagnostic Sensitivity & Specificity Precision (Buderer Formula)
To estimate Sensitivity ($\text{Sens}$) and Specificity ($\text{Spec}$) with a $(1-\alpha)\%$ two-sided confidence interval of half-width precision $d$:

$$N_{\text{cases}} = \frac{Z_{1-\alpha/2}^2 \cdot \text{Sens} \cdot (1 - \text{Sens})}{d^2}$$

$$N_{\text{controls}} = \frac{Z_{1-\alpha/2}^2 \cdot \text{Spec} \cdot (1 - \text{Spec})}{d^2}$$

For standard $\alpha = 0.05$ ($Z_{0.975} = 1.96$):
- Targeting Sensitivity $= 0.75$ with desired half-width $d = \pm 0.05$:
  $$N_{\text{cases}} = \frac{1.96^2 \cdot 0.75 \cdot 0.25}{0.05^2} = \frac{3.8416 \cdot 0.1875}{0.0025} \approx \mathbf{289 \text{ diabetic cases}}$$
- With relaxed precision $d = \pm 0.06$:
  $$N_{\text{cases}} = \frac{3.8416 \cdot 0.1875}{0.0036} \approx \mathbf{200 \text{ diabetic cases}}$$
- With minimum feasibility precision $d = \pm 0.085$:
  $$N_{\text{cases}} = \frac{3.8416 \cdot 0.1875}{0.007225} \approx \mathbf{100 \text{ diabetic cases}}$$

### 2.2 Calibration Assessment Precision (Riley et al. 2020 / 2021)
According to modern clinical prediction validation standards (Riley et al., BMJ 2020), estimating the calibration slope within a standard error $\text{SE}(\hat{\beta}) \le 0.10$ (guaranteeing a 95% CI width $\le \pm 0.20$ around $\beta=1.0$) requires:
$$\text{Events} \ge 150 \text{ to } 200 \text{ positive events}$$
A sample with only $100$ events yields $\text{SE}(\hat{\beta}) \approx 0.14$ (95% CI width $\approx \pm 0.28$), which constitutes a **minimum feasibility threshold**, not an optimal regulatory validation threshold.

### 2.3 Adjustment for Multi-Center Clustering (Design Effect)
Recruiting across multiple Upazila Health Complexes introduces site-level clustering. The sample size must be inflated by the **Design Effect (DEFF)**:
$$\text{DEFF} = 1 + (m - 1) \cdot \text{ICC}$$
where $m$ is average cluster size ($\sim 200$ patients/site) and $\text{ICC}$ is the intra-cluster correlation coefficient for diabetes diagnosis in Bangladesh ($\text{ICC} \approx 0.0015\text{--}0.0020$):
$$\text{DEFF} = 1 + (200 - 1) \cdot 0.0018 \approx \mathbf{1.35}$$

### 2.4 Adjustment for Missing Data & Attrition
Assuming a $10\%$ incomplete phlebotomy or hemolyzed specimen rate:
$$\text{Inflation Factor} = \frac{1}{1 - \text{Attrition}} = \frac{1}{1 - 0.10} \approx \mathbf{1.11}$$

---

## 3. Sample Size Matrix Across Epidemiological Prevalence Scenarios

The total required participant recruitment ($N_{\text{total}}$) is calculated as:
$$N_{\text{total}} = \frac{N_{\text{cases}}}{\text{Prevalence}} \times \text{DEFF} \times \frac{1}{1 - \text{Attrition}}$$
where $\text{DEFF} \times \text{Inflation} = 1.35 \times 1.11 \approx \mathbf{1.50}$.

### 3.1 Scenario Matrix: Required Sample Size ($N_{\text{total}}$)

| True Cohort Prevalence | Scenario A: Minimum Feasibility ($N_{\text{cases}} = 100$, $d = \pm 0.085$) | Scenario B: Statistically Adequate ($N_{\text{cases}} = 200$, $d = \pm 0.060$) | Scenario C: High-Precision Regulatory ($N_{\text{cases}} = 300$, $d = \pm 0.050$) | Expected Controls ($N_{\text{cases}}=200$) |
| :--- | :--- | :--- | :--- | :--- |
| **5.0%** (Rural Low-Prevalence) | **3,000 participants** | **6,000 participants** | **9,000 participants** | 5,700 controls |
| **6.3%** (Baseline Survey Prevalence)| **2,381 participants** | **4,762 participants** | **7,143 participants** | 4,462 controls |
| **8.0%** (Semi-Urban Health Camp) | **1,875 participants** | **3,750 participants** | **5,625 participants** | 3,450 controls |
| **10.0%** (District Sadar Outpatient) | **1,500 participants** | **3,000 participants** | **4,500 participants** | 2,700 controls |
| **12.0%** (Enriched Screening Cohort)| **1,250 participants** | **2,500 participants** | **3,750 participants** | 2,200 controls |

*Note on Unadjusted Baseline:* In an unclustered single-site sample without attrition, $100$ cases at $6.3\%$ prevalence equals $\frac{100}{0.063} \approx \mathbf{1,588}$ participants. However, when properly adjusted for multi-site design effects (1.35) and laboratory attrition (10%), the actual required recruitment expands to **$2,381$ participants**.

---

## 4. Minimum Feasibility vs. Statistically Adequate Thresholds

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                      SAMPLE SIZE SPECIFICATION FOR PHASE 06C                     │
├──────────────────────────────────────────────────────────────────────────────────┤
│ TIER 1: MINIMUM FEASIBILITY VALIDATION COHORT                                    │
│ - Target Positive Events: N_cases >= 100 confirmed diabetic cases.               │
│ - Total Sample Size: N >= 2,400 participants (at 6.3% prevalence, DEFF 1.35).   │
│ - Precision: Sensitivity estimated within +/- 8.5%; SE(beta) ~ 0.14.             │
│ - Limitation: Subgroup analysis (male vs female) will be underpowered.           │
├──────────────────────────────────────────────────────────────────────────────────┤
│ TIER 2: STATISTICALLY ADEQUATE VALIDATION COHORT (RECOMMENDED)                   │
│ - Target Positive Events: N_cases >= 200 confirmed diabetic cases.               │
│ - Total Sample Size: N >= 4,800 participants (at 6.3% prevalence, DEFF 1.35).   │
│ - Precision: Sensitivity estimated within +/- 6.0%; SE(beta) <= 0.10.            │
│ - Benefit: Supports independent male and female subgroup calibration checks      │
│   (>= 90-100 events per biological sex).                                         │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Subgroup Power Feasibility Analysis

1. **Sex Disparity Evaluation:** In Bangladesh outpatient populations, male and female attendance is approximately $45\% : 55\%$. Under Scenario B ($N=4,800$, $N_{\text{cases}}=200$):
   - Male Diabetic Events: $\approx 90$ cases (Sufficient for separate $\text{AUROC}$ and slope estimation).
   - Female Diabetic Events: $\approx 110$ cases (Sufficient for separate $\text{AUROC}$ and slope estimation).
2. **Age Stratification:**
   - $<40$ years: Low diabetes prevalence ($\sim 2\text{--}3\%$). Will yield $\sim 25$ events. Underpowered for standalone calibration, but sufficient for pooled interaction checks.
   - $\ge 40$ years: High diabetes prevalence ($\sim 10\text{--}12\%$). Will yield $\sim 175$ events, fully powered.

---

## 6. Biostatistical Audit Sign-Off

This sample size calculation establishes that claims of external validation statistical power cannot be made with fewer than **100 events** (preliminary feasibility) and should target **200 events** ($N \ge 4,800$ clustered participants) to satisfy regulatory and biostatistical adequacy.
