# Independent Statistical Assumption Challenge: Target Population Estimands, Survey Weighting & The Limits of Dual-Arm Pooling

## Phase 06C.1.2.4 — Methodological Sampling & Estimand Challenge Audit

```
====================================================================================================
DOCUMENT CLASSIFICATION: INDEPENDENT RECRUITMENT ESTIMAND CHALLENGE REPORT
PROJECT INITIATIVE: TriNexus | VitaGuard AI — Clinical Machine Learning Division
DOCUMENT CODE: TNX-VG-CHALLENGE-ESTIMAND-06C24
DATE OF CREATION: November 10, 2026
AUDITORS: Senior Clinical AI Methodologist & Epidemiological Survey Statistician
EVALUATION SCOPE: Forensic Audit of the 50:50 Sampling Architecture, Target Estimand Conflicts,
                  Limitations of Demographic Weighting, and Berkson's Clinical Selection Bias
====================================================================================================
```

> [!CAUTION]
> **METHODOLOGICAL GOVERNANCE NOTICE: STRICT INDEPENDENT AUDIT**  
> An unweighted pooled sample from an artificial 50:50 dual-arm design does not represent any real-world clinical population in Bangladesh.  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**

---

## 1. Purpose and Audit Rationale

In Phase 06C planning documents, a **dual-arm design (50% Community Outreach Camps [Arm A] / 50% Primary Care Outpatient Clinics [Arm B])** was proposed to mitigate hospital spectrum bias.

The purpose of this audit is to challenge the unverified assumptions surrounding this design:
1. What exact population does this study seek to make inferences about?
2. Does an equal (50:50) allocation represent that target population?
3. Can standard demographic survey weights from the Bangladesh Bureau of Statistics (BBS) correct clinical referral bias?
4. How should the primary validation estimand be defined to prevent artificial data pooling?

---

## 2. Challenging Unverified Epidemiological & Demographic Assumptions

Earlier reports repeatedly cited unreferenced assertions. This audit formally cross-examines and classifies these claims:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   AUDIT OF EPIDEMIOLOGICAL & SAMPLING ASSUMPTIONS                                │
├────────────────────────────┬─────────────────────────────┬─────────────────┬─────────────────────┤
│ Assumption Claimed in Prior│ Documented Status in Project│ Audit           │ Methodological      │
│ Reports                    │ Records                     │ Classification  │ Reality             │
├────────────────────────────┼─────────────────────────────┼─────────────────┼─────────────────────┤
│ 1. "Outpatient prevalence  │ ASSUMED WITHOUT EMPIRICAL   │ NOT VERIFIED    │ Outpatient diabetes │
│    is 8% to 10%"           │ CITATION                    │                 │ prevalence varies   │
│                            │                             │                 │ widely by clinic    │
├────────────────────────────┼─────────────────────────────┼─────────────────┼─────────────────────┤
│ 2. ">90% of eligible adults│ STYLIZED FACT; NO BBS CENSUS│ NOT VERIFIED    │ Rural/urban split is│
│    reside in communities"  │ CITED                       │                 │ ~65/35 in BBS 2022  │
├────────────────────────────┼─────────────────────────────┼─────────────────┼─────────────────────┤
│ 3. "50:50 design is        │ FALSE ASSERTION; EQUAL      │ FAILED          │ 50:50 is an enriched│
│    nationally representative│ ALLOCATION IS NON-RANDOM   │                 │ stratified sample   │
├────────────────────────────┼─────────────────────────────┼─────────────────┼─────────────────────┤
│ 4. "BBS demographic weights│ MISUNDERSTANDING OF CLINICAL│ FAILED          │ Weighting by age/sex│
│    alone correct selection"│ SELECTION BIAS              │                 │ cannot fix Berkson's│
└────────────────────────────┴─────────────────────────────┴─────────────────┴─────────────────────┘
```

---

## 3. The Three Distinct Estimands: Disentangling Community from Hospital Performance

If Arm A ($n = 2,400$) and Arm B ($n = 2,400$) are pooled without adjustment, the resulting dataset estimates an **uninterpretable hybrid estimand**:
- It overestimates true community prevalence (due to outpatient enrichment).
- It underestimates outpatient disease severity (due to community healthy volunteer bias).
- It evaluates algorithm performance in a composite cohort that corresponds to no real-world clinical deployment scenario.

### 3.1 Recommended Re-Structuring of Trial Estimands
To conform to the **ICH E9(R1) Estimand Framework**, the protocol must decouple the analysis into three distinct, pre-specified estimands:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   FORMAL DECOUPLED TRIAL ESTIMAND FRAMEWORK                      │
├──────────────────────────────────────────────────────────────────────────────────┤
│ PRIMARY CONFIRMATORY ESTIMAND (ESTIMAND 1): COMMUNITY SCREENING POPULATION       │
│ - Target Population: Asymptomatic adults residing in rural and semi-urban        │
│   unions/villages across Bangladesh.                                             │
│ - Sampling Frame: Mobile field screening camps (Arm A, n = 2,400).               │
│ - Clinical Deployment Scenario: Non-invasive community screening administered    │
│   by Community Health Care Providers (CHCPs) at Community Clinics.               │
│ - Analysis: Evaluated purely on Arm A unweighted. All primary confirmatory       │
│   hypotheses (AUROC >= 0.70, Calibration Slope SE <= 0.10) must hold here.       │
├──────────────────────────────────────────────────────────────────────────────────┤
│ SECONDARY CLINICAL ESTIMAND (ESTIMAND 2): PRIMARY CARE OUTPATIENT TRIAGE         │
│ - Target Population: Consecutive adult outpatients presenting to Upazila Health │
│   Complexes / District Hospitals for non-glycemic complaints.                    │
│ - Sampling Frame: Hospital waiting rooms (Arm B, n = 2,400).                     │
│ - Clinical Deployment Scenario: Opportunistic triage screening in outpatient OPD │
│   waiting areas to prioritize patients for laboratory glucose testing.           │
│ - Analysis: Evaluated purely on Arm B unweighted as a distinct clinical stratum. │
├──────────────────────────────────────────────────────────────────────────────────┤
│ EXPLORATORY SYNTHESIS ESTIMAND (ESTIMAND 3): WEIGHTED NATIONAL COMPOSITE         │
│ - Target Population: Nationwide adult population blending community and primary │
│   care attendees.                                                                │
│ - Analysis: Evaluated on pooled cohort ONLY WITH POST-STRATIFICATION WEIGHTS.     │
└──────────────────────────────────────────────────────────────────────────────────┘
```

