> **Historical record, labeled 2026-11-19.** This file is preserved as an earlier research note. It is not the current description of the application. Dataset sampling frame and site-level provenance have not been independently verified from the available source documentation. Statements in this file that name a verified hospital catchment, or that say the Pima path returns HTTP 403 or is closed, describe an earlier note or an earlier design. The current consented Pima route is open, with the Phoenix-area cohort limit. See submission/final_readiness/DOCUMENTATION_CONSISTENCY_AUDIT.md.

# TriNexus | VitaGuard AI — Unresolved Limitations & Human Review Register
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical Machine Learning Safety & Biostatistics Governance  
**Document ID:** `UNRESOLVED_LIMITATIONS_AND_HUMAN_REVIEW_REGISTER.md`  
**Evaluation Mode:** FINAL EVIDENCE AUDIT & TEN-QUESTION GOVERNANCE SYNTHESIS  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Automated AI auditing formally ceases with this final evidence audit. Under binding covenants, AI systems cannot authorize clinical trial initiation, validate diagnostic thresholds, or claim clinical superiority. Phases 06C.2, 06C.3, and 06D remain strictly blocked. All outstanding clinical, statistical, laboratory, and ethical decisions belong exclusively to qualified human specialists.

---

## 1. Definitive Answers to the Ten Mandatory Questions

In accordance with Master Directive Section 13, the multidisciplinary audit team delivers the authoritative, evidence-backed answers to the ten required final questions:

### Question 1: Which pathway has the strongest valid internal evidence?
- **Authoritative Determination:**  
  * For **clinical guideline and epidemiological validity**, the **WHO South Asia Non-Laboratory 10-Year CVD Risk Chart** is the strongest pathway. Derived from the Globorisk / WHO pooled regional derivation (Lancet Global Health, SEAR D), all 700 lookup cells were verified with $100\%$ mathematical monotonicity and zero boundary violations.
  * For **machine learning predictive modeling**, the **DiaBD Bangladesh Diabetes Model (Linear Baseline)** has the strongest valid internal evidence. Evaluated on the **$N = 4,095$ development set** with 5-fold cross-validation, its transparent Logistic Regression baseline achieved a mean CV AUROC of **0.7208 $\pm$ 0.0110** with complete in-fold preprocessing isolation, zero target leakage, and genuine local demographic relevance.

---

### Question 2: Which pathway has the best demonstrated calibration evidence?
- **Authoritative Determination:**  
  * On published prospective data, the **WHO South Asia CVD Risk Chart** is derived from pooled regional epidemiological cohorts, though local prospective validation in contemporary Bangladesh is unverified.
  * Within internal machine learning experiments, the **Cleveland L1-Regularized Logistic Regression** demonstrated a calibration slope point estimate of $\beta = \mathbf{1.0114}$ and Brier score of **0.1356** (BSS = $\mathbf{+0.4540}$). However, this was evaluated on the **development split of only 237 referral patients (109 events)**; with wide sampling uncertainty ($\approx \pm 0.25$) and severe catheterization referral bias, it cannot be described as clinically best-calibrated.
  * For DiaBD, post-hoc Platt scaling achieved an excellent calibration slope of **0.9777** and Brier score of **0.0573** (BSS = $+0.0358$) on the test split, but that test split was previously unblinded. In its raw production state, DiaBD is severely uncalibrated (averaging $37.89\%$ predicted risk).

---

### Question 3: Which pathway has the greatest realistic research-improvement potential?
- **Authoritative Determination:**  
  The **DiaBD Bangladesh Diabetes Model**. It is the only pathway trained on real Bangladeshi adults. It has strong potential for genuine scientific improvement through:
  1. Adopting the parsimonious, transparent Logistic Regression baseline over complex decision trees.
  2. Prospective multi-center calibration across diverse administrative divisions.
  3. Adding non-invasive anthropometric indicators (e.g., waist-to-height ratio, family history depth).
  4. Recalibrating decision thresholds on independent prospective cohorts.

---

### Question 4: Which pathway has the most serious unresolved limitations?
- **Authoritative Determination:**  
  The **Pima Historical Model** and the **Cleveland Cardiovascular Model**:
  * **Pima:** Suffers from complete genetic, demographic, and temporal population transportability failure (1965–1992 Gila River Pima Indian females). It has zero clinical applicability to South Asian populations in Bangladesh and is permanently barred from patient-facing use.
  * **Cleveland:** Suffers from severe tertiary cardiac catheterization referral and spectrum bias ($46.1\%$ prevalence of severe coronary stenosis). High-acuity angiographic variables (`ca`, `thal`, `exang`) cannot be acquired or interpreted in primary care community screening.

