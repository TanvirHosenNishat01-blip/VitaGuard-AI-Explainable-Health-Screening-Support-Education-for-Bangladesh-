# Phase 06C.1.2.7 — Evidence-Grade Taxonomy & Unresolved Assumptions Audit
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical ML Safety & Governance Review  
**Document ID:** `PHASE06C1_2_7_EVIDENCE_GRADE_AND_UNRESOLVED_ASSUMPTIONS.md`  
**Evaluation Mode:** STRICT READ-ONLY AUDIT + NEW REPORTS ONLY  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This document classifies every major statistical, methodological, and clinical claim into formal epistemological evidence grades. It does not authorize clinical recruitment, ethics submission, model recalibration, or patient-facing deployment.

---

## 1. Purpose and Scope

This audit systematically catalogues and grades every parameter, equation, and operational claim in the Phase 06C validation program into a standardized six-category evidence taxonomy:
1. `MATHEMATICALLY VERIFIED`
2. `METHODOLOGICALLY SUPPORTED`
3. `PROJECT ASSUMPTION`
4. `REQUIRES HUMAN BIOSTATISTICIAN DECISION`
5. `REQUIRES CLINICAL SPECIALIST APPROVAL`
6. `NOT EVALUABLE`

Specifically, this report:
1. Audits the calibration-slope formula (Riley et al. 2021), tracing the empirical provenance of the linear predictor variance prior ($\text{Var}(\text{LP}) = 0.684$) and evaluating whether it can be defended as prospective population variance.
2. Audits diagnostic sensitivity assumptions, formally separating required positive cases, effective cases, raw cases, evaluable participants, and recruited participants, while flagging unsupported DEFF adjustments.
3. Formally categorizes all twelve clinical safety rules, confirming that documentary consistency and code containment do not constitute human clinical approval.

---

## 2. Sources Reviewed

