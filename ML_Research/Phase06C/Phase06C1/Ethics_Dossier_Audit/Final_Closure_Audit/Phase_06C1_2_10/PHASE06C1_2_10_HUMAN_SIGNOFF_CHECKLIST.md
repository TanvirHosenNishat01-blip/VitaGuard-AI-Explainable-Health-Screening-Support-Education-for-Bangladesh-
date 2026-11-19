# Phase 06C.1.2.10 — Human Specialist Governance & Sign-Off Checklist
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical Machine Learning Safety & Biostatistics Governance  
**Document ID:** `PHASE06C1_2_10_HUMAN_SIGNOFF_CHECKLIST.md`  
**Evaluation Mode:** CONSOLIDATED HUMAN REVIEW PACKAGE (DOCUMENTATION ONLY)  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Under strict institutional AI governance mandates, artificial intelligence models are strictly prohibited from selecting clinical estimands, authorizing sample sizes, approving diagnostic cutoffs, validating laboratory SOPs, or submitting ethics applications. This checklist defines the mandatory, sequential human expert sign-off gates that must be completed before any document is submitted to the Bangladesh Medical Research Council (BMRC) or any local Institutional Review Board. Phases 06C.2, 06C.3, and 06D remain strictly gated and blocked.

---

## 1. Specialist Sign-Off Structure & Sequential Governance Gates

The clinical trial protocol for external validation of the DiaBD screening model must pass four consecutive, non-bypassable human specialist sign-off gates:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        SEQUENTIAL HUMAN EXPERT GOVERNANCE GATES                                        │
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

---

## 2. Gate 1: Lead Biostatistician Technical Checklist

The independent Lead Biostatistician must review the mathematical models in [`PHASE06C1_2_10_SAMPLE_SIZE_DECISION_MATRIX.md`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Final_Closure_Audit/Phase_06C1_2_10/PHASE06C1_2_10_SAMPLE_SIZE_DECISION_MATRIX.md) and execute authoritative determinations across the seven mandatory technical dimensions:

### Checklist of Seven Mandatory Biostatistical Decisions
- [ ] **Decision 1: Primary Trial Estimand Specification**
  - Evaluated: Arm A (Community Screening) and Arm B (Outpatient Triage) clinical care pathways.
  - Determined: **Candidate estimand structure — pending independent human biostatistician justification and authorization**. ICH E9(R1) principles provide an estimand framework, but do not automatically mandate this particular two-arm design.
  - Binding Rule: Meta-analytic pooling across Arm A and Arm B is formally prohibited ($K = 2 \implies \text{df} = 1$).
  - *Biostatistician Determination:* `[ ] CANDIDATE ESTIMAND STRUCTURE JUSTIFIED & AUTHORIZED  [ ] ALTERNATIVE DESIGN SPECIFIED`

- [ ] **Decision 2: Sensitivity Precision Target & Interval Method**
  - Clinical Sensitivity target: $S_e \ge 0.70$ with half-width $W \le \pm 0.05$ ($95\%$ Confidence Interval).
  - Threshold Notice: Default cutoff $\tau = 0.50$ is exploratory only, derived with retrospective selection bias. Primary validation threshold must be pre-specified by human specialists; no threshold has been authorized by AI.
  - Normal Approximation Check: Evaluated the Buderer Wald requirement ($n = 323$ positive cases).
  - Confidence Interval Method Selected:
    * `[ ] Wilson Score Interval`
    * `[ ] Clopper-Pearson Exact Binomial Interval`
    * `[ ] Agresti-Coull Adjusted Interval`
    * `[ ] Standard Wald Asymptotic Interval`
  - *Biostatistician Determination:* `[ ] 323 CASES APPROVED  [ ] ADJUSTMENT SPECIFIED (SPECIFY N)`

- [ ] **Decision 3: Calibration Slope Precision Target & $\text{Var}(\text{LP})$ Justification**
  - Precision target: $\text{SE}(\beta_{\text{cal}}) \le 0.10$ for continuous calibration slope ($\beta_{\text{cal}} = 1.0$).
  - Evaluated Linear Predictor Variance: Provisional retrospective internal-holdout estimate $\text{Var}(\text{LP}) = 0.684$ versus conservative $\text{Var}(\text{LP}) = 0.400$ (NOT a verified prospective Bangladesh population parameter).
  - Riley event requirement evaluated ($E = 210$ positive events at $\text{Var}(\text{LP}) = 0.684$; $E = 359$ at $\text{Var}(\text{LP}) = 0.400$).
  - *Biostatistician Determination:* `[ ] Var(LP)=0.684 APPROVED  [ ] CONSERVATIVE Var(LP)=0.400 MANDATED`

