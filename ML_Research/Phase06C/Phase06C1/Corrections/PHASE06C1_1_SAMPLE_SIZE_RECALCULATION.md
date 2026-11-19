# Phase 06C.1.1 — Biostatistical Sample Size Recalculation & Power Audit
**TriNexus | VitaGuard AI — Clinical Machine Learning Division**  
**Document Date:** November 10, 2026  
**Auditor:** Principal Biostatistician & Clinical AI Methodologist  
**Audit Object:** `PHASE06C1_SAMPLE_SIZE_JUSTIFICATION.md`  
**Methodological Foundations:** Riley et al. (BMJ 2020;368:m441; Stat Med 2021;40:3778–3799), Buderer (Acad Emerg Med 1996), and Wilson (JASA 1927)  
**Status:** **AUDITED BIOSTATISTICAL SPECIFICATION**

---

## 1. Audit Rationale & Governance Directive

In Phase 06C.1, document `PHASE06C1_SAMPLE_SIZE_JUSTIFICATION.md` derived a target sample size of $N = 4,800$ participants based on an assumption of $200$ events at $6.3\%$ prevalence with a Design Effect of $1.35$ and $10\%$ attrition.

The pre-submission audit directive requires:
1. Recalculating sample sizes with **explicit mathematical assumptions**, avoiding deriving calibration precision solely from a generic event-count rule of thumb.
2. Evaluating full sensitivity, specificity, and subgroup event feasibility across five prevalence tiers ($5\%, 6.3\%, 8\%, 10\%, 12\%$).
3. Formally identifying which statistical assumptions require explicit principal investigator and biostatistician approval prior to ethical registration.

---

## 2. Advanced Mathematical Formulations

### 2.1 Calibration Slope & Intercept Precision Beyond Event Count Alone
According to Riley et al. (Stat Med 2021), the standard error of the calibration slope ($\hat{\beta}$) is not determined by event count alone; it depends heavily on the **variance of the linear predictor (log-odds) distribution** ($\text{Var}(\text{LP})$) in the validation population:

$$\text{SE}(\hat{\beta}) \approx \sqrt{ \frac{1 + \frac{\text{Var}(\text{LP})}{2}}{N \cdot p \cdot (1 - p) \cdot \text{Var}(\text{LP})} }$$

where:
- $N$ = Total sample size.
- $p$ = True event prevalence.
- $N \cdot p = N_{\text{events}}$ (Number of positive cases).
- $\text{Var}(\text{LP})$ = Variance of the predicted log-odds in the validation cohort.

#### Empirical DiaBD Model Parameterization
From our empirical Phase 06B holdout test set evaluation:
- Predicted probability distribution: Mean = $0.0647$, Range = $0.0085\text{--}0.2514$.
- Log-odds $\text{LP} = \ln(p / (1-p))$:
  - $\text{Mean}(\text{LP}) = -2.852$
  - $\text{Variance of Log-Odds } \text{Var}(\text{LP}) \approx \mathbf{0.684}$

Substituting $\text{Var}(\text{LP}) = 0.684$ and $p = 0.0635$:
$$\text{SE}(\hat{\beta}) \approx \sqrt{ \frac{1 + \frac{0.684}{2}}{N_{\text{events}} \cdot (1 - 0.0635) \cdot 0.684} } = \sqrt{ \frac{1.342}{N_{\text{events}} \cdot 0.6406} } = \sqrt{ \frac{2.095}{N_{\text{events}}} }$$

