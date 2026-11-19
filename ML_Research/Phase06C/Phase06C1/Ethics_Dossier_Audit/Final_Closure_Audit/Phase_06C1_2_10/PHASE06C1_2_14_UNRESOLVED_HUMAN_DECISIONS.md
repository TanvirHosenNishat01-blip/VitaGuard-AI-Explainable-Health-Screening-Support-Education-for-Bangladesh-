# Phase 06C.1.2.14 — Master Register of Unresolved Human Specialist Decisions & Governance Boundaries
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical Machine Learning Safety & Biostatistics Governance  
**Document ID:** `PHASE06C1_2_14_UNRESOLVED_HUMAN_DECISIONS.md`  
**Evaluation Mode:** FINAL GOVERNANCE BOUNDARY REGISTER (DOCUMENTATION ONLY)  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Under strict institutional AI governance mandates, artificial intelligence systems are strictly prohibited from selecting clinical estimands, authorizing sample sizes, approving diagnostic cutoffs, validating laboratory SOPs, or submitting clinical trial protocols to ethics review boards. This document registers all outstanding decisions that must be resolved exclusively by living, qualified human specialists prior to any regulatory submission or trial initiation. Automated AI auditing formally ceases with Phase 06C.1.2.14. Phases 06C.2, 06C.3, and 06D remain strictly gated and blocked.

---

## 1. Executive Mandate & Boundary Principle

The completion of the Phase 06C.1.2 documentary audit sequence establishes complete mathematical reconciliation, code-level provenance tracing, and cross-document consistency across the prospective clinical validation dossier for the **DiaBD Bangladesh Diabetes Screening Model**.

### The Definitive AI Boundary Principle:
1. **Bounded AI Capability:** AI agents are analytical tools capable of executing arithmetic checks, verifying statistical code, identifying logical contradictions, and formatting structured review packages.
2. **Absolute Human Specialist Authority:** AI models cannot establish clinical risk tolerances, cannot balance diagnostic sensitivity against healthcare system burden, cannot validate laboratory physical infrastructure, cannot evaluate cultural consent nuances, and cannot assume statutory legal responsibility for patient safety.
3. **Cessation of AI Auditing:** Automated AI auditing formally concludes with Phase 06C.1.2.14. **No Phase 06C.1.2.15 or subsequent AI audit cycle shall be created.**
4. **Sample Size Status:** All candidate sample sizes ($N = 6,212$, $N = 7,399$, $N = 7,406$, $N = 9,332$, $N = 2,065$, $N = 2,066$, $N = 2,400$) are conditional exploratory planning scenarios. The AI does NOT recommend, select, or authorize any final target.

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

## 2. Gate 1: Lead Biostatistician Decisions (7 Mandatory Determinations)

The independent Lead Biostatistician must review the mathematical foundations compiled in the review suite and issue formal determinations across seven specific technical domains:

### Decision 1.1: Estimand Architecture Authorization
- **Issue:** The dossier outlines a candidate two-arm estimand architecture:
  * **Arm A:** Community screening sensitivity and negative predictive value (NPV) among asymptomatic adults in rural/semi-urban Bangladesh.
  * **Arm B:** Hospital outpatient triage calibration slope and discrimination (C-statistic) among suspected diabetic individuals.
- **Unresolved Decision:** The biostatistician must determine whether Arm A and Arm B represent sound, independent co-primary estimands under ICH E9(R1), whether the validation should be restricted solely to Arm A (community screening), or whether Arm B should be designated as an exploratory secondary objective.
- **Governance Constraint:** Meta-analytic pooling across Arm A and Arm B is formally prohibited ($K = 2 \implies \text{df} = 1$). ICH E9(R1) provides an estimand framework but does not automatically mandate this specific two-arm structure.

### Decision 1.2: Confidence Interval & Standard Error Formulation
- **Issue:** Candidate sample sizes rely on Buderer precision formulas with Wilson score confidence interval approximations and Riley calibration slope standard error formulas.
- **Unresolved Decision:** The biostatistician must establish the primary inference standard for prospective analysis:
  * Option A: Cluster-adjusted Wilson score interval for sensitivity ($W = 0.05$).
  * Option B: Generalized Estimating Equations (GEE) with robust empirical sandwich variance estimator.
  * Option C: Cluster wild bootstrap or percentile bootstrap.