- [ ] **Decision 4: Event-Attainment Probability Requirement**
  - Evaluated finding: Unadjusted expected-mean sizing ($E[X] = 323$ at $n = 5,127$) yields only $\approx 50.8\%$ probability of observing $\ge 323$ cases under independent binomial sampling. In clustered sizing ($N = 7,406$), attainment probability is NOT EVALUABLE.
  - Decided whether statistical assurance ($P(X \ge 323) \ge 0.95$) is a formal protocol requirement.
  - Selected Assurance Framework:
    * `[ ] Expected Information Approach (Targeting mean E[X] = 323; N ≈ 7,406)`
    * `[ ] Probability Assurance Approach (Targeting P(X ≥ 323) ≥ 95%; N ≈ 6,212 unclustered)`
    * `[ ] Dual-Protection Hybrid Sizing (Requires custom cluster overdispersion model)`
  - *Biostatistician Determination:* `[ ] FRAMEWORK AUTHORIZED`

- [ ] **Decision 5: Community & Outpatient Sampling Estimands**
  - Arm A defined: Asymptomatic community dwellers, true prevalence planning estimate $p = 6.3\%$ (sensitivity to $5.0\%$).
  - Arm B defined: Consecutive hospital outpatient walk-ins, true prevalence planning estimate $p = 12.0\%$.
  - Arm B Phrasing: Formally verified mandatory wording: `"Precision target met under stated assumptions"`.
  - *Biostatistician Determination:* `[ ] ESTIMANDS & PHRASING AUTHORIZED`

- [ ] **Decision 6: Clustering Model & Small-Sample GEE Corrections**
  - Evaluated community clustering: Checked whether $\text{DEFF} = 1.30$ is empirically justified or requires field parameters ($K, \bar{m}, \text{ICC}$).
  - Small-center warning for Arm B ($K = 4\text{--}8$ hospitals): Asymptotic sandwich estimator downward bias ($20\%\text{--}40\%$) reviewed.
  - Mandated Analysis Model:
    * `[ ] GEE with Mancl-DeRouen (2001) small-sample bias-corrected sandwich covariance`
    * `[ ] Generalized Linear Mixed Model (GLMM) with Kenward-Roger degrees-of-freedom adjustment`
    * `[ ] Cluster-robust standard errors via Kauermann-Carroll (2001) correction`
  - *Biostatistician Determination:* `[ ] CLUSTER & SMALL-SAMPLE MODEL SPECIFIED`

- [ ] **Decision 7: Authoritative Protocol Sample Size Selection**
  - Evaluated candidate sample sizes: $N = 6,212$ vs $N = 7,399$ vs $N = 7,406$ vs $N = 9,332$.
  - *Biostatistician Final Determination:*  
    *Selected Protocol Arm A Recruitment Target:* **$N = $ _______________ participants**  
    *Selected Protocol Arm B Recruitment Target:* **$N = $ _______________ participants**  

---

## 3. Gate 2: Clinical Principal Investigator (Endocrinologist) Checklist

The Clinical PI must independently review, modify as needed, and formally sign off on the medical safety, triage utility, and clinical screening protocols (currently unapproved drafts):

- [ ] **Clinical Sensitivity Target Authorization (Requires Clinical PI Review & Sign-Off):** Review and determine whether a minimum screening sensitivity of $S_e \ge 0.70$ is medically acceptable for an opportunistic risk-score triage tool in Bangladesh primary care.
- [ ] **Clinical Decision Cutoff Authorization (Requires Clinical PI Review & Sign-Off):** Formally pre-specify and authorize the primary clinical decision cutoff threshold using a rigorous development/validation strategy (recognizing that default $\tau = 0.50$ was an exploratory test-set artifact with selection bias and is NOT approved for clinical care).
- [ ] **Clinical Critical Action Alert Protocol (Requires Clinical PI Review & Sign-Off):** Review, refine, and authorize emergency referral procedures for asymptomatic participants presenting with dangerous hyper- or hypoglycemia during field intake:
  - Proposed draft criteria: Fasting Plasma Glucose $> 13.9\text{ mmol/L}$ ($> 250\text{ mg/dL}$) $\implies$ Urgent same-day physician referral.
  - Proposed draft criteria: Symptoms of diabetic ketoacidosis (DKA) or hyperosmolar hyperglycemic state (HHS) $\implies$ Immediate medical transport.
  - *Status:* Unapproved draft protocol; requires human clinician sign-off.
- [ ] **Participant Referral & Care Linkage (Requires Clinical PI Review & Sign-Off):** Review and approve linkage pathways ensuring all participants identified as newly diagnosed diabetic ($FPG \ge 7.0\text{ mmol/L}$ or $HbA1c \ge 6.5\%$) or pre-diabetic are linked to a designated Upazila Health Complex or government NCD corner.
- [ ] **Informed Consent Materials (Requires Clinical PI Review & Sign-Off):** Review and approve the Bengali language participant information sheet and informed consent form for linguistic clarity, cultural appropriateness, and non-coercive phrasing.

---

## 4. Gate 3: Clinical Laboratory Director Checklist

