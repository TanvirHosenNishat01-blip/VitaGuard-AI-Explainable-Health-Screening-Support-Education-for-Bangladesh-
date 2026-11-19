# Phase 06C.1.2.5 — Sensitivity Precision Assumption Audit
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical ML Safety & Biostatistics Review  
**Document ID:** `PHASE06C1_2_5_SENSITIVITY_PRECISION_AUDIT.md`  
**Evaluation Mode:** STRICT READ-ONLY AUDIT + NEW REPORTS ONLY  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This document constitutes an internal biostatistical audit of clinical prediction model sensitivity assumptions. It does not authorize patient recruitment, clinical trial initiation, institutional engagement, specimen collection, ethics submission, or production model deployment. All parameters analyzed herein represent planning scenarios and methodological challenges, NOT clinically approved operating benchmarks.

---

## 1. Purpose and Scope

This audit independently investigates the mathematical, biostatistical, and clinical validity of the **70% sensitivity assumption** and its associated precision constraints ($95\%\text{ CI half-width } W = \pm 0.05$) proposed within Phase 06C planning documentation for the **DiaBD Bangladesh Diabetes Screening Model**.

Specifically, this report:
1. Traces the empirical and historical origin of the $S_e = 0.70$ assumption to establish whether it has documented scientific, clinical, or regulatory endorsement.
2. Formally distinguishes between historical observed sensitivity, independently validated sensitivity, project-selected planning assumptions, and clinically mandated screening targets.
3. Independently reproduces the **Buderer (1996)** sample size formulation across a multi-dimensional precision matrix ($S_e \in \{0.60, 0.70, 0.80, 0.90\}$, $W \in \{0.03, 0.05, 0.07, 0.10\}$).
4. Evaluates total evaluable and recruited sample size requirements across five prevalence scenarios ($5.0\%, 6.3\%, 8.0\%, 10.0\%, 12.0\%$) and four design effect scenarios ($\text{DEFF} \in \{1.00, 1.15, 1.30, 1.50\}$) with a fixed $10\%$ attrition rate.
5. Documents the critical methodological limitations of Buderer's formulation when applied to multivariable risk prediction models subject to clustering, verification bias, threshold selection, and model optimism.

---

## 2. Sources Reviewed

