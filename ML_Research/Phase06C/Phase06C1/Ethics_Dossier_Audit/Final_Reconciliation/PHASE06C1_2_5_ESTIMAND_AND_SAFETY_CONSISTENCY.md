# Phase 06C.1.2.5 — Estimand and Clinical Safety Consistency Audit
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical ML Safety & Governance Review  
**Document ID:** `PHASE06C1_2_5_ESTIMAND_AND_SAFETY_CONSISTENCY.md`  
**Evaluation Mode:** STRICT READ-ONLY AUDIT + NEW REPORTS ONLY  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This document audits the target population estimands, clinical safety safeguards, and production containment boundaries established across Phase 06C documentation. It does not authorize clinical recruitment, ethics submission, model recalibration, or patient-facing deployment.

---

## 1. Purpose and Scope

This audit resolves the critical tension between two fundamental pillars of the Phase 06C validation program:
1. **Target Estimand Integrity:** Resolving whether evaluating a 50:50 mixture of community and outpatient participants provides a scientifically defensible validation estimand for the DiaBD screening model, and examining the limits of demographic post-stratification.
2. **Clinical Safety & Deployment Containment Consistency:** Verifying that all twelve mandatory clinical safety, laboratory methodology, age-range eligibility, and production model containment rules established in prior audits remain uncompromised and fully enforced.

---

## 2. Sources Reviewed

1. **ICH E9 (R1) Addendum.** *Statistical Principles for Clinical Trials: Estimands and Sensitivity Analysis in Clinical Trials.* European Medicines Agency; 2020.
2. **Berkson J.** *Limitations of the application of fourfold table analysis to hospital data.* **Biometrics Bulletin.** 1946;2(3):47–53.
3. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Corrections/PHASE06C1_2_2_EMERGENCY_REFERRAL_SAFETY_CORRECTION.md`
4. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Corrections/PHASE06C1_2_2_HBA1C_VARIANT_COMPATIBILITY.md`
5. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Corrections/PHASE06C1_2_2_AGE_ELIGIBILITY_AND_ESTIMAND.md`
6. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Reconciliation/PHASE06C1_2_3_CLINICAL_SAFETY_RECONCILIATION.md`
7. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Reconciliation/PHASE06C1_2_3_AGE_AND_DEPLOYMENT_BOUNDARIES.md`
8. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Assumption_Challenge/PHASE06C1_2_4_RECRUITMENT_ESTIMAND_CHALLENGE.md`
9. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Assumption_Challenge/PHASE06C1_2_4_CLINICAL_LAB_CLAIM_VERIFICATION.md`

---

## 3. Estimand Deconstruction: Community vs Outpatient vs Pooled Cohort

### 3.1 Defining the Target Populations
The fundamental flaw in previous protocol drafts was treating "validation participants" as a single homogenous entity. Following the **ICH E9 (R1)** estimand framework, the two arms target fundamentally distinct clinical populations:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        TARGET POPULATION ESTIMAND SPECIFICATION                        │
├──────────────────────────┬─────────────────────────────┬───────────────────────────────┤
│ Estimand Attribute       │ Arm A: Community Screening  │ Arm B: Outpatient Triage      │
├──────────────────────────┼─────────────────────────────┼───────────────────────────────┤
│ Target Population        │ Asymptomatic general adults │ Symptomatic or high-risk adults│
│ Recruitment Setting      │ Rural Upazila & urban wards │ Hospital outpatient clinics   │
│ Disease Spectrum         │ Mild, early, undiagnosed DM │ Advanced, comorbid, symptomatic│
│ Pre-test Probability (p) │ Low (approx. 5.0% - 6.3%)   │ Elevated (approx. 10% - 15%)  │
│ Primary Clinical Action  │ Community referral for FPG  │ Priority physician triage     │
│ Selection Mechanism      │ Population-based sampling   │ Health-seeking / referral flow│
└──────────────────────────┴─────────────────────────────┴───────────────────────────────┘
```

### 3.2 Is a Pooled Estimate Scientifically Meaningful?
- **Finding:** **NO.** An unweighted pooled analysis combining $50\%$ community participants and $50\%$ outpatient clinic attendees creates an **artificial mixture distribution** that corresponds to no real-world clinical population in Bangladesh.
- **Spectrum and Berkson's Bias:** Outpatient attendees have higher rates of hypertension, obesity, and symptomatic dysglycemia (**Berkson's bias**). Evaluating DiaBD on this combined cohort artificially inflates apparent discrimination (AUROC) because separating sick clinic patients from healthy villagers is trivially easy, masking the model's true performance in primary community screening.
- **Limits of BBS Demographic Weighting:** Previous drafts suggested that post-stratification using Bangladesh Bureau of Statistics (BBS) census data could correct the pooled cohort. This audit firmly refutes that claim:
  - BBS weights can adjust for age, sex, and administrative division distributions.
  - BBS weights **CANNOT** correct for clinical selection bias, health-seeking behavior, or subclinical comorbidity severity.
  - Empirical sampling weights do not currently exist because clinic selection probabilities are unknown.

> [!IMPORTANT]
> **Estimand Hierarchy Directive:**  
> The protocol must formally separate the estimands:
> 1. **Primary Estimand:** Standalone external validation within the **Community Screening Population** (Arm A).
> 2. **Secondary Estimand:** Exploratory validation within the **Outpatient Triage Population** (Arm B).
> 3. **Prohibition:** Pooled analyses may only be reported as exploratory sensitivity analyses and cannot serve as the primary endpoint.

---

## 4. Comprehensive Clinical Safety & Deployment Containment Audit