The Clinical Laboratory Director must review, validate, and formally sign off on all diagnostic laboratory standard operating procedures (currently unapproved draft SOPs):

- [ ] **HbA1c Assay Platform & NGSP Certification (Requires Lab Director Review & Sign-Off):** Review and mandate the analytical platform for confirmatory $HbA1c$ testing. Mandate National Glycohemoglobin Standardization Program (NGSP)-certified, IFCC-standardized boronate affinity HPLC to eliminate analytical interference from prevalent hemoglobin variants ($\text{HbE}$ and $\beta$-thalassemia trait).
  - *Status:* Unapproved draft specification; requires Laboratory Director certification.
- [ ] **Pre-Analytical Phlebotomy & Glycolysis Protocol (Requires Lab Director Review & Sign-Off):** Review, refine, and authorize the field-to-lab phlebotomy and transport protocol:
  - Fluoride/citrate tube selection: Venous blood drawn into sodium fluoride/potassium oxalate tubes or citrate-buffered glycolysis-inhibiting tubes.
  - Specimen transport and processing times: Maximum transit time to central laboratory ($< 4\text{ hours}$ proposed). Centrifugation within $30\text{ minutes}$ of draw, or immediate refrigeration.
  - Cold-chain requirements: Transport in $2\text{--}8^\circ\text{C}$ portable electric cool boxes with verified continuous cold-chain data loggers.
  - *Status:* Unapproved draft specification; requires Laboratory Director sign-off.
- [ ] **Reference Diagnostic Criteria (Requires Lab Director Review & Sign-Off):** Confirm laboratory alignment with standard WHO / ADA diagnostic criteria:
  - Diabetes: $FPG \ge 7.0\text{ mmol/L}$ ($126\text{ mg/dL}$) OR $HbA1c \ge 6.5\%$ ($48\text{ mmol/mol}$).
  - Impaired Fasting Glucose (Pre-diabetes): $FPG \ge 5.6\text{ to } 6.9\text{ mmol/L}$ ($100\text{ to } 125\text{ mg/dL}$) OR $HbA1c \ge 5.7\text{ to } 6.4\%$.
- [ ] **Central Laboratory Quality Assurance (Requires Lab Director Review & Sign-Off):** Verify ISO 15189 accreditation certificate and inspect internal/external quality control (EQAS) protocols.

---

## 5. Gate 4: Institutional Review Board (BMRC / ERC) Submission Gates

Before formal submission to the Bangladesh Medical Research Council (BMRC) National Research Ethics Committee:

- [ ] Gate 1 (Biostatistician Checklist) signed and attached.
- [ ] Gate 2 (Clinical PI Checklist) signed and attached.
- [ ] Gate 3 (Laboratory Director Checklist) signed and attached.
- [ ] Complete Protocol Dossier assembled, incorporating all Phase 06C corrections.
- [ ] Data Management & Patient Privacy Plan (de-identification, AES-256 encryption, access logs) certified compliant with Bangladesh Digital Security Act / Data Protection principles.
- [ ] Institutional Memoranda of Understanding (MoU) with participating hospitals and Upazila Health Complexes drafted for administrative execution.

---

## 6. Formal Sign-Off Blocks

### Gate 1 Sign-Off: Lead Independent Biostatistician
```
I hereby certify that I have independently reviewed the statistical analysis plan,
sample size derivations, and precision criteria for the DiaBD clinical validation study.
I have made the binding determinations required in Section 2 of this document.

Signature:   ____________________________________________________
Printed Name: ____________________________________________________
Academic/Professional Title: _____________________________________
Institutional Affiliation: ________________________________________
Date (YYYY-MM-DD): _______________________________________________
```

### Gate 2 Sign-Off: Clinical Principal Investigator (Endocrinologist)
```
I hereby certify that I have reviewed the clinical trial protocol, patient safety
referral SOPs, diagnostic cutoffs, and participant information materials. I confirm
that the clinical safety requirements are fully addressed.

Signature:   ____________________________________________________
Printed Name: ____________________________________________________
Clinical Specialization: ________________________________________
Institutional Affiliation: ________________________________________
Date (YYYY-MM-DD): _______________________________________________
```

### Gate 3 Sign-Off: Clinical Laboratory Director
```
I hereby certify that the confirmatory laboratory diagnostic procedures (boronate
affinity HPLC for HbA1c and pre-analytically stabilized FPG) meet international
standards and eliminate local hemoglobinopathy interference risks.

Signature:   ____________________________________________________
Printed Name: ____________________________________________________
Laboratory Accreditation: _______________________________________
Institutional Affiliation: ________________________________________
Date (YYYY-MM-DD): _______________________________________________
```

---

> [!CAUTION]
> **STATUTORY GOVERNANCE HALT**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2, Phase 06C.3, and Phase 06D remain strictly blocked pending completed human signatures across all four gates.