- **Audit Status:** **`REQUIRES HUMAN EXPERT REVIEW` (Endorsement by Lead Biostatistician)**

---

## 4. Why Demographic Survey Weights Cannot Fully Correct Clinical Selection Bias

Earlier reports posited that applying survey sampling weights from the Bangladesh Bureau of Statistics (BBS) could mathematically transform the 50:50 sample into a nationally representative cohort.

### 4.1 The Methodological Fallacy: Berkson's Bias and Unmeasured Confounding
Post-stratification demographic weighting (adjusting by age, sex, and urban/rural stratum) adjusts only for **observable demographic margins**. It cannot correct for **clinical selection bias (Berkson's bias)**:
1. **Unmeasured Morbidity:** A 45-year-old male attending an outpatient clinic has fundamentally higher unmeasured morbidity (e.g., subclinical vascular disease, malaise, polypharmacy) than a 45-year-old male recruited from his home in a village outreach camp, even if their age, sex, and BMI are identical.
2. **Predictor Distribution Distortion:** Weighting by age and sex will not remove the correlation between hospital attendance and elevated resting blood pressure or unmeasured stress hormones.
3. **Auditor Finding:** Attempting to force a single representative national number via BBS weights is scientifically inferior to reporting separate, unpolluted estimates for **Community Outreach (Arm A)** and **Outpatient Triage (Arm B)**.

---

## 5. Required Multi-Center Cluster & Referral Bias Modeling in the SAP

The formal Statistical Analysis Plan must mandate:
1. **Multi-Level Mixed-Effects Logistic Regression (GLMM):**
   Fitting separate models with recruitment center (UHC site $j$) and arm (Community vs. Outpatient $k$) as multi-level strata:
   $$\text{logit}(P(Y_{ijk} = 1)) = \alpha + u_j + \gamma \cdot \text{Arm}_{ijk} + \beta \cdot \text{LP}_{ijk}$$
2. **Formal Test of Spectrum Interaction:**
   Evaluating whether model calibration slope differs between settings:
   $$\text{logit}(P(Y = 1)) = \alpha + \beta_1 \cdot \text{LP} + \beta_2 \cdot \text{Arm} + \beta_3 \cdot (\text{LP} \times \text{Arm})$$
   A statistically significant interaction ($\beta_3 \neq 0$) proves spectrum bias, confirming that model calibration cannot be pooled across settings.

---

```
====================================================================================================
                        RECRUITMENT ESTIMAND CHALLENGE END
                  NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED
====================================================================================================
```