### Decision 1.3: Calibration Slope Precision Target & $\text{Var}(\text{LP})$ Transferability
- **Issue:** Arm B sample sizing utilizes the Riley formula $\text{SE}(\hat{\beta}_{\text{cal}}) \approx \sqrt{\frac{2.2295}{E}}$ with a precision target $\text{SE} \le 0.10$, yielding required event information $E \ge 222.95$ ($\lceil 222.95 \rceil = 223$ events). Constant $2.2295$ was algebraically derived assuming $p = 0.12$ and linear predictor variance $\text{Var}(\text{LP}) = 0.684$ (reproduced empirical DiaBD test-set value: $0.6888$).
- **Unresolved Decision:**
  1. The biostatistician must validate whether $\text{SE} \le 0.10$ is an appropriate clinical precision boundary for calibration slope.
  2. The biostatistician must determine whether transferring $\text{Var}(\text{LP})$ derived from a general community test set ($N = 1,024$) to an outpatient triage population is methodologically sound, or whether outpatient case-mix homogeneity could shrink $\text{Var}(\text{LP})$ (e.g., to $\approx 0.400$), which would inflate event requirements to $E \ge 341 \implies N_{\text{rec}} \approx 3,157$.

### Decision 1.4: Sizing Philosophy: Expected Information vs Assurance Under Clustering
- **Issue:** Sizing for expected information ($E[X] = 323$ at $n_{\text{eval}} = 5,127$) yields only an unclustered binomial event-attainment probability of $50.81\%$. At candidate size $N = 7,406$ ($n_{\text{eval}} \approx 6,665$), expected raw positives are $\approx 420$, yielding unclustered binomial assurance $> 99.9999\%$, but under multi-stage cluster sampling, the true probability of observing $\ge 323$ cases is **`NOT EVALUABLE`** without empirical cluster parameters.
- **Unresolved Decision:** The biostatistician must define the formal sizing philosophy:
  * Sizing for expected effective information ($E[X_{\text{eff}}] \ge 323$ under assumed design effect), accepting that actual observed cases will vary around the expectation; OR
  * Sizing for formal statistical assurance ($P(\text{Information} \ge 323) \ge 0.95$), which requires specifying cluster-level variance parameters.

### Decision 1.5: Multi-Stage Cluster Design Parameters
- **Issue:** Arm A assumes an overall design effect $\text{DEFF} = 1.30$, corresponding to intracluster correlation $\rho \approx 0.01\text{--}0.02$ across community Upazila Health Complexes and mobile clinics. Arm B assumes $\text{DEFF} = 1.00$ based on individual consecutive outpatient intake.
- **Unresolved Decision:** The biostatistician must review and approve the cluster sampling model:
  * Justify the provisional $\text{DEFF} = 1.30$ or mandate formal calculation based on planned cluster size $\bar{m}$ and assumed $\text{ICC}$ ($\text{DEFF} = 1 + (\bar{m} - 1)\rho$).
  * Verify whether individual consecutive intake in Arm B genuinely justifies $\text{DEFF} = 1.00$, or whether hospital-level cluster effects require a non-unit design effect ($\text{DEFF} \ge 1.20$).

### Decision 1.6: Small-Sample Bias Corrections for Clustered Analysis
- **Issue:** If the trial recruits from a limited number of Upazila clusters ($K < 40$), standard GEE sandwich estimators underestimate standard errors, leading to inflated type I error rates and anti-conservative confidence intervals.
- **Unresolved Decision:** The biostatistician must pre-specify the small-sample variance correction method in the Statistical Analysis Plan (SAP), e.g., the Morel-Bokossa-Neerchal (MBN), Mancl-DeRouen (MD), or Kauermann-Carroll (KC) bias-corrected covariance estimators.

