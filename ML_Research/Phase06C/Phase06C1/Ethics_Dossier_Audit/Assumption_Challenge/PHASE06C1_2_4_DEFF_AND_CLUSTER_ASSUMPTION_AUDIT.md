# Independent Statistical Assumption Challenge: Design Effect (DEFF), Clustering Parameters & Information Transfer

## Phase 06C.1.2.4 — Deep Biostatistical Challenge Audit

```
====================================================================================================
DOCUMENT CLASSIFICATION: INDEPENDENT ASSUMPTION CHALLENGE AUDIT REPORT
PROJECT INITIATIVE: TriNexus | VitaGuard AI — Clinical Machine Learning Division
DOCUMENT CODE: TNX-VG-CHALLENGE-DEFF-06C24
DATE OF CREATION: November 10, 2026
AUDITORS: Senior Biostatistician & Clinical AI Validation Methodologist
EVALUATION SCOPE: Forensic Audit of Clustering Parameters, DEFF = 1.30 Assumption,
                  Intracluster Correlation Coefficients (ICC), and Heuristic Event Adjustment
====================================================================================================
```

> [!CAUTION]
> **BIOSTATISTICAL GOVERNANCE NOTICE: STRICT INDEPENDENT AUDIT**  
> This audit critically examines the empirical and mathematical validity of the clustering assumptions used throughout Phase 06C sample-size planning.  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**

---

## 1. Purpose and Scope

Throughout Phase 06C planning documents (`PHASE06C1_SAMPLE_SIZE_JUSTIFICATION.md`, `PHASE06C1_1_SAMPLE_SIZE_RECALCULATION.md`, `PHASE06C1_2_STATISTICAL_APPENDIX.md`, `PHASE06C1_2_2_SAMPLE_SIZE_CORRECTION.md`, and `PHASE06C1_2_3_SAMPLE_SIZE_RECONCILIATION.md`), the sample size calculations relied on a constant clustering Design Effect:
$$\text{DEFF} = 1.30$$
The purpose of this audit is to independently interrogate whether $\text{DEFF} = 1.30$ is derived from verified empirical data, whether its underlying parameters (cluster count, cluster size $m$, and intracluster correlation coefficient $\text{ICC}$) are documented, and whether applying a survey-sampling $\text{DEFF}$ directly to calibration-slope event information is statistically justified.

---

## 2. Sources Reviewed

