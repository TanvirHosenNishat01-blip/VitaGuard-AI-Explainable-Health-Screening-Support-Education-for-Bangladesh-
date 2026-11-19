# Phase 06C.1.2.5 — Methodological Review of Design Effect (DEFF) Application
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical ML Safety & Biostatistics Review  
**Document ID:** `PHASE06C1_2_5_DEFF_APPLICATION_REVIEW.md`  
**Evaluation Mode:** STRICT READ-ONLY AUDIT + NEW REPORTS ONLY  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This document provides an independent biostatistical audit challenging the direct application of classical survey design effects to multivariable prediction model evaluation metrics. It does not authorize clinical recruitment, ethics submission, or protocol finalization.

---

## 1. Purpose and Scope

In Phase 06C sample size calculations, a flat **design effect of $\text{DEFF} = 1.30$** has been applied across all statistical estimators by directly inflating required sample sizes (or equivalently dividing expected events: $E_{\text{eff}} = E_{\text{raw}} / 1.30$).

This audit critically examines whether Kish's classical survey sampling design effect formulation can be legitimately transferred to:
1. Calibration slope variance ($\text{Var}(\hat{\beta}_{\text{cal}})$)
2. Area Under the Receiver Operating Characteristic curve variance ($\text{Var}(\widehat{\text{AUROC}})$)
3. Diagnostic sensitivity and specificity variance ($\text{Var}(\widehat{S}_e)$, $\text{Var}(\widehat{S}_p)$)
4. Brier score variance ($\text{Var}(\widehat{\text{Brier}})$)

The objective is to establish why each of these statistical estimators responds differently to hierarchical clustering and unequal sampling weights, and to define the exact empirical parameters a survey statistician requires to construct a valid, defensible variance adjustment.

---

## 2. Sources Reviewed

1. **Kish L.** *Survey Sampling.* John Wiley & Sons; 1965.
2. **Kish L.** *Weighting for unequal Pi.* **Journal of Official Statistics.** 1992;8(2):183–200.
3. **Obuchowski NA.** *Nonparametric analysis of clustered ROC curve data.* **Biometrics.** 1997;53(2):567–578. doi:10.2307/2533958.
4. **Riley RD, Debray TPA, Collins GS, et al.** *Minimum sample size for external validation of a clinical prediction model with a binary outcome.* **Statistics in Medicine.** 2021;40(19):3778–3799.
5. **Neuhaus JM, Kalbfleisch JD.** *Between- and within-cluster covariate effects in the analysis of clustered data.* **Biometrics.** 1998;54(2):638–645.
6. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Corrections/PHASE06C1_2_2_SAMPLE_SIZE_CORRECTION.md`
7. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Assumption_Challenge/PHASE06C1_2_4_DEFF_AND_CLUSTER_ASSUMPTION_AUDIT.md`

---

## 3. The Theoretical Origin and Limits of Kish's DEFF

### 3.1 Classical Definition for Univariate Means and Proportions
Leslie Kish originally defined the design effect ($\text{DEFF}$) as the ratio of the variance of an estimator under the actual complex survey design to the variance under simple random sampling ($\text{SRS}$) with the same sample size:

$$\text{DEFF} = \frac{\text{Var}_{\text{complex}}(\hat{\theta})}{\text{Var}_{\text{SRS}}(\hat{\theta})}$$

For a single-stage cluster sample with equal cluster size $m$ and intra-cluster correlation coefficient $\rho$ (ICC), Kish derived the standard inflation factor:
$$\text{DEFF}_{\text{cluster}} = 1 + (m - 1)\rho$$

When unequal sampling weights ($w_i$) are introduced, Kish defined the additional variance inflation due to weighting:
$$\text{DEFF}_{\text{weights}} \approx 1 + \text{CV}(w)^2 = \frac{n \sum w_i^2}{(\sum w_i)^2}$$

### 3.2 The Flaw of Universal Transferability
The widespread practice of taking a single summary figure (e.g., $\text{DEFF} = 1.30$, loosely borrowed from the Bangladesh Demographic and Health Survey [BDHS] for binary prevalence) and applying it indiscriminately to multivariable model performance metrics is **methodologically flawed**. Regression slopes, rank correlations, and composite loss functions do NOT scale by $1 + (m - 1)\rho$.

---