#### Quantitative Event Count Calibration Precision:
- **If $N_{\text{events}} = 100$:** $\text{SE}(\hat{\beta}) = \sqrt{2.095 / 100} = \mathbf{0.1447} \implies \mathbf{95\% \text{ CI Width}} \approx \pm 0.284$ around $\beta=1.0$ (CI: $[0.716, 1.284]$).
- **If $N_{\text{events}} = 150$:** $\text{SE}(\hat{\beta}) = \sqrt{2.095 / 150} = \mathbf{0.1182} \implies \mathbf{95\% \text{ CI Width}} \approx \pm 0.232$ (CI: $[0.768, 1.232]$).
- **If $N_{\text{events}} = 200$:** $\text{SE}(\hat{\beta}) = \sqrt{2.095 / 200} = \mathbf{0.1023} \implies \mathbf{95\% \text{ CI Width}} \approx \pm 0.201$ (CI: $[0.799, 1.201]$).
- **If $N_{\text{events}} = 250$:** $\text{SE}(\hat{\beta}) = \sqrt{2.095 / 250} = \mathbf{0.0915} \implies \mathbf{95\% \text{ CI Width}} \approx \pm 0.179$ (CI: $[0.821, 1.179]$).

*Conclusion:* Achieving the international regulatory benchmark of $\text{SE}(\hat{\beta}) \le 0.10$ mathematically requires **at least 200 to 210 events** given the modest log-odds variance ($\text{Var}(\text{LP}) = 0.684$) of the DiaBD model.

---

### 2.2 Sensitivity & Specificity Confidence Interval Methodology
In binary diagnostic validation, standard Wald normal approximation intervals fail when event counts or proportions are near boundaries.
- **Mandatory Method:** All sensitivity, specificity, PPV, and NPV confidence intervals must be constructed using the **Wilson Score Interval** with continuity correction (Wilson, JASA 1927):
  $$\text{CI}_{\text{Wilson}} = \frac{\hat{p} + \frac{Z^2}{2n} \pm Z \sqrt{\frac{\hat{p}(1-\hat{p})}{n} + \frac{Z^2}{4n^2}}}{1 + \frac{Z^2}{n}}$$

---

### 2.3 Clustering (Design Effect) & Attrition Adjustments
- **Design Effect Formula:** $\text{DEFF} = 1 + (m - 1) \cdot \text{ICC}$.
  - Primary care outpatient clinics in Bangladesh exhibit intra-cluster correlation for metabolic markers of $\text{ICC} \approx 0.0015\text{--}0.0025$.
  - For $m = 150$ patients recruited per clinic: $\text{DEFF} = 1 + (149 \times 0.0020) = \mathbf{1.298} \approx \mathbf{1.30}$.
  - For $m = 250$ patients recruited per clinic: $\text{DEFF} = 1 + (249 \times 0.0020) = \mathbf{1.498} \approx \mathbf{1.50}$.
- **Laboratory Attrition / Missing Data:** $\text{Inflation} = \frac{1}{1 - 0.10} = \mathbf{1.111}$.

---

## 3. Comprehensive Sample Size Calculation Table

The table below calculates total recruitment across five prevalence scenarios under three distinct statistical targets:
1. **Target 1: Minimum Feasibility ($N_{\text{events}} = 100$):** Suitable for preliminary proof of concept ($\text{SE}(\hat{\beta}) \approx 0.14$, Sensitivity half-width $d \approx \pm 0.085$).
2. **Target 2: Statistically Adequate ($N_{\text{events}} = 200$):** Recommended standard for regulatory submission ($\text{SE}(\hat{\beta}) \le 0.10$, Sensitivity half-width $d \approx \pm 0.060$).
3. **Target 3: High-Precision Subgroup Powered ($N_{\text{events}} = 250$):** Powered for independent male and female subgroup calibration ($\text{SE}(\hat{\beta}) \le 0.09$, Sensitivity half-width $d \approx \pm 0.053$).

$$\text{Total Sample Size } N = \frac{N_{\text{events}}}{\text{Prevalence}} \times \text{DEFF} \times \frac{1}{1 - \text{Attrition}}$$
*(Assuming moderate cluster size $m=150$, $\text{DEFF}=1.30$, and $10\%$ attrition; Net Multiplier $= 1.30 \times 1.111 \approx \mathbf{1.444}$)*

