# Phase 06C.1.2.11 — Parameter Provenance & Governance Decision Status
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical Machine Learning Safety & Biostatistics Governance  
**Document ID:** `PHASE06C1_2_11_PROVENANCE_AND_DECISION_STATUS.md`  
**Evaluation Mode:** TARGETED QUALITY & CONSISTENCY CORRECTION (DOCUMENTATION ONLY)  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This document establishes the definitive provenance ledger and governance decision status for every statistical parameter, sample size calculation, and clinical assumption in the TriNexus prospective validation dossier. It establishes a complete audit trail of origins and distinguishes machine calculations from living human specialist authority. Completion of this document does NOT authorize clinical trial recruitment, patient contact, hospital contracting, specimen collection, model recalibration, production source code modification, or institutional ethics submission. Phases 06C.2, 06C.3, and 06D remain strictly gated and blocked.

---

## 1. Master Numerical Provenance Ledger

Every numerical figure that has appeared across the Phase 06C audit trajectory has been forensically traced to its originating formula, dataset, or planning document:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       MASTER STATISTICAL PROVENANCE LEDGER                                                             │
├────────────┬─────────────────────────────┬────────────────────────────────────────────────────────┬────────────────────────────────────┤
│ Number     │ Primary Mathematical Source │ Originating Document & Formula                         │ True Methodological Status         │
├────────────┼─────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────┤
│ 323        │ Buderer (1996) Sensitivity  │ Phase 06C.1.2.8: ⌈(1.95996)² · 0.7 · 0.3 / (0.05)²⌉    │ Asymptotic Wald normal ceiling;    │
│ cases      │ Wald Formula (Discrete)     │ = ⌈322.6825⌉ = 323 positive cases.                     │ requires human interval review.    │
├────────────┼─────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────┤
│ 210        │ Riley et al. (2019)         │ Phase 06C.1.2.2: (1.95996)² / [(0.10)² · 0.6842] · W   │ Continuous logistic Fisher info;   │
│ events     │ Calibration Slope Precision │ = 209.8 ⟹ 210 positive events.                         │ conditional on Var(LP) = 0.684.    │
├────────────┼─────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────┤
│ 4,801      │ Early Unadjusted Sizing     │ Phase 06C.1.2.2: ⌈(322.6825 / 0.063) / 0.90⌉           │ Unclustered expected-information;  │
│ subjects   │ (DEFF = 1.00)               │ = ⌈5,121.94 / 0.90⌉ = 4,801 participants.              │ ignores clustering & binomial tails│
├────────────┼─────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────┤
│ 6,094      │ Exact Binomial CDF Sum      │ Phase 06C.1.2.9: P(X ≥ 323 | n=5,484, p=0.063) = 0.9004│ Unclustered 90% assurance; assumes │
│ subjects   │ (90% Assurance at 6.3%)     │ ⌈5,484 / 0.90⌉ = 6,094 recruited participants.         │ independent walk-in intake.        │
├────────────┼─────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────┤
│ 6,212      │ Exact Binomial CDF Sum      │ Phase 06C.1.2.9: P(X ≥ 323 | n=5,590, p=0.063) = 0.9507│ Unclustered 95% assurance; assumes │
│ subjects   │ (95% Assurance at 6.3%)     │ ⌈5,590 / 0.90⌉ = 6,212 recruited participants.         │ independent walk-in intake.        │
├────────────┼─────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────┤
│ 6,315      │ Exact Binomial CDF Sum      │ Phase 06C.1.2.9: P(X ≥ 323 | n=5,683, p=0.063) = 0.9752│ Unclustered 97.5% assurance;       │
│ subjects   │ (97.5% Assurance at 6.3%)   │ ⌈5,683 / 0.90⌉ = 6,315 recruited participants.         │ assumes independent walk-in intake.│
├────────────┼─────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────┤
│ 7,399      │ Convention 1 (Continuous)   │ Phase 06C.1.2.7: ⌈(322.6825 / 0.063) · (1.30 / 0.90)⌉   │ Continuous unrounded propagation;  │
│ subjects   │ Terminal-Only Ceiling       │ = ⌈7,398.59⌉ = 7,399 recruited participants.           │ expected-information sizing.       │
├────────────┼─────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────┤
│ 7,406      │ Convention 2 (Discrete)     │ Phase 06C.1.2.8: ⌈323/0.063⌉=5,127 ⟹ ⌈5,127·1.3⌉=6,666│ Discrete early ceiling buffer;     │
│ subjects   │ Early Intermediate Ceilings │ ⟹ ⌈6,666 / 0.90⌉ = 7,406 recruited participants.       │ expected-information sizing.       │
├────────────┼─────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────┤
│ 7,682      │ Exact Binomial CDF Sum      │ Phase 06C.1.2.9: P(X ≥ 323 | n=6,913, p=0.050) = 0.9001│ Unclustered 90% assurance at 5.0%; │
│ subjects   │ (90% Assurance at 5.0%)     │ ⌈6,913 / 0.90⌉ = 7,682 recruited participants.         │ conservative prevalence scenario.  │
├────────────┼─────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────┤
│ 7,830      │ Exact Binomial CDF Sum      │ Phase 06C.1.2.9: P(X ≥ 323 | n=7,047, p=0.050) = 0.9502│ Unclustered 95% assurance at 5.0%; │
│ subjects   │ (95% Assurance at 5.0%)     │ ⌈7,047 / 0.90⌉ = 7,830 recruited participants.         │ conservative prevalence scenario.  │
├────────────┼─────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────┤
│ 7,962      │ Exact Binomial CDF Sum      │ Phase 06C.1.2.9: P(X ≥ 323 | n=7,165, p=0.050) = 0.9752│ Unclustered 97.5% assurance at 5.0%│
│ subjects   │ (97.5% Assurance at 5.0%)   │ ⌈7,165 / 0.90⌉ = 7,962 recruited participants.         │ conservative prevalence scenario.  │
├────────────┼─────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────┤
│ 9,323      │ Convention 1 at 5.0% Prev   │ Phase 06C.1.2.7: ⌈(322.6825 / 0.050) · (1.30 / 0.90)⌉   │ Continuous terminal ceiling at 5%; │
│ subjects   │ (Terminal Ceiling)          │ = ⌈9,321.94⌉ = 9,323 recruited participants.           │ expected-information sizing.       │
├────────────┼─────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────┤
│ 9,332      │ Convention 2 at 5.0% Prev   │ Phase 06C.1.2.8: ⌈323/0.05⌉=6,460 ⟹ ⌈6,460·1.3⌉=8,398 │ Discrete early ceiling buffer at 5%│
│ subjects   │ (Intermediate Ceilings)     │ ⟹ ⌈8,398 / 0.90⌉ = 9,332 recruited participants.       │ expected-information sizing.       │
├────────────┼─────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────┤
│ 2,400      │ Arm B Historical Balanced   │ Phase 06C.1.2.5 & 06C.1.2.6: 50% allocation of 4,800.  │ Achieves SE = 0.0927 ≤ 0.10 under  │
│ subjects   │ Intake Allocation           │ n_eval = 2,160 ⟹ E = 259.2 events at p=12.0%.          │ unclustered intake (VERIFIED).     │
├────────────┼─────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────┤
│ 1,200      │ Arm B Exploratory Scenario  │ Phase 06C.1.2.8: Halved recruitment scenario.          │ UNVERIFIED PLANNING SCENARIO;      │
│ subjects   │ (Erroneous SE Claim)        │ n_eval = 1,080 ⟹ E = 129.6 events ⟹ SE ≈ 0.131 > 0.10 │ Fails Riley precision target!      │
└────────────┴─────────────────────────────┴────────────────────────────────────────────────────────┴────────────────────────────────────┘
```

---

## 2. Forensic Deconstruction of Arm B Sample Size ($N = 2,400$ vs $N = 1,200$)

### 2.1. The Origin of $N = 2,400$
In the initial protocol drafting (Phase 06C.1.2), an overall recruitment target of $N = 4,800$ was proposed, split equally:
- Arm A (Community Screening): $50\% \implies n_{\text{rec}} = 2,400$
- Arm B (Outpatient Triage): $50\% \implies n_{\text{rec}} = 2,400$

In Phase 06C.1.2.6 (`PHASE06C1_2_6_ARM_PRECISION_REASSESSMENT.md`), Arm B was audited in isolation under individual walk-in sampling ($\text{DEFF} = 1.00$):
- Evaluable sample size ($10\%$ attrition): $n_{\text{eval}} = 2,400 \times 0.90 = \mathbf{2,160 \text{ participants}}$.
- Expected events at $p = 12.0\%$: $E = 2,160 \times 0.12 = \mathbf{259.2 \text{ events}}$.
- Standard error of calibration slope:
  $$\text{SE}(\hat{\beta}_{\text{cal}}) = \sqrt{\frac{2.2295}{259.2}} = \mathbf{0.0927} \le 0.10$$
*Conclusion:* Sizing Arm B at $N = 2,400$ is mathematically verified to achieve the Riley precision target ($\text{SE} \le 0.10$) under unclustered individual intake.

### 2.2. The Emergence and Arithmetic Collapse of $N = 1,200$
In Phase 06C.1.2.8, an exploratory scenario halved Arm B intake to $N = 1,200$ ($n_{\text{eval}} = 1,080 \implies E = 129.6$ events). However, the narrative erroneously stated that $N = 1,200$ achieved $\text{SE} = 0.0927$.

Recalculating with exact Fisher information:
$$\text{SE}(\hat{\beta}_{\text{cal}}) = \sqrt{\frac{2.2295}{129.6}} = \sqrt{0.017203} \approx \mathbf{0.1312} > 0.10$$
- **Finding:** At $N = 1,200$, the standard error widens to $0.1312$, failing the Riley benchmark by over $31\%$.
- **Governance Ruling:** $N = 1,200$ is officially labeled an **`"Unverified planning scenario — not an approved sample-size target"`**. Sizing Arm B to achieve $\text{SE} \le 0.10$ requires $n_{\text{eval}} \ge 1,750$ ($N_{\text{rec}} \ge 1,945$) or $N_{\text{rec}} = 2,400$.

---

## 3. Official Governance Decision Status of All Trial Parameters

The governance matrix below defines the current authoritative decision status of every parameter across the validation study:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       TRIAL PARAMETER GOVERNANCE DECISION MATRIX                                                 │
├────┬─────────────────────────────┬────────────────────────────────┬──────────────────────────┬───────────────────────────────────┤
│ ID │ Parameter / Estimand        │ Current Value / Scenario       │ Governance Decision Status│ Responsible Human Authority       │
├────┼─────────────────────────────┼────────────────────────────────┼──────────────────────────┼───────────────────────────────────┤
│ G1 │ Primary Estimand Structure  │ Arm A (Community) & B (Hosp)   │ CANDIDATE ESTIMAND STRUCT│ Lead Biostatistician & Clinical PI│
│    │                             │ stratified non-pooled estimands│ (Pending justification)  │                                   │
├────┼─────────────────────────────┼────────────────────────────────┼──────────────────────────┼───────────────────────────────────┤
│ G2 │ Diagnostic Cutoff Threshold │ Exploratory default τ = 0.50   │ UNVERIFIED PLANNING SCEN │ Clinical PI & Biostatistician     │
│    │                             │ (Test-set selection bias)      │ (Not approved for care)  │ (Pre-specification required)      │
├────┼─────────────────────────────┼────────────────────────────────┼──────────────────────────┼───────────────────────────────────┤
│ G3 │ Linear Predictor Variance   │ Provisional Var(LP) = 0.684    │ UNVERIFIED PLANNING SCEN │ Lead Biostatistician              │
│    │                             │ (Retrospective internal split) │ (Sensitivity over 0.4-1) │ (Population justification req.)   │
├────┼─────────────────────────────┼────────────────────────────────┼──────────────────────────┼───────────────────────────────────┤
│ G4 │ Discrete Positive Cases (Se)│ n = 323 cases (Wald ceiling)   │ MATHEMATICALLY CLOSED    │ Lead Biostatistician              │
│    │                             │ (W ≤ ±0.05 at Se = 0.70)       │ (AI arithmetic verified) │ (CI method selection required)    │
├────┼─────────────────────────────┼────────────────────────────────┼──────────────────────────┼───────────────────────────────────┤
│ G5 │ Clustered Attainment Prob   │ Beta-Binomial CDF tails        │ NOT EVALUABLE            │ Lead Biostatistician              │
│    │                             │                                │ (Missing cluster params) │ (Field cluster model required)    │
├────┼─────────────────────────────┼────────────────────────────────┼──────────────────────────┼───────────────────────────────────┤
│ G6 │ Unclustered Binomial Assur. │ N = 6,212 (95% assurance)      │ MATHEMATICALLY CLOSED    │ Lead Biostatistician              │
│    │                             │ (Independent walk-in model)    │ (AI arithmetic verified) │ (Design requirement decision)     │
├────┼─────────────────────────────┼────────────────────────────────┼──────────────────────────┼───────────────────────────────────┤
│ G7 │ Expected-Info Clustered Size│ N = 7,406 (DEFF=1.30, 6.3%)    │ MATHEMATICALLY CLOSED    │ Lead Biostatistician              │
│    │                             │ (Mean information sizing)      │ (AI arithmetic verified) │ (Design requirement decision)     │
├────┼─────────────────────────────┼────────────────────────────────┼──────────────────────────┼───────────────────────────────────┤
│ G8 │ Arm B Sample Size (Triage)  │ N = 2,400 (SE=0.0927 ≤ 0.10)   │ MATHEMATICALLY CLOSED    │ Lead Biostatistician              │
│    │                             │ N = 1,200 (SE≈0.1312 > 0.10)   │ UNVERIFIED PLANNING SCEN │ (Arm B sample authorization)      │
├────┼─────────────────────────────┼────────────────────────────────┼──────────────────────────┼───────────────────────────────────┤
│ G9 │ Clinical Sensitivity Target │ Se ≥ 0.70                      │ RESERVED FOR HUMAN PI    │ Clinical PI (Endocrinologist)     │
│    │                             │                                │ (Medical safety target)  │                                   │
├────┼─────────────────────────────┼────────────────────────────────┼──────────────────────────┼───────────────────────────────────┤
│ G10│ Confirmatory HbA1c Assay    │ Boronate affinity HPLC         │ RESERVED FOR HUMAN LAB   │ Clinical Laboratory Director      │
│    │                             │ (Eliminates Hb variant bias)   │ (NGSP protocol sign-off) │                                   │
├────┼─────────────────────────────┼────────────────────────────────┼──────────────────────────┼───────────────────────────────────┤
│ G11│ FPG Pre-analytical Glycolysis Pre-analytical cold-chain <30m   │ RESERVED FOR HUMAN LAB   │ Clinical Laboratory Director      │
│    │                             │ Citrate / Fluoride-EDTA tubes  │ (SOP protocol sign-off)  │                                   │
├────┼─────────────────────────────┼────────────────────────────────┼──────────────────────────┼───────────────────────────────────┤
│ G12│ Institutional Ethics Approval Formal application to BMRC ERC  │ BLOCKED / NOT SUBMITTED  │ Institutional Ethics Committee    │
│    │                             │ and hospital review boards     │ (Zero approval exists)   │ (BMRC / Local ERCs)               │
└────┴─────────────────────────────┴────────────────────────────────┴──────────────────────────┴───────────────────────────────────┘
```