1. **Riley RD, Debray TPA, Collins GS, et al.** *Minimum sample size for external validation of a clinical prediction model with a binary outcome.* **Statistics in Medicine.** 2021;40(19):3778–3799.
2. **Buderer NMF.** *Statistical methodology: I. Incorporating the prevalence of disease into the sample size calculation for sensitivity and specificity.* **Academic Emergency Medicine.** 1996;3(9):895–900.
3. `dataset/processed/test.csv` (`PROD-05`, baseline SHA-256 verified)
4. `ML_Model/evaluation/bd_diabetes_metrics.json` (`PROD-10`, baseline SHA-256 verified)
5. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Corrections/PHASE06C1_2_2_SAMPLE_SIZE_CORRECTION.md`
6. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Final_Reconciliation/PHASE06C1_2_5_ESTIMAND_AND_SAFETY_CONSISTENCY.md`
7. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Final_Correction_Audit/PHASE06C1_2_6_STATISTICAL_INTERPRETATION_CORRECTIONS.md`

---

## 3. Calibration-Slope Formula & Prior Provenance Audit

### 3.1 Provenance of Linear Predictor Variance Prior ($\text{Var}(\text{LP}) = 0.684$)
In Phase 06C sample size calculations, the parameter $\text{Var}(\text{LP}) = 0.684$ is universally utilized to solve Riley's Equation (4). This audit traced the exact derivation:
- **Origin:** Generated from the internal retrospective test split of the DiaBD XGBoost model (`dataset/processed/test.csv`, `PROD-05`, $N = 368$ participants). Logit transformation of predicted probabilities $\text{LP} = \ln(\hat{p} / (1 - \hat{p}))$ yielded sample variance $s_{\text{LP}}^2 \approx 0.6841$.
- **Can Retrospective Variance Be Assumed for Prospective Screening?** **NO.**
  1. The internal test set reflects the demographic and disease severity spectrum of the original development cohort.
  2. In a real-world community screening cohort in rural Upazilas, the population may be more homogeneous, resulting in a substantially **narrower linear predictor variance** ($\text{Var}(\text{LP})_{\text{ext}} < 0.684$).
  3. If $\text{Var}(\text{LP})_{\text{ext}} = 0.40$, the Riley ratio jumps from $2.09$ to $\frac{1 + 0.40/2}{(1 - 0.063) \cdot 0.40} = \frac{1.20}{0.3748} = \mathbf{3.2017}$, requiring **$320$ effective events instead of $210$**!
- **Epistemological Classification:** $\text{Var}(\text{LP}) = 0.684$ is a **PROJECT ASSUMPTION**, not an established population characteristic.

---

## 4. Sensitivity Precision & Diagnostic Sizing Deconstruction

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   DIAGNOSTIC SENSITIVITY SIZING DECONSTRUCTION (Se=0.70, W=±0.05)                │
├──────────────────────────┬─────────────────────────────┬─────────────────────────────────────────┤
│ Parameter / Metric Stage │ Quantitative Value          │ Epistemological Status                  │
├──────────────────────────┼─────────────────────────────┼─────────────────────────────────────────┤
│ Target Sensitivity (Se)  │ 70.0%                       │ PROJECT ASSUMPTION (Not Clinically Appr)│
│ Margin of Error (W)      │ ± 0.05 (± 5.0%)             │ PROJECT ASSUMPTION (Requires PI signoff)│
│ Positive Cases Required  │ 322.6944 -> ceil 323 cases  │ MATHEMATICALLY VERIFIED (Buderer Eq.)   │
│ Clustered Raw Cases      │ 419.5027 -> ceil 420 cases  │ PROJECT ASSUMPTION (DEFF=1.30 Heuristic)│
│ Evaluable N (at p=6.3%)  │ 6,658.77 participants       │ MATHEMATICALLY VERIFIED (Given Prev)    │
│ Recruited N (10% Attr.)  │ 7,398.64 -> ceil 7,399 part.│ MATHEMATICALLY VERIFIED (Given Attr.)   │
│ Evaluable N (at p=5.0%)  │ 8,390.05 participants       │ MATHEMATICALLY VERIFIED (Given Prev)    │
│ Recruited N (10% Attr.)  │ 9,322.28 -> ceil 9,323 part.│ MATHEMATICALLY VERIFIED (Given Attr.)   │
└──────────────────────────┴─────────────────────────────┴─────────────────────────────────────────┘
```

> [!WARNING]
> **Prohibition Against Presenting 70% as Approved Target:**  
> The $70\%$ sensitivity assumption originated in exploratory test split evaluations. It has **no formal clinical guideline or DGHS approval**. Screening programs often mandate $S_e \ge 80\%$ or $\ge 85\%$ to avoid a $30\%$ false-negative rate.

---

## 5. Master Evidence-Graded Classification Matrix