---

### Question 5: Which results are invalid, inconclusive or not evaluable?
- **Authoritative Determination:**  
  1. **INVALID:** The historical Pima test AUROC ($0.9519$) and accuracy ($87.66\%$) are formally **INVALID** due to target-conditional median imputation leakage.
  2. **INCONCLUSIVE:** DiaBD subgroup performance in young adults (Age $<40$ years) is **INCONCLUSIVE / INSUFFICIENT STATISTICAL PRECISION** due to an AUROC collapse ($0.6092$) and only 44 positive events ($E = 44$).
  3. **NOT EVALUABLE:** Clustered event-attainment tail probability under multi-stage sampling is **NOT EVALUABLE** without empirical cluster parameters ($K, \bar{m}, \text{CV}_m, \text{ICC}$).

---

### Question 6: Did any experiment accidentally use previously unblinded test data for model selection or calibration?
- **Authoritative Determination:**  
  **RECONCILED TWO-PART DETERMINATION:**  
  1. **Current Model Excellence Execution:** **NO.** The current Model Excellence experiment suite strictly isolated the development split ($N = 4,095$) for all 5-fold cross-validation, model comparison, feature evaluation, and Platt calibrator parameter fitting ($a = 3.68511$, $b = -4.36905$). The 1,024-row holdout split was evaluated once as a benchmark.
  2. **Historical Phase 06B Execution:** **YES.** In Phase 06B (`DIABD_THRESHOLD_ANALYSIS.md`), exploratory threshold sweeps across cutoffs $\tau \in [0.04, 0.50]$ were evaluated directly on the unblinded $1,024$-row test split, and operating points ($\tau = 0.05, 0.08$) were proposed after inspecting test-split metrics.  
  * **Consequence:** The historical claim that test data were "never used" for any model or threshold selection activity is incorrect. Historical exploratory threshold selection was test-informed. Consequently, the test split is contaminated for prospective threshold validation. **ZERO THRESHOLDS ARE APPROVED OR AUTHORIZED FOR CLINICAL USE.** Default $\tau = 0.50$ remains strictly exploratory.

---

### Question 7: Did the experimental suite modify any production assets?
- **Authoritative Determination:**  
  **NO.** Cryptographic verification across all nineteen (19) tracked production assets confirmed that every production model artifact, scaler, dataset, evaluation JSON, and service file remains **100% byte-identical** (`19/19 MANIFEST ASSETS VERIFIED`). Zero production files or database records were modified.

---

### Question 8: What independent external evidence is still missing?
- **Authoritative Determination:**  
  1. Genuinely independent external validation cohorts from unstudied Bangladeshi geographic divisions.
  2. Multi-center prospective screening study data.
  3. Centralized laboratory reference standard confirmation (NGSP-certified boronate affinity HPLC HbA1c and hexokinase fasting plasma glucose).
  4. Real-world operational prospective data on participant compliance, transport cold-chain stability, and clinical referral uptake.

---

### Question 9: What human specialist decisions remain necessary?
- **Authoritative Determination:**  
  A total of **nineteen (19) non-delegable human specialist determinations** across four sequential governance gates:
  * **Lead Biostatistician (7 decisions):** Estimand architecture, inference standard, calibration slope target, sizing philosophy, cluster model, small-sample GEE corrections, sample size authorization.
  * **Clinical Principal Investigator (5 decisions):** Sensitivity target ($S_e = 0.70$), clinical decision cutoff, emergency hyperglycemia referral SOP ($FPG > 13.9\text{ mmol/L}$), care linkage pathways, Bengali ICF approval.
  * **Clinical Laboratory Director (4 decisions):** Reference assay standard, pre-analytical glycolysis stabilization SOP, discordance arbitration, ISO 15189 / EQAS certification.
  * **Institutional Review Board / BMRC (3 decisions):** Formal ethical clearance certificate, Data Protection Act compliance, clinical trial registration.

---

### Question 10: Can any model currently claim clinical superiority or Bangladesh clinical validation?
- **Authoritative Determination:**  
  **ABSOLUTELY NOT.** No model on the platform possesses independent comparative clinical evidence to claim superiority over any standard-of-care tool (e.g., ADA Risk Score, FINDRISC, or random capillary glucose), nor does any model possess regulatory clearance or human specialist authorization for clinical diagnostic deployment in Bangladesh.

---

## 2. Register of Unresolved Limitations Across Pathways