## 4. Why Different ML Validation Estimators Respond Differently to Clustering

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               DIFFERENTIAL IMPACT OF CLUSTERING ON VALIDATION ESTIMATORS               │
├─────────────────────┬──────────────────────────┬──────────────────────┬────────────────┤
│ Estimator           │ Nature of Clustered Unit │ Typical DEFF vs Mean │ Audit Status   │
├─────────────────────┼──────────────────────────┼──────────────────────┼────────────────┤
│ 1. Univariate Prev  │ Individuals in clusters  │ Base BDHS DEFF ≈ 1.30│ Reference      │
│ 2. Calibration Slope│ Predictor-Outcome slope  │ Can be < 1.0 or >>1.0│ NOT VERIFIED   │
│ 3. AUROC            │ Discordant pairs (i, j)  │ Complex cross-cluster│ NOT VERIFIED   │
│ 4. Sensitivity (Se) │ Subset of diseased only  │ Effective m' = m * p │ FAILED HEURISTIC│
│ 5. Specificity (Sp) │ Subset of controls only  │ Effective m''=m*(1-p)│ FAILED HEURISTIC│
│ 6. Brier Score      │ Squared probability loss │ Driven by pred dist. │ NOT VERIFIED   │
└─────────────────────┴──────────────────────────┴──────────────────────┴────────────────┤
```

---

### 4.1 Calibration Slope ($\beta_{\text{cal}}$)
- **Mathematical Form:** In the validation logistic regression model $\text{logit}(P(Y_{ij}=1)) = \alpha + \beta_{\text{cal}} \cdot \text{LP}_{ij}$, the estimator $\hat{\beta}_{\text{cal}}$ is a regression coefficient.
- **Why DEFF Fails:** As demonstrated by Neuhaus & Kalbfleisch (1998) and standard econometric literature, the design effect for a regression slope ($\text{DEFF}_{\beta}$) depends fundamentally on the **ratio of within-cluster predictor variance to between-cluster predictor variance**:
  $$\text{DEFF}_{\beta} \approx 1 + (m - 1)\rho_{\text{outcome}} \cdot (1 - \rho_{\text{predictor}})$$
  - **Scenario 1 ($\text{DEFF}_{\beta} < 1.0$):** If the risk predictors (age, BMI, blood pressure) vary widely *within* each village/ward while the cluster-level mean risk is relatively constant, the design effect on the slope can actually be **less than 1.0** (clustering provides efficiency for slope estimation).
  - **Scenario 2 ($\text{DEFF}_{\beta} > 1.30$):** If there are strong unmeasured cluster-level confounders (e.g., local dietary patterns, water salinity, healthcare access) causing cluster-specific baseline intercepts or varying slopes, the standard error of $\hat{\beta}_{\text{cal}}$ inflates far beyond $1.30$.
- **Audit Finding:** Dividing event counts by a flat $1.30$ provides zero mathematical guarantee of appropriate calibration slope coverage.

---

### 4.2 Area Under the ROC Curve (AUROC)
- **Mathematical Form:** AUROC is non-parametrically equivalent to the Mann-Whitney $U$ statistic:
  $$\widehat{\text{AUROC}} = \frac{1}{n_1 n_0} \sum_{i \in \text{Cases}} \sum_{j \in \text{Controls}} I(\hat{p}_i > \hat{p}_j) + \frac{1}{2} I(\hat{p}_i = \hat{p}_j)$$
- **Why DEFF Fails:** As formulated by **Obuchowski (1997)**, AUROC variance in clustered designs involves four distinct pair-wise covariance terms:
  1. Pairs where case $i$ and control $j$ belong to the *same* cluster.
  2. Pairs where case $i$ and control $j$ belong to *different* clusters.
  3. Pairs sharing the same case across different controls.
  4. Pairs sharing the same control across different cases.
- **Audit Finding:** Standard survey DEFF applies to single sums, whereas AUROC is a **double sum over pairs**. Applying $\text{DEFF} = 1.30$ to AUROC variance is a heuristic with no theoretical backing.

---

### 4.3 Diagnostic Sensitivity and Specificity
- **Mathematical Form:**
  $$\widehat{S}_e = \frac{\sum_{i=1}^{n_1} I(\hat{p}_i \ge \tau)}{n_1}, \quad \widehat{S}_p = \frac{\sum_{j=1}^{n_0} I(\hat{p}_j < \tau)}{n_0}$$
- **Why DEFF Fails:**
  - **Sensitivity Conditioning:** Sensitivity is calculated *strictly among diseased individuals* ($Y = 1$). In a cluster of total size $m$, the expected number of diseased individuals is $m' = m \cdot p$. For a community cluster of $m = 50$ participants with $p = 0.063$, the average diseased cluster size is only $m' = 50 \cdot 0.063 \approx 3.15$ individuals.
  - **Effective DEFF for Sensitivity:** The cluster inflation factor for sensitivity is:
    $$\text{DEFF}_{S_e} \approx 1 + (m \cdot p - 1)\rho_{S_e}$$
    Even if $\rho_{S_e} = 0.05$, with $m' = 3.15$, the clustering inflation on sensitivity is $1 + (2.15 \cdot 0.05) = \mathbf{1.11}$, NOT $1.30$!
  - **Specificity Disparity:** Conversely, for specificity, almost all individuals are controls ($m'' = m \cdot (1 - p) \approx 46.85$), making $\text{DEFF}_{S_p} \approx 1 + (45.85 \cdot \rho) \gg \text{DEFF}_{S_e}$.
- **Audit Finding:** Applying the same $\text{DEFF} = 1.30$ to both sensitivity and specificity is mathematically contradictory.

---

### 4.4 Brier Score
- **Mathematical Form:** $\widehat{\text{Brier}} = \frac{1}{N} \sum_{i=1}^N (Y_i - \hat{p}_i)^2$.
- **Why DEFF Fails:** The variance of the squared prediction error depends on the higher-order moments of the joint distribution $(Y, \hat{p})$. Clusters with poor calibration contribute disproportionately to the empirical variance of the Brier score.
- **Audit Finding:** Brier score clustering cannot be modeled via univariate DEFF.

---

## 5. Specification of Parameters Required by a Professional Survey Statistician

To replace these unverified heuristics with a rigorous, publication-grade clustered sample size calculation, an institutional survey statistician requires the following seven specific parameters:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                 MANDATORY PARAMETER SPECIFICATION FOR CLUSTERED DESIGN                 │
├────┬─────────────────────────────┬─────────────────────────────────────────────────────┤
│ #  │ Required Design Parameter   │ Technical Definition & Specification Needed         │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────┤
│ 1  │ Primary Sampling Unit (PSU) │ Exact definition (e.g., Mauza / Urban Mohalla).     │
│ 2  │ Cluster Count (K)           │ Planned number of distinct sampling clusters.       │
│ 3  │ Cluster Size Distribution   │ Mean cluster size (m) and coefficient of variation. │
│ 4  │ Stratum-Specific ICC (rho)  │ Intraclass correlation for FPG outcome and LP.      │
│ 5  │ Facility / Upazila Effects  │ Random intercept variance (tau^2) across hospitals. │
│ 6  │ Sampling Weight Dispersion  │ Anticipated base weights and non-response weights.  │
│ 7  │ Within-Cluster Covariance   │ Joint distribution of DiaBD predictors in clusters. │
└────┴─────────────────────────────┴─────────────────────────────────────────────────────┘
```