Every core parameter, method, and claim across the Phase 06C validation protocol is catalogued below:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                     COMPREHENSIVE PROJECT EVIDENCE CLASSIFICATION MATRIX                         │
├────┬──────────────────────────────────────┬──────────────────────┬───────────────────────────────┤
│ #  │ Project Parameter / Claim            │ Evidence Grade       │ Audit Justification           │
├────┼──────────────────────────────────────┼──────────────────────┼───────────────────────────────┤
│ 1  │ Buderer Formula (Z^2*Se*Sp/W^2)      │ METHODOLOGICALLY SUP.│ Peer-reviewed standard (1996).│
│ 2  │ Riley Equation (4) for Calibration   │ METHODOLOGICALLY SUP.│ Peer-reviewed standard (2021).│
│ 3  │ Buderer Matrix 16-cell values        │ MATHEMATICALLY VERIF.│ Exact decimal floats verified.│
│ 4  │ Riley 210 Events at p=6.3%           │ MATHEMATICALLY VERIF.│ Exact ratio 2.0939 / 0.01.    │
│ 5  │ N=4,800.8Recruitment at p=6.3%       │ MATHEMATICALLY VERIF.│ Exact derivation reproduced.  │
│ 6  │ N=5,966.3 Recruitment at p=5.0%      │ MATHEMATICALLY VERIF.│ Exact derivation reproduced.  │
│ 7  │ N=7,398.6 Recruitment for Se at 6.3% │ MATHEMATICALLY VERIF.│ Exact derivation reproduced.  │
│ 8  │ Arm B Slope SE = 0.0927 at p=12%     │ MATHEMATICALLY VERIF.│ Exact evaluation under DEFF=1.│
│ 9  │ 19 Production Baseline Hashes        │ MATHEMATICALLY VERIF.│ 19/19 SHA-256 byte identical. │
│ 10 │ Retrospective Prior Var(LP) = 0.684  │ PROJECT ASSUMPTION   │ From holdout test; not pop.   │
│ 11 │ Design Effect DEFF = 1.30            │ PROJECT ASSUMPTION   │ Borrowed from BDHS prevalence.│
│ 12 │ Non-evaluable Attrition = 10%        │ PROJECT ASSUMPTION   │ Operational planning prior.   │
│ 13 │ Planning Prevalences (5.0%, 6.3%)    │ PROJECT ASSUMPTION   │ Regional priors; ward variance│
│ 14 │ Anticipated Sensitivity = 70.0%      │ PROJECT ASSUMPTION   │ Internal threshold heuristic. │
│ 15 │ Selection of Final Sample Size Target│ REQ. HUMAN BIOSTAT.  │ Trade-off between Riley/Buder.│
│ 16 │ Choice of Terminal vs Early Ceiling  │ REQ. HUMAN BIOSTAT.  │ Rounding policy authorization.│
│ 17 │ Formulation of Clustered GEE Model   │ REQ. HUMAN BIOSTAT.  │ Variance specification.       │
│ 18 │ Minimum Clinical Sensitivity Target  │ REQ. CLINICAL SPEC.  │ Acceptable miss rate mandate. │
│ 19 │ Primary Estimand Hierarchy (Arm A/B) │ REQ. CLINICAL SPEC.  │ Intended-use population sign. │
│ 20 │ Clinical Safety SOPs (DKA/HTN/HbA1c) │ REQ. CLINICAL SPEC.  │ Formal MD signatures required.│
│ 21 │ Full Repository Bitwise Integrity   │ NOT EVALUABLE        │ Only 19 assets in manifest.   │
│ 22 │ External Cohort True Prevalence      │ NOT EVALUABLE        │ Unknown prior to recruitment. │
└────┴──────────────────────────────────────┴──────────────────────┴───────────────────────────────┘
```

---

## 6. Audit Findings & Formal Classifications

| Dimension Audited | Finding Summary | Finding Classification |
| :--- | :--- | :--- |
| **Riley Prior Provenance** | Derived from retrospective test split; prospective variance unverified. | `PROJECT ASSUMPTION` |
| **Sensitivity Prior Provenance** | Historical threshold heuristic; unapproved by clinical specialists. | `PROJECT ASSUMPTION` |
| **Diagnostic Sizing Decomposition** | Required cases, effective cases, and evaluable samples delineated. | `MATHEMATICALLY VERIFIED` |
| **Evidence-Grade Taxonomy** | 22 core claims rigorously classified across the 6 formal grades. | `METHODOLOGICALLY SUPPORTED` |
| **Clinical Sign-off Status** | Zero human MD signatures; previous AI reports do not constitute approval. | `REQUIRES CLINICAL SPECIALIST APPROVAL` |

---

## 7. Required Human Expert Review

1. **Lead Biostatistician:** Review items 15–17 in the Master Evidence Matrix to select the final sample size, rounding policy, and clustered variance modeling framework.
2. **Clinical Principal Investigator (Endocrinologist):** Review items 18–20 in the Master Evidence Matrix to formally authorize clinical screening thresholds, estimand hierarchy, and safety escalation SOPs.

---

> [!CAUTION]
> **FINAL GOVERNANCE STATUS**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2, Phase 06C.3, and Phase 06D remain strictly blocked.