### Decision 1.7: Final Sample Size Selection & Recruitment Target Authorization
- **Issue:** Multiple candidate planning scenarios exist in the dossier:
  * **Arm A Scenarios:**
    - Scenario A1: $N = 6,212$ (Unclustered independent-binomial 95% assurance; $\text{DEFF} = 1.00$).
    - Scenario A2: $N = 7,399$ (Continuous unrounded ceil-last Buderer; $\text{DEFF} = 1.30$, $p = 0.063$).
    - Scenario A3: $N = 7,406$ (Discrete integer-step Buderer; $\text{DEFF} = 1.30$, $p = 0.063$).
    - Scenario A4: $N = 9,332$ (Conservative prevalence sensitivity; $\text{DEFF} = 1.30$, $p = 0.050$).
  * **Arm B Scenarios:**
    - Scenario B1: $N = 2,065$ (Continuous unrounded ceil-last Riley; $p = 0.12$, $\text{SE} \le 0.10$).
    - Scenario B2: $N = 2,066$ (Discrete integer-step Riley; $p = 0.12$, $\text{SE} \le 0.10$).
    - Scenario B3: $N = 2,400$ (Robustness scenario; maintains $\text{SE} \le 0.10$ down to $p = 10.3\%$).
- **Unresolved Decision:** The biostatistician must select and formally sign off on the definitive authorized recruitment target for both arms, or establish a formal interim sample size re-estimation protocol.

---

## 3. Gate 2: Clinical Principal Investigator Decisions (5 Mandatory Determinations)

The Clinical Principal Investigator (Lead Endocrinologist / Clinical Epidemiologist) must evaluate clinical safety, medical risk-benefit ratios, and patient-facing operational workflows:

### Decision 2.1: Clinical Sensitivity Target Justification ($S_e = 0.70$)
- **Issue:** Sizing calculations in Arm A assume a target clinical sensitivity $S_e = 0.70$ with half-width $W = 0.05$ ($95\%\text{ CI: } [0.65, 0.75]$).
- **Unresolved Decision:** The Clinical PI must determine whether a sensitivity of $70\%$ is clinically and ethically acceptable for a population screening tool in Bangladesh. If a higher sensitivity (e.g., $S_e \ge 0.80$ to minimize missed cases of undiagnosed diabetes) is mandated by clinical guidelines, positive event requirements increase substantially ($E \ge 422$ positive cases).

### Decision 2.2: Primary Decision Threshold Authorization
- **Issue:** The default algorithmic classification threshold $\tau = 0.50$ referenced in previous research was derived from exploratory test-set evaluations and is subject to selection bias.
- **Unresolved Decision:** The Clinical PI must formally determine:
  * That $\tau = 0.50$ is **strictly unapproved for clinical decision-making**;
  * Whether a prospective internal pilot calibration phase will be conducted to fix the decision threshold prior to locking the primary trial evaluation, or whether validation will evaluate performance across a continuous spectrum of operating thresholds (e.g., decision curve analysis / net benefit).

### Decision 2.3: Emergency Hyperglycemia & Critical Value Referral Protocol
- **Issue:** Field screening will encounter participants with severe undiagnosed hyperglycemia or metabolic crises.
- **Unresolved Decision:** The Clinical PI must establish and sign off on a binding clinical SOP for immediate emergency referral:
  * Mandatory immediate point-of-care capillary or rapid venous glucose check for symptomatic participants.
  * Explicit critical alert threshold (e.g., fasting venous plasma glucose $> 13.9\text{ mmol/L}$ [$250\text{ mg/dL}$] or random glucose $> 16.7\text{ mmol/L}$ [$300\text{ mg/dL}$]).
  * Defined emergency transport, acute medical stabilization, and hydration protocol to prevent Diabetic Ketoacidosis (DKA) or Hyperosmolar Hyperglycemic State (HHS).

### Decision 2.4: Clinical Care Linkage & Confirmatory Referral Pathways
- **Issue:** Screening asymptomatic individuals in rural communities without guaranteed access to clinical management creates severe ethical violations (screening without care linkage).
- **Unresolved Decision:** The Clinical PI must establish formal written referral linkages between screening field units and Upazila Health Complexes / District Hospitals:
  * Confirmatory testing schedule within 7–14 days.
  * Guaranteed consultation with a qualified medical officer or diabetologist.
  * Subsidized or free lifestyle counseling and initial pharmacotherapy pathways.