---

## 6. Audit Findings & Formal Classifications

| Metric / Procedure Audited | Methodological Assessment | Finding Classification |
| :--- | :--- | :--- |
| **Kish DEFF Derivation** | Verified for univariate proportions; invalid for multivariable metrics. | `VERIFIED WITH LIMITATIONS` |
| **DEFF Applied to Calibration Slope** | Ignores ratio of within- to between-cluster predictor variance. | `NOT VERIFIED` |
| **DEFF Applied to AUROC** | Ignores pairwise cross-cluster covariance structure (Obuchowski). | `NOT VERIFIED` |
| **DEFF Applied to Sensitivity** | Over-inflates cluster size ($m \cdot p \ll m$); mathematically invalid. | `FAILED` |
| **DEFF Applied to Specificity** | Under-evaluates control clustering relative to case clustering. | `FAILED` |
| **Universal Division ($E_{\text{eff}} = E/1.3$)** | Rejected as an unverified planning heuristic. | `FAILED` |

---

## 7. Required Human Expert Review

The following specialized determinations must be made by qualified human professionals:

1. **Lead Survey Statistician:** Must construct a formal multi-stage clustered sample size calculation utilizing generalized estimating equations (GEE) or mixed-effects logistic regression models, replacing the heuristic $\text{DEFF} = 1.30$.
2. **Bangladesh Sampling Specialist:** Review historical Bangladesh Demographic and Health Survey (BDHS) or National STEPS survey cluster variance components to provide empirical priors for $\rho_{\text{outcome}}$ and $\rho_{\text{predictors}}$.

---

> [!CAUTION]
> **FINAL GOVERNANCE STATUS**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2, Phase 06C.3, and Phase 06D remain strictly blocked.