This audit systematically cross-checks all prior safety and containment mandates to ensure total consistency across the project lifecycle:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               PERMANENT CLINICAL SAFETY & CONTAINMENT AUDIT CHECKLIST                  │
├────┬──────────────────────────────────────┬──────────────────────┬─────────────────────┤
│ #  │ Safety & Containment Mandate         │ Historical Status    │ Phase 06C.1.2.5     │
├────┼──────────────────────────────────────┼──────────────────────┼─────────────────────┤
│ 1  │ DKA/HHS Laboratory Diagnosis Boundary│ Corrected (06C.1.2.2)│ FULLY PRESERVED     │
│ 2  │ Prohibition of Oral Hydration Prompt │ Corrected (06C.1.2.2)│ FULLY PRESERVED     │
│ 3  │ Asymptomatic HTN vs Emergency Triage │ Corrected (06C.1.2.2)│ FULLY PRESERVED     │
│ 4  │ Local Referral Timelines Approval    │ Mandated (06C.1.2.3) │ FULLY PRESERVED     │
│ 5  │ Method-Specific HbE Assay Interference│ Clarified (06C.1.2.2)│ FULLY PRESERVED     │
│ 6  │ HbA1c Biological vs Analytical Error │ Clarified (06C.1.2.2)│ FULLY PRESERVED     │
│ 7  │ Rejection of Universal HbA1c Cutoff  │ Confirmed (06C.1.2.4)│ FULLY PRESERVED     │
│ 8  │ Age 21–80 Primary Eligibility Range  │ Documented (06C.1.2.2)│ FULLY PRESERVED     │
│ 9  │ Age 18–20 Exploratory Secondary Only │ Documented (06C.1.2.2)│ FULLY PRESERVED     │
│ 10 │ DiaBD Platt Calibration Research-Only│ Contained (06B.2)    │ FULLY PRESERVED     │
│ 11 │ Pima Patient-Facing 403 Forbidden    │ Contained (06B.2)    │ FULLY PRESERVED     │
│ 12 │ Cleveland Model NOT EVALUABLE        │ Contained (06C.0)    │ FULLY PRESERVED     │
└────┴──────────────────────────────────────┴──────────────────────┴─────────────────────┘
```

### 4.1 Detailed Verification of Key Clinical Safety Rules:
1. **DKA / HHS Diagnostic Boundaries:**  
   The protocol explicitly recognizes that Diabetic Ketoacidosis (DKA) and Hyperosmolar Hyperglycemic State (HHS) cannot be diagnosed or ruled out using fasting plasma glucose and self-reported symptoms alone. Definitive diagnosis requires arterial/venous blood gas (pH, bicarbonate, anion gap), serum beta-hydroxybutyrate / urine ketones, serum osmolality, and electrolyte panels.
2. **Prohibition of Universal Oral Hydration Instructions:**  
   Unsupervised guidance instructing patients with severe hyperglycemia to consume large volumes of water remains strictly prohibited. In patients with undiagnosed heart failure, renal impairment, or advancing cerebral edema, oral fluid loading carries life-threatening risks.
3. **Severe Asymptomatic Hypertension vs Hypertensive Emergency:**  
   Asymptomatic elevations of blood pressure ($\text{SBP} \ge 180\text{ mmHg}$ or $\text{DBP} \ge 120\text{ mmHg}$) are distinguished from true hypertensive emergencies. Protocol guidelines mandate urgent physician consultation within 24 hours rather than dispatching emergency medical transport in the absence of acute target organ damage.
4. **Hemoglobin E (HbE) Heterozygosity & Laboratory Standards:**  
   The protocol affirms that HbE interference with HbA1c measurement depends entirely on the analytical assay method (e.g., ion-exchange HPLC vs capillary electrophoresis vs boronate affinity). Biological confounding (shortened erythrocyte survival) is explicitly distinguished from analytical chromatographic interference.
5. **Zero New Clinical Thresholds:**  
   This audit introduces **zero new clinical cutoffs, rules, or diagnostic thresholds**. All clinical parameters remain deferred to the Human Clinical Steering Committee.

---

## 5. Audit Findings & Formal Classifications

| Dimension Audited | Finding Summary | Finding Classification |
| :--- | :--- | :--- |
| **Unweighted Pooled Estimand** | Creates an uninterpretable mixture distribution; clinically invalid. | `FAILED` |
| **BBS Weighting Adequacy** | Adjusts demographics only; cannot correct clinical selection bias. | `VERIFIED WITH LIMITATIONS` |
| **Separation of Arm Estimands** | Primary (Community) vs Secondary (Clinic) estimand hierarchy defined. | `VERIFIED` |
| **Preservation of 12 Safety Rules** | All twelve clinical safety and model containment rules 100% preserved. | `VERIFIED` |
| **Production Model Isolation** | Pima disabled (`HTTP 403`), Cleveland `NOT EVALUABLE`, DiaBD research-only. | `VERIFIED` |

---

## 6. Required Human Expert Review

The following decisions require explicit authorization by human specialists:

1. **Clinical Epidemiologist & Principal Investigator:** Formally approve the protocol amendment designating the Community Screening Cohort as the **sole primary validation estimand**, relegating the Outpatient Cohort to secondary status.
2. **Clinical Laboratory Director:** Authorize the central laboratory SOP specifying the NGSP-certified boronate affinity or enzymatic HbA1c methodology to minimize analytical hemoglobin variant interference in Bangladesh.
3. **Institutional Ethics Committee (IEC):** Review the emergency referral safety protocol for incidental severe hypertension and symptomatic hyperglycemia to ensure local hospital capacity alignment.

---

> [!CAUTION]
> **FINAL GOVERNANCE STATUS**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2, Phase 06C.3, and Phase 06D remain strictly blocked.