1. `ML_Research/Phase06C/Phase06C1/PHASE06C1_SAMPLE_SIZE_JUSTIFICATION.md` (Initial Phase 06C.1 draft: assumed $\text{DEFF} = 1.35$).
2. `ML_Research/Phase06C/Phase06C1/Corrections/PHASE06C1_1_SAMPLE_SIZE_RECALCULATION.md` (Phase 06C.1.1: posited $m = 150$, $\text{ICC} = 0.0020 \implies \text{DEFF} = 1.298 \approx 1.30$).
3. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier/PHASE06C1_2_STATISTICAL_APPENDIX.md` (Phase 06C.1.2: posited $m = 600$, $\text{ICC} = 0.0005 \implies \text{DEFF} = 1.2995 \approx 1.30$).
4. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Corrections/PHASE06C1_2_2_SAMPLE_SIZE_CORRECTION.md`.
5. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Reconciliation/PHASE06C1_2_3_SAMPLE_SIZE_RECONCILIATION.md`.
6. Kish L. *Survey Sampling*. New York: John Wiley & Sons, Inc.; 1965.
7. Eldridge SM, Ashby D, Kerry S. *Sample size for cluster randomized trials: effect of coefficient of variation of cluster size and analysis method*. **Statistics in Medicine**. 2006;25(6):1028–1042. doi:10.1002/sim.2407.

---

## 3. Forensic Investigation of Cluster Parameters

### 3.1 Parameter Instability Across Previous AI-Generated Drafts
Cross-checking the documentation lineage reveals shifting parameter specifications:
- **Phase 06C.1.1:** Stated that primary care outpatient clinics in Bangladesh have cluster size **$m = 150$** and **$\text{ICC} = 0.0020$**:
  $$\text{DEFF} = 1 + (150 - 1) \times 0.0020 = 1 + (149 \times 0.0020) = \mathbf{1.298} \approx \mathbf{1.30}$$
- **Phase 06C.1.2:** Stated that recruitment spans 6 regional hubs with cluster size **$m \approx 600$** and **$\text{ICC} = 0.0005$**:
  $$\text{DEFF} = 1 + (600 - 1) \times 0.0005 = 1 + (599 \times 0.0005) = \mathbf{1.2995} \approx \mathbf{1.30}$$
- **Audit Assessment:** The parameters $m$ and $\text{ICC}$ were retrofitted post-hoc to arrive at the pre-determined round number $\text{DEFF} = 1.30$. No empirical study, clinical trial registry, or Bangladeshi primary care citation was provided to substantiate either $\text{ICC} = 0.0020$ or $\text{ICC} = 0.0005$.

---

### 3.2 Number of Recruitment Sites and Cluster Definition
- **Proposed Recruitment Sites:** 6 administrative divisions (Dhaka, Chittagong, Rajshahi, Sylhet, Khulna, Barisal).
- **Cluster Definition Ambiguity:** The protocol never defines what constitutes a "cluster":
  - Is each administrative division a cluster ($k = 6$ clusters of $n = 800$)?
  - Is each Upazila Health Complex (UHC) a cluster?
  - Is each mobile community outreach camp a cluster ($k \approx 40\text{--}60$ camps of $n \approx 50\text{--}100$)?
- **Statistical Consequence:** If the true sampling unit is the individual community outreach camp ($m \approx 50\text{--}80$) versus an entire regional hospital complex ($m \approx 800$), the resulting $\text{DEFF}$ will vary drastically.

---

### 3.3 Equal vs. Unequal Cluster Sizes
The project documents universally used the simplified equal-cluster approximation:
$$\text{DEFF}_{\text{equal}} = 1 + (m - 1) \cdot \text{ICC}$$

In practical clinical research in Bangladesh, cluster sizes across mobile camps and clinic days are never equal. In the presence of unequal cluster sizes, Eldridge, Ashby, and Kerry (*Stat Med* 2006) proved that the true Design Effect is inflated by the coefficient of variation ($\text{CV}_m$) of cluster sizes:
$$\text{DEFF}_{\text{unequal}} = 1 + \left( (1 + \text{CV}_m^2) \cdot \bar{m} - 1 \right) \cdot \text{ICC}$$
where $\text{CV}_m = \text{SD}(m) / \bar{m}$.
- If mean cluster size is $\bar{m} = 200$ and cluster sizes vary between $50$ and $400$ ($\text{CV}_m \approx 0.50$):
  $$(1 + \text{CV}_m^2) \cdot \bar{m} = (1 + 0.25) \cdot 200 = 250$$
  $$\text{DEFF}_{\text{unequal}} = 1 + (250 - 1) \cdot 0.0020 = 1 + (249 \times 0.0020) = \mathbf{1.498} \approx \mathbf{1.50}$$
- Relying on the equal-cluster formula without acknowledging cluster-size variation underestimates the true sample size inflation required.

---

### 3.4 Limitations of Applying Survey DEFF to Calibration-Slope Event Variance
Throughout Phase 06C.1.2.2 and Phase 06C.1.2.3, the calculation:
$$E_{\text{eff}} = \frac{E_{\text{raw}}}{\text{DEFF}}$$
was used to adjust positive event requirements.

#### Methodological Critique:
1. **Kish's DEFF was Designed for Means:** Leslie Kish (1965) formulated $\text{DEFF}$ to quantify variance inflation for estimating population means, proportions, or totals in survey sampling.
2. **Regression Slopes are Multivariable Estimators:** The calibration slope $\hat{\beta}_{\text{cal}}$ is estimated from a logistic regression model ($\text{logit}(P(Y=1)) = \alpha + \beta \cdot \text{LP}$). 
3. **Cluster Attenuation in Multivariable Models:** Biostatistical literature (Neuhaus & McCulloch, 1998; Moerbeek, 2004) demonstrates that clustering effects on regression coefficients depend heavily on whether the predictor ($\text{LP}$) varies *between* clusters or *within* clusters:
   - If risk factors (Age, BMI, BP) vary primarily *within* each community, the design effect on the regression slope $\hat{\beta}$ is typically **much smaller than the design effect on the outcome prevalence**.
   - Conversely, if certain clusters have systematically uncalibrated models, site-level heterogeneity induces extra-binomial variation.
4. **Conclusion:** Dividing raw events by $1.30$ is an unvalidated heuristic approximation. In a multi-center prediction validation study, the proper approach is to simulate or model the effective sample size under a generalized linear mixed model (GLMM), rather than multiplying Kish's survey $\text{DEFF}$ directly into Riley's formula.

---

## 4. Audit Classifications

| Dimension | Evaluated Claim | Audit Classification | Justification |
| :--- | :--- | :---: | :--- |
| **`DEFF = 1.30` Basis** | $\text{DEFF} = 1.30$ is an established parameter for this study | **`NOT VERIFIED`** | No empirical data or literature citation exists in project records. Values were retrofitted post-hoc. |
| **Cluster Size ($m$)** | Cluster size is fixed at $m = 600$ (or $m = 150$) | **`NOT VERIFIED`** | Sampling unit (division vs. UHC vs. mobile camp) is undefined. Unequal cluster variation ignored. |
| **ICC Assumption** | $\text{ICC} = 0.0005$ (or $0.0020$) in Bangladesh primary care | **`NOT VERIFIED`** | Fabricated in previous AI drafts without empirical provenance or references. |
| **Equal-Cluster Formula**| $\text{DEFF} = 1 + (m-1)\text{ICC}$ is universally applicable | **`VERIFIED WITH LIMITATIONS`** | Mathematically correct for equal clusters, but fails to account for $\text{CV}_m$ in unequal mobile camps. |
| **Kish DEFF on Events** | $E_{\text{eff}} = E_{\text{raw}} / \text{DEFF}$ is exact for calibration slope | **`VERIFIED WITH LIMITATIONS`** | Heuristic approximation. Clustered logistic slopes do not scale identically to survey means. |

---

## 5. Limitations & Required Human Expert Review

1. **Mandatory Literature Audit by Lead Biostatistician:** A qualified biostatistician must review published cluster-randomized trials and epidemiological surveys conducted in rural Bangladesh (e.g., icddr,b demographic surveillance data, Bangladesh DHS) to extract defensible empirical ICC ranges for fasting blood glucose and hypertension.
2. **Formal Sampling Unit Definition:** The clinical operational team must formally specify whether the cluster is the **Upazila Health Complex (UHC)** or the **Individual Community Camp Day**.
3. **Interim ICC Estimation:** The Statistical Analysis Plan must mandate calculating the empirical ICC from the first $N = 500$ prospective participants to calibrate the final mixed-effects model.

---

```
====================================================================================================
                        DEFF & CLUSTER ASSUMPTION AUDIT END
                  NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED
====================================================================================================
```