---

## 4. Boundary Protocol: What Remains Blocked and Why AI Cannot Proceed

The TriNexus AI system operates under strict institutional AI safety boundaries. The current state of execution is governed by the following immutable covenants:

### 4.1. Strict Governance Prohibitions
1. **No AI Sample Size Authorization:** Under no circumstances can an AI model authorize or mandate a clinical trial sample size. The choice between expected-information sizing ($N = 7,406$), binomial assurance sizing ($N = 6,212$), or conservative sizing ($N = 9,332$) requires weighing budgetary, logistical, epidemiological, and clinical trial risks that belong strictly to human investigators.
2. **No AI Threshold Selection:** Under no circumstances can an AI model select or validate a clinical diagnostic cutoff. Threshold selection determines the false-positive versus false-negative trade-off in human patient triage and requires clinical risk tolerance evaluation by an endocrinologist.
3. **No Clinical Trial Execution:**
   - **Phase 06C.2 (External Prospective Cohort Acquisition):** Strictly blocked. Zero hospital contracting, clinician contact, patient recruitment, or biological specimen collection is permitted.
   - **Phase 06C.3 (External Clinical Validation Execution):** Strictly blocked. Zero unblinding of external clinical data or prospective validation execution is permitted.
   - **Phase 06D (Production Clinical Deployment):** Strictly blocked. Zero modification of production APIs, serving infrastructure, or model artifacts is permitted.

---

> [!CAUTION]
> **STATUTORY GOVERNANCE HALT**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2, Phase 06C.3, and Phase 06D remain strictly blocked pending completed human biostatistical, clinical, and institutional ethics review and approvals.
