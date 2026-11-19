# Phase 06C.1.2.9 — Methodological Audit of Design Effect (DEFF) Scope & Misapplications
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical ML Safety & Biostatistics Review  
**Document ID:** `PHASE06C1_2_9_DEFF_INTERPRETATION_AUDIT.md`  
**Evaluation Mode:** STRICT READ-ONLY AUDIT + NEW REPORTS ONLY  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This document audits the mathematical boundaries and misinterpretations of the design effect (DEFF). It does not authorize clinical recruitment, site activation, specimen collection, or model deployment.

---

## 1. Purpose and Scope

Across successive iterations of the Phase 06C validation protocol, a single numerical figure—$\text{DEFF} = 1.30$—has been applied interchangeably to inflate total participant counts, divide positive-case counts, adjust regression standard errors, scale diagnostic sensitivity confidence intervals, and approximate tail probabilities.

This audit critically investigates the validity of applying a survey design effect to each of these four distinct statistical entities:
1. **Total Sample Size ($N$).**
2. **Positive-Case Information ($E_{\text{eff}}$).**
3. **Diagnostic Sensitivity Variance ($\text{Var}(\widehat{S}_e)$).**
4. **Clustered Probability-of-Attainment Calculations ($P(X \ge k)$).**

---

## 2. Sources Reviewed

1. **Kish L.** *Survey Sampling.* John Wiley & Sons; 1965.
2. **Kish L.** *Weighting for unequal Pi.* **Journal of Official Statistics.** 1992;8(2):183–200.
3. **Neuhaus JM, Kalbfleisch JD.** *Between- and within-cluster covariate effects in the analysis of clustered data.* **Biometrics.** 1998;54(2):638–645.
4. **Obuchowski NA.** *Nonparametric analysis of clustered ROC curve data.* **Biometrics.** 1997;53(2):567–578.
5. **Rao JNK, Scott AJ.** *The analysis of categorical data from complex sample surveys: chi-squared tests for goodness of fit and independence in two-way tables.* **Journal of the American Statistical Association.** 1981;76(374):221–230.
6. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Final_Closure_Audit/Phase_06C1_2_8/PHASE06C1_2_8_ARM_B_ASSUMPTION_CHALLENGE.md`
7. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Final_Closure_Audit/Phase_06C1_2_9/PHASE06C1_2_9_POSITIVE_CASE_PROBABILITY_ANALYSIS.md`

---