| Prevalence Scenario | Unadjusted Sample Size ($N_{\text{events}} = 100$) | Clustered Total ($N_{\text{events}} = 100$) | Unadjusted Sample Size ($N_{\text{events}} = 200$) | Clustered Total ($N_{\text{events}} = 200$, Target) | Unadjusted Sample Size ($N_{\text{events}} = 250$) | Clustered Total ($N_{\text{events}} = 250$, Subgroup) | Expected Non-Diabetic Controls ($N_{\text{events}}=200$) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **5.0%** (Rural Low-Prevalence) | 2,000 | **2,889** | 4,000 | **5,778** | 5,000 | **7,222** | 5,489 controls |
| **6.3%** (DiaBD Baseline Prevalence) | 1,588 | **2,293** | 3,175 | **4,586** | 3,968 | **5,731** | 4,297 controls |
| **8.0%** (Semi-Urban Health Camp) | 1,250 | **1,806** | 2,500 | **3,611** | 3,125 | **4,514** | 3,383 controls |
| **10.0%** (District Sadar Outpatient) | 1,000 | **1,444** | 2,000 | **2,889** | 2,500 | **3,611** | 2,700 controls |
| **12.0%** (Enriched Screening Cohort)| 833 | **1,204** | 1,667 | **2,407** | 2,083 | **3,009** | 2,246 controls |

---

## 4. Sex Subgroup Event Feasibility

In Phase 06B, female subgroup analysis suffered severe statistical fragility due to having only 3 positive events in the test set.

To guarantee that Phase 06C validation provides robust subgroup findings:
- Target: A minimum of **$75\text{--}100$ diabetic events per biological sex** is required to estimate subgroup calibration slopes with $\text{SE} \le 0.15$.
- Assuming a $45\%$ male / $55\%$ female recruitment ratio and equivalent diabetes prevalence:
  - If total events $= 200$: Male events $\approx 90$, Female events $\approx 110$.  
    *(Both sexes exceed the 75-event threshold, satisfying subgroup viability).*
  - If total events $= 100$: Male events $\approx 45$, Female events $\approx 55$.  
    *(Underpowered; subgroup confidence intervals will be unacceptably wide).*

---

## 5. Formal Assumptions Requiring Statistician Sign-Off

Prior to submitting the protocol to the BMRC National Ethics Review Committee, the study biostatistician must formally review and sign off on the following five parameter assumptions:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   BIOSTATISTICAL ASSUMPTION SIGN-OFF CHECKLIST                   │
├──────────────────────────────────────────────────────────────────────────────────┤
│ [ ] ASSUMPTION 1: True cohort prevalence is expected between 6.0% and 8.0%.     │
│     Evidence: Bangladesh NCD STEPS Survey 2018 (8.4% adult prevalence).          │
├──────────────────────────────────────────────────────────────────────────────────┤
│ [ ] ASSUMPTION 2: Intra-cluster correlation (ICC) does not exceed 0.0025.        │
│     Evidence: Health facility survey cluster literature in South Asia.           │
├──────────────────────────────────────────────────────────────────────────────────┤
│ [ ] ASSUMPTION 3: Target calibration slope standard error SE(beta) <= 0.10.      │
│     Evidence: Riley et al. (BMJ 2020) regulatory validation standard.            │
├──────────────────────────────────────────────────────────────────────────────────┤
│ [ ] ASSUMPTION 4: Laboratory attrition (refusal / hemolysis) will be <= 10.0%.   │
│     Evidence: Phlebotomy quality assurance pilot data.                           │
├──────────────────────────────────────────────────────────────────────────────────┤
│ [ ] ASSUMPTION 5: Target sample size is set at N = 4,600 to 4,800 participants. │
│     Evidence: Yields >= 200 events under 6.3% baseline prevalence.               │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Pre-Submission Recalculation Summary

1. Rather than arbitrarily fixing $N=4,800$, the sample size is now grounded in an explicit log-odds variance formulation ($\text{Var}(\text{LP}) = 0.684$).
2. Achieving $\text{SE}(\hat{\beta}) \le 0.10$ mathematically dictates **$\ge 200$ diabetic events**.
3. Under the baseline prevalence ($6.3\%$), clustering ($\text{DEFF}=1.30$), and $10\%$ attrition, the recommended validation recruitment target is **$4,586 \approx 4,600\text{ to }4,800$ participants**.