### Decision 2.5: Bengali Informed Consent Form (ICF) & Low-Literacy Assent Protocols
- **Issue:** Participants in rural screening clusters exhibit diverse literacy levels, linguistic dialects, and vulnerabilities.
- **Unresolved Decision:** The Clinical PI must approve:
  * The linguistically validated, culturally adapted Bengali Informed Consent Form (ICF).
  * Impartial witness documentation protocols for illiterate or semi-literate participants.
  * Audio/video explanation scripts ensuring that participants understand that participation is voluntary and that model screening does not constitute definitive medical diagnosis.

---

## 4. Gate 3: Clinical Laboratory Director Decisions (4 Mandatory Determinations)

The Clinical Laboratory Director (Consultant Chemical Pathologist) must validate diagnostic assay accuracy, sample integrity protocols, and quality control systems:

### Decision 3.1: Confirmatory Diagnostic Reference Standard Selection
- **Issue:** Establishing the definitive gold-standard diagnostic criteria for diabetes validation in Bangladeshi cohorts.
- **Unresolved Decision:** The Laboratory Director must designate and validate the primary confirmatory diagnostic platform:
  * National Glycohemoglobin Standardization Program (NGSP) certified, IFCC-traceable boronate affinity HPLC HbA1c (selected to eliminate interference from hemoglobin variants such as $\text{HbE}$ and $\beta\text{-thalassemia}$ trait, highly prevalent in Bangladesh); AND/OR
  * Central laboratory hexokinase reference plasma venous glucose (fasting plasma glucose $\ge 7.0\text{ mmol/L}$ [$126\text{ mg/dL}$] or 2-hour post-OGTT $\ge 11.1\text{ mmol/L}$ [$200\text{ mg/dL}$]).

### Decision 3.2: Pre-Analytical Glycolysis Stabilization & Cold-Chain Protocol
- **Issue:** Unstabilized whole blood undergoes ex vivo glycolysis at $\approx 5\text{--}7\%\text{ per hour}$ at room temperature, leading to substantial false-negative plasma glucose measurements in tropical climates.
- **Unresolved Decision:** The Laboratory Director must formally approve the pre-analytical collection and processing SOP:
  * Vacuum blood collection tube specifications (e.g., sodium fluoride/potassium oxalate vs rapid-glycolysis-inhibiting acidified citrate tubes).
  * Strict physical time limits: centrifugation within $30\text{ minutes}$ of venipuncture, or immersion in an ice-water slurry with plasma separation within $60\text{ minutes}$.
  * Monitored cold-chain specimen transport at $2\text{--}8^\circ\text{C}$ with continuous USB/Bluetooth data logging, with laboratory arrival within $< 4\text{ hours}$.

### Decision 3.3: Reference Standard Diagnostic Thresholds & Discordance Resolution
- **Issue:** Discrepancies between fasting glucose and HbA1c are common in South Asian populations due to nutritional status, iron deficiency, and altered red cell turnover.
- **Unresolved Decision:** The Laboratory Director must approve the clinical diagnostic arbitration algorithm for discordant laboratory results (e.g., $\text{HbA1c} \ge 6.5\%$ but $\text{FPG} < 7.0\text{ mmol/L}$), including criteria for repeat fasting blood draws or confirmatory 75g oral glucose tolerance testing (OGTT).

### Decision 3.4: Laboratory Quality Assurance, Accreditation & EQAS
- **Issue:** Laboratory variability directly degrades model validation estimates.
- **Unresolved Decision:** The Laboratory Director must certify:
  * Laboratory accreditation under ISO 15189 (Medical Laboratories — Requirements for Quality and Competence).
  * Daily two-level internal quality control (IQC) with Westgard multirule evaluation (analytical $\text{CV} \le 2.0\%$ for HbA1c).
  * Active enrollment and documented acceptable performance in an External Quality Assessment Scheme (EQAS), such as the College of American Pathologists (CAP) or Randox International Quality Assessment Scheme (RIQAS).

---

## 5. Gate 4: Institutional Review Board (IRB) / BMRC Decisions (3 Mandatory Determinations)