## 3. Systematic Audit of DEFF Applicability Across Statistical Domains

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   SYSTEMATIC AUDIT OF DEFF SCOPE & VALIDITY                                      │
├─────────────────────┬──────────────────┬─────────────────────────────┬───────────────────────────┤
│ Statistical Entity  │ Proposed Action  │ Audit Determination         │ Methodological Grounding  │
├─────────────────────┼──────────────────┼─────────────────────────────┼───────────────────────────┤
│ 1. Total Sample Size│ Inflate N by 1.30│ METHODOLOGICALLY SUPPORTED  │ Valid for univariate      │
│    (Community Prev) │                  │ (FOR PROPORTIONS ONLY)      │ prevalence in cluster SRS.│
├─────────────────────┼──────────────────┼─────────────────────────────┼───────────────────────────┤
│ 2. Positive-Case    │ Divide E by 1.30 │ METHODOLOGICALLY FLAWED     │ Event information depends │
│    Information      │ (E_eff = E / 1.3)│ (OVER-CONSERVATIVE BIAS)    │ on cluster size m*p << m. │
├─────────────────────┼──────────────────┼─────────────────────────────┼───────────────────────────┤
│ 3. Sensitivity      │ Inflate Se Var   │ METHODOLOGICALLY FLAWED     │ Se is conditioned on Y=1; │
│    Variance         │ by 1.30          │ (MATHEMATICALLY INVALID)    │ ICC among cases differs.  │
├─────────────────────┼──────────────────┼─────────────────────────────┼───────────────────────────┤
│ 4. Probability of   │ Multiply CDF     │ MATHEMATICALLY INDEFENSIBLE │ DEFF applies to variance  │
│    Attainment       │ threshold by 1.3 │ (CDF TAIL DISTORTION)       │ of mean, not tail mass.   │
└─────────────────────┴──────────────────┴─────────────────────────────┴───────────────────────────┘
```

---

### 3.1 Domain 1: Application to Total Sample Size ($N$)
- **Context:** Estimating overall diabetes prevalence ($p$) across rural Upazila community clusters.
- **Validity:** **METHODOLOGICALLY SUPPORTED (with limitations).**
- **Justification:** Kish's classical formulation $\text{DEFF} = 1 + (m - 1)\rho$ was derived explicitly for the variance of sample means and sample proportions under multi-stage cluster sampling:
  $$\text{Var}_{\text{complex}}(\hat{p}) = \text{DEFF} \cdot \frac{p(1 - p)}{N}$$
  If the goal is estimating crude population prevalence, inflating the total evaluable sample size by $\text{DEFF} = 1.30$ is standard survey methodology (Rao & Scott 1981).
- **Limitation:** It assumes all clusters are of equal size ($m$) and intra-cluster correlation is constant ($\rho$).

---

### 3.2 Domain 2: Application to Positive-Case Information ($E_{\text{eff}} = E_{\text{raw}} / 1.30$)
- **Context:** Sizing effective events for Riley's calibration slope formula ($\hat{\beta}_{\text{cal}}$).
- **Validity:** **METHODOLOGICALLY FLAWED / UNVERIFIED HEURISTIC.**
- **Justification:** In multivariable prediction modeling, calibration slope variance does not scale with the cluster design effect of crude prevalence.
  1. As proven by **Neuhaus & Kalbfleisch (1998)**, the design effect for a multivariable regression slope depends on the ratio of within-cluster predictor variance to between-cluster predictor variance:
     $$\text{DEFF}_{\beta} \approx 1 + (m - 1)\rho_{\text{outcome}}(1 - \rho_{\text{predictor}})$$
  2. If the DiaBD risk predictors (age, BMI, blood pressure) have high within-cluster variation, the design effect on the regression slope can be **substantially less than $1.30$** (and in some designs, $< 1.00$).
  3. Conversely, if unmeasured hospital-level confounders shift baseline risk, the slope variance inflates non-linearly.
- **Audit Ruling:** Dividing expected positive events by $1.30$ is an ad-hoc heuristic that lacks mathematical proof.

---

### 3.3 Domain 3: Application to Diagnostic Sensitivity Variance
- **Context:** Sizing the Wald confidence interval half-width for sensitivity ($W \le \pm 0.05$).
- **Validity:** **METHODOLOGICALLY FLAWED / MATHEMATICALLY INVALID.**
- **Justification:** Diagnostic sensitivity is a **conditioned probability**, calculated *strictly among diseased individuals* ($Y = 1$):
  $$S_e = P(\hat{p} \ge \tau \mid Y = 1)$$
  1. **Effective Cluster Size:** In a community cluster of total size $m = 50$ with prevalence $p = 0.063$, the average number of positive cases per cluster is only:
     $$m' = m \cdot p = 50 \cdot 0.063 = \mathbf{3.15 \text{ cases}}$$
  2. **Cluster Inflation for Sensitivity:** The true cluster design effect for sensitivity is:
     $$\text{DEFF}_{S_e} = 1 + (m \cdot p - 1)\rho_{S_e} \approx 1 + (2.15 \cdot \rho_{S_e})$$
     Even under a strong outcome correlation of $\rho = 0.02$, $\text{DEFF}_{S_e} \approx 1 + (2.15 \cdot 0.02) = \mathbf{1.043}$, **NOT $1.30$**!
- **Audit Ruling:** Applying a general population prevalence design effect ($\text{DEFF} = 1.30$) to diagnostic sensitivity massively over-inflates the required sample size because positive cases are sparse within clusters.

---

### 3.4 Domain 4: Application to Clustered Probability-of-Attainment Calculations
- **Context:** Calculating the probability of observing at least $323$ positive cases ($P(X \ge 323)$).
- **Validity:** **MATHEMATICALLY INDEFENSIBLE.**
- **Justification:** Kish's design effect is a **second-moment summary metric** (the ratio of variances). It contains zero information regarding the **higher-order moments, skewness, or tail probabilities** of the outcome distribution.
  - When observations are clustered, the distribution of positive cases $X$ follows a compound overdispersed distribution (such as a beta-binomial or negative binomial).
  - In an overdispersed distribution, the tails are substantially heavier than in an independent binomial model.
  - Multiplying sample size by $1.30$ or dividing thresholds by $1.30$ inside a binomial CDF formula yields mathematically nonsensical tail probabilities.
- **Audit Ruling:** Clustered probability of attainment cannot be calculated from Kish's DEFF alone; it requires full parametric cluster simulation.

---

## 4. Requirements for a Defensible Sampling Design & Variance Model

Before any numerical design effect can be officially approved for the TriNexus validation protocol, the biostatistical team must establish:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   MANDATORY PARAMETERS FOR CLUSTERED DESIGN APPROVAL                             │
├────┬─────────────────────────────┬───────────────────────────────────────────────────────────────┤
│ #  │ Required Parameter          │ Minimum Technical Specification Required                      │
├────┼─────────────────────────────┼───────────────────────────────────────────────────────────────┤
│ 1  │ Primary Sampling Unit (PSU) │ Formal geographic or institutional boundary definition.       │
│ 2  │ Cluster Count (K)           │ Exact number of participating Upazilas, wards, and hospitals. │
│ 3  │ Cluster Size Distribution   │ Mean cluster size (m) and coefficient of variation (CV(m)).   │
│ 4  │ Stratum-Specific ICC (rho)  │ Literature-grounded priors for outcome and predictor ICC.     │
│ 5  │ Facility Fixed Effects      │ Variance component specification (tau2) across hospitals.     │
│ 6  │ Analytical Variance Model   │ Specification of GEE with robust standard errors or mixed GLM.│
└────┴─────────────────────────────┴───────────────────────────────────────────────────────────────┘
```

---

## 5. Audit Findings & Formal Classifications

| Dimension Audited | Finding Summary | Finding Classification |
| :--- | :--- | :--- |
| **DEFF for Total Sample Size** | Supported for univariate prevalence in community cluster surveys. | `METHODOLOGICALLY SUPPORTED` |
| **DEFF for Calibration Slope** | Unverified; ignores ratio of within- to between-cluster predictor variance. | `METHODOLOGICALLY SUPPORTED` |
| **DEFF for Sensitivity** | Invalid; ignores case sparseness within clusters ($m \cdot p \ll m$). | `METHODOLOGICALLY SUPPORTED` |
| **DEFF for Probability CDF** | Indefensible; linear variance ratios cannot transform non-linear tails. | `METHODOLOGICALLY SUPPORTED` |
| **Empirical DEFF Approval** | Zero empirical ICC data in dossier; provisional planning prior only. | `PROJECT ASSUMPTION` |

---

## 6. Required Human Expert Review

1. **Lead Survey Statistician:** Construct a formal multi-stage clustered sample size calculation utilizing generalized estimating equations (GEE) or mixed-effects logistic regression, replacing generic DEFF multiplication.

---

> [!CAUTION]
> **FINAL GOVERNANCE STATUS**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2, Phase 06C.3, and Phase 06D remain strictly blocked.