1. **Buderer NMF.** *Statistical methodology: I. Incorporating the prevalence of disease into the sample size calculation for sensitivity and specificity.* **Academic Emergency Medicine.** 1996;3(9):895–900. doi:10.1111/j.1553-2712.1996.tb03538.x.
2. **Riley RD, Debray TPA, Collins GS, et al.** *Minimum sample size for external validation of a clinical prediction model with a binary outcome.* **Statistics in Medicine.** 2021;40(19):3778–3799. doi:10.1002/sim.9025.
3. **Collins GS, Reitsma JB, Altman DG, Moons KGM.** *Transparent reporting of a multivariable prediction model for individual prognosis or diagnosis (TRIPOD): the TRIPOD statement.* **BMJ.** 2015;350:g7594.
4. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Corrections/PHASE06C1_2_2_SAMPLE_SIZE_CORRECTION.md`
5. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Reconciliation/PHASE06C1_2_3_SAMPLE_SIZE_RECONCILIATION.md`
6. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Assumption_Challenge/PHASE06C1_2_4_PERFORMANCE_PRECISION_REQUIREMENTS.md`
7. `ML_Model/evaluation/bd_diabetes_metrics.json` (Phase 06B baseline asset `PROD-10`)

---

## 3. Investigation of the 70% Sensitivity Assumption

### 3.1 Historical Provenance vs Clinical Authorization
In Phase 06C planning documents, a target sensitivity of $70\%$ is repeatedly cited as the operational baseline for sizing decision-rule validation. This audit traced the exact derivation of this figure:

- **Origin in Codebase:** In the historical internal test split of the DiaBD XGBoost classifier (`ML_Model/evaluation/bd_diabetes_metrics.json`, `PROD-10`), evaluating the uncalibrated model at default decision threshold $\tau = 0.50$ produced an empirical sensitivity of approximately $69.8\% - 71.2\%$.
- **Absence of Clinical Consensus:** There is **no documented clinical consensus**, clinical practice guideline, or Directorate General of Health Services (DGHS) Bangladesh standard establishing $70\%$ as an acceptable or safe sensitivity for population diabetes screening.
- **Screening Risk Implications:** In a primary community screening program, a sensitivity of $70\%$ corresponds to a **false negative rate of 30%** (almost 1 in 3 diabetic individuals misclassified as low risk and denied confirmatory venous fasting blood glucose testing). For an asymptomatic, insidious disease such as Type 2 Diabetes Mellitus, a 30% missed case proportion represents substantial clinical hazard.

### 3.2 Methodological Categorization
To prevent false assurance in ethics and protocol submissions, the $70\%$ figure must be categorized under strict taxonomy:

| Category | Classification | Current Status in TriNexus Project |
| :--- | :--- | :--- |
| **Historical Observed Sensitivity** | `VERIFIED WITH LIMITATIONS` | Observed exclusively on internal retrospective holdout splits ($N=368$ total test samples); subject to model overfitting and internal cohort optimism. |
| **Independently Validated Sensitivity** | `FAILED` | Zero prospective external validation studies have been conducted. Cannot be claimed as validated. |
| **Project-Selected Planning Assumption** | `VERIFIED` | Selected by project engineers as an exploratory midpoint prior for sample size estimation. |
| **Clinically Required Minimum Sensitivity** | `NOT VERIFIED` | Requires formal clinical steering committee and endocrinologist determination. Screening tools often require $S_e \ge 80\%$ or $\ge 85\%$ to avoid unacceptable miss rates. |

> [!IMPORTANT]
> **Audit Directive:** The ethics application and Statistical Analysis Plan must NEVER describe $70\%$ sensitivity as an approved clinical target. It must be explicitly defined as a **provisional planning parameter** utilized strictly to explore sample size dynamics.

---

## 4. Buderer Mathematical Formulation & Reproducible Precision Matrix

### 4.1 Governing Equation
The classical sample size formulation for diagnostic sensitivity established by **Buderer (1996)** calculates the minimum number of diseased (event-positive) individuals ($n_+$) required to estimate sensitivity ($S_e$) with a two-sided $95\%$ confidence interval half-width of $W$:

$$n_+ = \frac{Z_{1 - \alpha/2}^2 \cdot S_e \cdot (1 - S_e)}{W^2}$$

where:
- $Z_{1 - \alpha/2} = 1.96$ for a two-sided significance level $\alpha = 0.05$.
- $S_e$ is the anticipated point sensitivity.
- $W$ is the target maximum margin of error (half-width of the Wald confidence interval).

### 4.2 Complete Sensitivity Precision Matrix ($n_+$ Cases)
Executing the independent Python calculation across all combinations of $S_e \in \{0.60, 0.70, 0.80, 0.90\}$ and $W \in \{0.03, 0.05, 0.07, 0.10\}$ yields:

| Anticipated Sensitivity ($S_e$) | Margin of Error ($W$) | Exact Calculated $n_+$ | Required Integer $n_+$ ($\lceil n_+ \rceil$) |
| :---: | :---: | :---: | :---: |
| **0.60** | $\pm 0.03$ ($\pm 3\%$) | 1,024.43 | **1,025** |
| **0.60** | $\pm 0.05$ ($\pm 5\%$) | 368.79 | **369** |
| **0.60** | $\pm 0.07$ ($\pm 7\%$) | 188.16 | **189** |
| **0.60** | $\pm 0.10$ ($\pm 10\%$) | 92.20 | **93** |
| **0.70** | $\pm 0.03$ ($\pm 3\%$) | 896.37 | **897** |
| **0.70** (Planning Ref) | **$\pm 0.05$ ($\pm 5\%$)** | **322.69** | **323** |
| **0.70** | $\pm 0.07$ ($\pm 7\%$) | 164.64 | **165** |
| **0.70** | $\pm 0.10$ ($\pm 10\%$) | 80.67 | **81** |
| **0.80** | $\pm 0.03$ ($\pm 3\%$) | 682.95 | **683** |
| **0.80** | $\pm 0.05$ ($\pm 5\%$) | 245.86 | **246** |
| **0.80** | $\pm 0.07$ ($\pm 7\%$) | 125.44 | **126** |
| **0.80** | $\pm 0.10$ ($\pm 10\%$) | 61.47 | **62** |
| **0.90** | $\pm 0.03$ ($\pm 3\%$) | 384.16 | **385** |
| **0.90** | $\pm 0.05$ ($\pm 5\%$) | 138.30 | **139** |
| **0.90** | $\pm 0.07$ ($\pm 7\%$) | 70.56 | **71** |
| **0.90** | $\pm 0.10$ ($\pm 10\%$) | 34.57 | **35** |

---

## 5. Total Sample Size Translation Across Prevalence & Clustering Scenarios

To translate required positive cases ($n_+ = 322.69$ for $S_e = 0.70, W = \pm 0.05$) into total recruited participants ($N_{\text{recruited}}$), the calculation incorporates true outcome prevalence ($p$), cluster design effect ($\text{DEFF}$), and participant attrition ($A = 10\%$):

$$N_{\text{eval, eff}} = \frac{n_+}{p}, \quad N_{\text{eval, raw}} = N_{\text{eval, eff}} \cdot \text{DEFF}, \quad N_{\text{recruited}} = \left\lceil \frac{N_{\text{eval, raw}}}{1 - A} \right\rceil$$

### 5.1 Sensitivity Sizing Grid ($S_e = 0.70, W = \pm 0.05$, Attrition = $10\%$)

| Prevalence ($p$) | Design Effect ($\text{DEFF}$) | Effective Evaluable ($N_{\text{eval, eff}}$) | Raw Evaluable ($N_{\text{eval, raw}}$) | Recruited Sample Size ($N_{\text{recruited}}$) |
| :---: | :---: | :---: | :---: | :---: |
| **5.0%** | 1.00 (Simple Random) | 6,453.9 | 6,453.9 | **7,171** |
| **5.0%** | 1.15 (Mild Cluster) | 6,453.9 | 7,422.0 | **8,247** |
| **5.0%** | **1.30 (Survey Ref)** | **6,453.9** | **8,390.1** | **9,323** |
| **5.0%** | 1.50 (High Cluster) | 6,453.9 | 9,680.8 | **10,757** |
| **6.3%** | 1.00 (Simple Random) | 5,122.1 | 5,122.1 | **5,692** |
| **6.3%** | 1.15 (Mild Cluster) | 5,122.1 | 5,890.5 | **6,545** |
| **6.3%** | **1.30 (Survey Ref)** | **5,122.1** | **6,658.8** | **7,399 ≈ 7,400** |
| **6.3%** | 1.50 (High Cluster) | 5,122.1 | 7,683.2 | **8,537** |
| **8.0%** | 1.00 (Simple Random) | 4,033.7 | 4,033.7 | **4,482** |
| **8.0%** | 1.15 (Mild Cluster) | 4,033.7 | 4,638.7 | **5,155** |
| **8.0%** | 1.30 (Survey Ref) | 4,033.7 | 5,243.8 | **5,827** |
| **8.0%** | 1.50 (High Cluster) | 4,033.7 | 6,050.5 | **6,723** |
| **10.0%** | 1.00 (Simple Random) | 3,226.9 | 3,226.9 | **3,586** |
| **10.0%** | 1.15 (Mild Cluster) | 3,226.9 | 3,711.0 | **4,124** |
| **10.0%** | 1.30 (Survey Ref) | 3,226.9 | 4,195.0 | **4,662** |
| **10.0%** | 1.50 (High Cluster) | 3,226.9 | 4,840.4 | **5,379** |
| **12.0%** | 1.00 (Simple Random) | 2,689.1 | 2,689.1 | **2,988** |
| **12.0%** | 1.15 (Mild Cluster) | 2,689.1 | 3,092.5 | **3,437** |
| **12.0%** | 1.30 (Survey Ref) | 2,689.1 | 3,495.9 | **3,885** |
| **12.0%** | 1.50 (High Cluster) | 2,689.1 | 4,033.7 | **4,482** |

---

## 6. Critical Methodological Limitations of Buderer Formulation

While the Buderer equation is widely cited in preliminary diagnostic protocols, this audit identifies four fundamental methodological limitations when applied to multivariable risk prediction models:

1. **Uncertainty in Decision Threshold ($\tau$):**  
   Buderer's formula assumes a fixed, pre-established binary test. In multivariable risk prediction, sensitivity is a function of a continuous decision threshold $\tau \in [0, 1]$. If the threshold is adjusted or optimized on the validation data, the standard error of sensitivity increases substantially due to threshold estimation variance.
2. **Independence Assumption Violation (Clustering):**  
   Buderer assumes simple random sampling where each subject's disease status and test outcome are independent and identically distributed ($i.i.d.$). In multi-center community and clinic recruitment, clustering within Upazila health complexes or community clinics induces intra-cluster correlation. Adjusting via a flat design effect ($\text{DEFF} = 1.30$) is a crude heuristic that does not account for variable cluster sizes or cluster-level prevalence variation.
3. **Absence of Risk Spectrum Adjustment:**  
   Buderer treats all positive cases as homogeneous. In reality, a screening model's sensitivity depends heavily on the spectrum of disease severity (e.g., mild early diabetes with FPG $7.2\text{ mmol/L}$ vs severe diabetes with FPG $> 11.1\text{ mmol/L}$). If the validation cohort has a milder spectrum than the training cohort, observed sensitivity will drop.
4. **Wald Confidence Interval Breakdown Near Boundaries:**  
   The formula relies on the Wald asymptotic normality assumption ($Z^2 \cdot S_e(1-S_e)/W^2$). When sensitivity approaches $90\%$ or when event counts are small, Wald intervals have poor coverage and can produce limits outside $[0, 1]$. Exact Clopper-Pearson or Wilson score intervals are required for regulatory reporting.

---

## 7. Audit Findings & Formal Classifications

| Item Audited | Mathematical / Methodological Finding | Finding Classification |
| :--- | :--- | :--- |
| **70% Sensitivity Basis** | Traced to internal test holdout; lacks external clinical or regulatory validation. | `VERIFIED WITH LIMITATIONS` |
| **Buderer Matrix Reproduction** | Exact integer counts reproduced ($n_+ = 323$ for $S_e=0.70, W=0.05$). | `VERIFIED` |
| **Sample Size Translation ($N=7,400$)** | Corresponds exactly to $p=6.3\%, \text{DEFF}=1.30, 10\%\text{ attrition}$. | `VERIFIED` |
| **Low Prevalence Hazard ($p=5.0\%$)** | Sizing for $W=\pm 0.05$ at $5\%$ prevalence requires $N = 9,323$ participants. | `VERIFIED WITH LIMITATIONS` |
| **Applicability to Clustered Models** | Buderer ignores threshold estimation variance, clustering, and spectrum bias. | `REQUIRES HUMAN EXPERT REVIEW` |

---

## 8. Required Human Expert Review

Before any sample size figure based on sensitivity is incorporated into a binding protocol, the following human expert determinations are legally and scientifically mandatory:

1. **Clinical Steering Committee / Endocrinologist:** Authorize the minimum acceptable clinical sensitivity for DiaBD screening in Bangladesh (e.g., whether $70\%$ is clinically tolerable, or if $S_e \ge 80\%$ is required).
2. **Lead Biostatistician:** Formally decide whether validation sizing should be governed by **continuous calibration slope precision** (Riley et al., requiring 210 events) or **binary decision-rule sensitivity precision** (Buderer, requiring 323 events).
3. **Survey Methodologist:** Review the validity of the $\text{DEFF} = 1.30$ inflation factor on positive event clustering across community wards and outpatient clinics.

---

> [!CAUTION]
> **FINAL GOVERNANCE STATUS**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2, Phase 06C.3, and Phase 06D remain strictly blocked.