The Institutional Review Board / Bangladesh Medical Research Council (BMRC) provides the statutory ethical and legal authorization for human subject research:

### Determination 4.1: Comprehensive Ethical Evaluation & Protocol Approval
- **Issue:** Independent evaluation of participant risks, community benefits, and equitable subject selection.
- **Unresolved Determination:** The IRB/BMRC must review the finalized, specialist-signed protocol and issue a formal written Ethical Clearance Certificate. Under no circumstances may recruitment or screening begin prior to receiving this certificate.

### Determination 4.2: Data Protection, Privacy & Digital Health Governance
- **Issue:** Digital collection of identifiable clinical data, biometric features, and model inference outputs.
- **Unresolved Determination:** The IRB must review and certify data governance protocols under the Bangladesh Digital Security Act 2018 and relevant health data privacy regulations:
  * On-premise secure server data storage within Bangladesh (data sovereignty).
  * Pseudonymization of participant records with separate, cryptographically secured master linking keys.
  * Explicit prohibitions against secondary commercial data exploitation or unauthorized cloud transfers.

### Determination 4.3: Clinical Trial Registration & Formal Authorization
- **Issue:** Statutory transparency requirements for prospective clinical research.
- **Unresolved Determination:** The trial must be registered in a primary clinical trial registry recognized by the World Health Organization (e.g., ClinicalTrials.gov or Clinical Trials Registry - India [CTRI]) prior to screening participant #001.

---

## 6. Technical Parameters Inherently "Unevaluable by AI"