```
┌────┬─────────────────────────────┬──────────────────────────┬─────────────────────────────────────────────────────────────────┐
│ #  │ Identified Limitation       │ Affected Pathway(s)      │ Impact on Real-World Deployment                                 │
├────┼─────────────────────────────┼──────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ 1  │ Uncalibrated Production     │ DiaBD XGBoost Production │ Produces average predicted probability of ~38%, alarming        │
│    │ Model Probabilities         │                          │ patients; mitigated only by labeling as screening index.        │
├────┼─────────────────────────────┼──────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ 2  │ Population Spectrum Bias    │ Cleveland Cardio Model   │ Evaluates coronary stenosis in catheterization referrals;       │
│    │                             │                          │ cannot be deployed for general population CVD screening.        │
├────┼─────────────────────────────┼──────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ 3  │ Genetic & Epidemiological   │ Pima Historical Model    │ 100% mismatch with South Asian biology; patient-facing endpoint │
│    │ Non-Transportability        │                          │ must remain permanently blocked with HTTP 403 Forbidden.        │
├────┼─────────────────────────────┼──────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ 4  │ Low Sensitivity in Young    │ DiaBD Screening Model    │ AUROC collapses to 0.609 in adults <40 years; only 44 positive   │
│    │ Adults (Age < 40)           │                          │ events; cannot be relied upon for early-onset diabetes screening.│
├────┼─────────────────────────────┼──────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ 5  │ Convenience Sampling Bias   │ DiaBD Survey Dataset     │ 69.6% female participation in rural villages; lacks urban,      │
│    │                             │                          │ industrial, and ethnic minority demographic representation.     │
├────┼─────────────────────────────┼──────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ 6  │ Age Boundary Truncation     │ WHO South Asia CVD Chart │ Valid only for ages 40–74; cannot assess 10-year risk in        │
│    │ (Ages 40–74 Only)           │                          │ individuals younger than 40.                                    │
├────┼─────────────────────────────┼──────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ 7  │ Absence of Prospective      │ All Four Pathways        │ Generalizability across Bangladesh divisions is unproven;       │
│    │ External Cohorts            │                          │ independent validation remains **NOT AVAILABLE**.               │
└────┴─────────────────────────────┴──────────────────────────┴─────────────────────────────────────────────────────────────────┘
```

---

## 3. Human Specialist Sign-Off Gateway

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        SEQUENTIAL HUMAN SPECIALIST SIGN-OFF GATES                                      │
│                                                                                                        │
│  ┌────────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐            │
│  │         GATE 1         │      │         GATE 2         │      │         GATE 3         │            │
│  │  Lead Biostatistician  │ ───► │ Clinical PI (Endocrin) │ ───► │ Clinical Lab Director  │ ───┐        │
│  │ (Statistical Modeling) │      │ (Medical Safety & SOP) │      │ (Assay & Sample SOP)   │    │        │
│  └────────────────────────┘      └────────────────────────┘      └────────────────────────┘    │        │
│                                                                                                │        │
│                                  ┌────────────────────────┐                                    │        │
│                                  │         GATE 4         │                                    │        │
│                                  │ Institutional IRB/BMRC │ ◄──────────────────────────────────┘        │
│                                  │ (Ethical Authorization)│                                             │
│                                  └────────────────────────┘                                             │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

All 19 human specialist decisions remain open, documented, and non-delegable. Under strict project covenants, AI systems will never pre-empt, fabricate, or bypass human specialist review.

---

## 4. Definitive Final Governance Statement

```
========================================================================================================
                          OFFICIAL CESSATION OF AI AUDITING ACTIVITIES:
      MODEL EXCELLENCE INITIATIVE IS FORMALLY CONCLUDED, VERIFIED, AND PERMANENTLY SEALED.
                   ALL FURTHER ACTION REQUIRES AUTHORITATIVE HUMAN SPECIALIST ACTION.
========================================================================================================
```

1. **No Further AI Audit Phases:** Formal automated AI auditing ceases permanently with this document. No subsequent AI phase shall be initiated.
2. **Absolute Implementation Freeze:** Phase 06C.2 (Pilot Study), Phase 06C.3 (Multi-Center Clinical Trial), and Phase 06D (Regulatory Submission & Clinical Deployment) remain 100% locked, gated, and blocked.
3. **Regulatory Realism:** The platform is a research prototype. It has not received BMRC approval, possesses no clinical trial license, and has zero legal authority to screen patients or recruit participants.

---

> [!CAUTION]
> **STATUTORY GOVERNANCE HALT**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Any attempt to recruit participants, collect clinical specimens, contact clinical trial sites, modify production software, or claim institutional clearance based on this AI dossier constitutes a direct violation of medical research ethics, Good Clinical Practice (GCP), and TriNexus project covenants.