The audit revealed several critical scientific parameters that cannot be resolved computationally or mathematically by an AI agent, as they depend strictly on empirical field sampling distributions and human policy choices:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        PARAMETERS INHERENTLY UNEVALUABLE BY AI                                         │
├────┬─────────────────────────────┬────────────────────────────────┬────────────────────────────────────┤
│ #  │ Parameter Name              │ Mathematical Obstacle          │ Required Empirical / Human Input   │
├────┼─────────────────────────────┼────────────────────────────────┼────────────────────────────────────┤
│ 1  │ Clustered Event-Attainment  │ Clustered binomial probability │ Requires empirical cluster size    │
│    │ Probability                 │ requires joint distribution    │ distribution ($K, \bar{m}, CV_m$)  │
│    │ $P(X_{\text{clustered}}\ge 323)$│ of cluster sizes and random    │ and true intraclass correlation    │
│    │                             │ intercepts; cannot be computed │ ($\rho$); cannot be evaluated via  │
│    │                             │ via univariate binomial CDF.   │ closed-form formulas.              │
├────┼─────────────────────────────┼────────────────────────────────┼────────────────────────────────────┤
│ 2  │ Outpatient Case-Mix Linear  │ Transferability of $\text{Var} │ Requires prospective pilot study   │
│    │ Predictor Variance          │ (\text{LP}) = 0.6888$ across   │ data from actual hospital triage   │
│    │ $\text{Var}(\text{LP})_{\text{outpatient}}$│ distinct clinical settings is  │ patients; hospital spectrum effect │
│    │                             │ unknown; spectrum effects may  │ cannot be computed from community  │
│    │                             │ shrink variance to $\le 0.400$.│ survey data.                       │
├────┼─────────────────────────────┼────────────────────────────────┼────────────────────────────────────┤
│ 3  │ True Community Disease      │ True prevalence in specific    │ Requires localized epidemiological │
│    │ Prevalence ($p$)            │ study upazilas ($5.0\%$ vs     │ surveillance data; AI cannot       │
│    │                             │ $6.3\%$) cannot be mathematically│ resolve demographic and regional   │
│    │                             │ resolved from models.          │ prevalence shifts.                 │
├────┼─────────────────────────────┼────────────────────────────────┼────────────────────────────────────┤
│ 4  │ Real-World Specimen Loss &  │ Attrition ($10\%$) is an       │ Requires operational field pilot   │
│    │ Field Attrition             │ assumption; real-world monsoon │ under actual seasonal, transport,  │
│    │                             │ transit and refusal rates may  │ and infrastructure conditions in   │
│    │                             │ exceed $15\text{--}20\%$.      │ rural Bangladesh.                  │
└────┴─────────────────────────────┴────────────────────────────────┴────────────────────────────────────┘
```

---

## 7. Master Governance & Authority Matrix

This matrix establishes the non-delegable responsibility for every core trial parameter:

```
┌──────────────────────────────────┬───────────────────────┬─────────────────────────┬───────────────────┐
│ Trial Parameter / Protocol Item  │ AI System Status      │ Authoritative Human Role│ Mandatory Status  │
├──────────────────────────────────┼───────────────────────┼─────────────────────────┼───────────────────┤
│ Estimand Architecture (ICH E9)   │ Candidate formulation │ Lead Biostatistician    │ Unresolved / Open │
│ Statistical Inference Method     │ Candidate options     │ Lead Biostatistician    │ Unresolved / Open │
│ Calibration Slope Precision Goal │ Mathematical audit    │ Lead Biostatistician    │ Unresolved / Open │
│ Cluster Model & DEFF Assumption  │ Arithmetic check      │ Lead Biostatistician    │ Unresolved / Open │
│ Definitive Recruitment Target    │ Planning scenarios    │ Lead Biostatistician    │ Unresolved / Open │
│ Clinical Sensitivity Target      │ Model constraint audit│ Clinical PI             │ Unresolved / Open │
│ Primary Decision Cutoff ($\tau$) │ Exploratory caveat    │ Clinical PI             │ Unapproved / Open │
│ Emergency Hyperglycemia Referral │ Draft protocol audit  │ Clinical PI             │ Unapproved / Open │
│ Clinical Care Linkage Protocol   │ Framework check       │ Clinical PI             │ Unapproved / Open │
│ Bengali Informed Consent Form    │ Governance check      │ Clinical PI             │ Unapproved / Open │
│ Confirmatory Diagnostic Standard │ Analytical review     │ Clinical Lab Director   │ Unapproved / Open │
│ Pre-Analytical Glycolysis SOP    │ Quality check         │ Clinical Lab Director   │ Unapproved / Open │
│ Specimen Cold-Chain Time Limits  │ Audit of citations    │ Clinical Lab Director   │ Unapproved / Open │
│ ISO 15189 QA & EQAS Certification│ Requirement register  │ Clinical Lab Director   │ Unapproved / Open │
│ Ethical Trial Authorization      │ Strictly prohibited   │ IRB / BMRC              │ Not Submitted     │
│ Data Protection Compliance       │ Legal checklist       │ IRB / Legal Counsel     │ Not Submitted     │
│ Clinical Trial Registry Entry    │ Documentation check   │ Clinical PI / Sponsor   │ Not Registered    │
└──────────────────────────────────┴───────────────────────┴─────────────────────────┴───────────────────┘
```

---

## 8. Definitive Governance Statement

```
========================================================================================================
                          OFFICIAL CESSATION OF AI AUDIT ACTIVITIES:
     PHASE 06C.1.2 DOSSIER IS COMPLETE, ARITHMETICALLY RECONCILED, AND PERMANENTLY SEALED.
                   ALL FURTHER PROGRESS REQUIRES AUTHORITATIVE HUMAN SPECIALIST ACTION.
========================================================================================================
```

1. **No Further Automated Auditing:** The Phase 06C.1.2 audit sequence is formally terminated. No subsequent AI audit phase (e.g., Phase 06C.1.2.15) shall be initiated.
2. **Absolute Implementation Freeze:** Phases 06C.2 (Pilot Study), 06C.3 (Multi-Center Clinical Trial Execution), and 06D (Regulatory Submission & Clinical Deployment) remain strictly locked, gated, and blocked.
3. **Regulatory Reality:** This protocol has not been reviewed by the BMRC, has not received IRB approval, has not been registered in any trial registry, and possesses zero statutory authority to recruit human participants.

---

> [!CAUTION]
> **STATUTORY GOVERNANCE HALT**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Any attempt to recruit participants, draw biological specimens, contact clinical trial sites, modify production software, or claim institutional clearance based on this AI dossier constitutes a direct violation of medical research ethics, Good Clinical Practice (GCP), and TriNexus project covenants.
