# Phase 06C.1 — Phase Gates & Human Approval Criteria
**TriNexus | VitaGuard AI — Clinical Machine Learning Division**  
**Document Date:** November 10, 2026  
**Auditor & Governance Specialist:** Lead Systems Auditor & Clinical AI Safety Director  
**Specification:** Mandatory Objective Criteria for Phase 06C.2 and Phase 06C.3 Entry  
**Status:** **LOCKED GOVERNANCE GATE SPECIFICATION**

---

## 1. Governance Architecture & Multi-Stage Gates

To ensure strict compliance with clinical AI safety regulations and human-in-the-loop oversight, the progression from protocol planning to prospective execution is divided into two sequential, gated phases:

```
    PHASE 06C.1 (Current)
    Protocol & Governance Design
               │
               ▼
    ┌─────────────────────────────┐
    │     APPROVAL GATE 06C.2     │ ──> Requires Ethics Approval, MoUs, & DUAs
    └─────────────────────────────┘
               │
               ▼
    PHASE 06C.2 (Future)
    Data Collection & Quality Audit
               │
               ▼
    ┌─────────────────────────────┐
    │     APPROVAL GATE 06C.3     │ ──> Requires 10/10 Dataset Acceptance Gates
    └─────────────────────────────┘
               │
               ▼
    PHASE 06C.3 (Future)
    Independent Statistical Scoring
```

> [!CAUTION]
> **GATE BYPASS PROHIBITION:**  
> Neither Approval Gate 06C.2 nor Approval Gate 06C.3 may be bypassed, waived, or conditionally overridden by an automated system.  
> Progression across each gate requires **explicit, written human sign-off**.

---

## 2. Objective Entry Criteria for Phase 06C.2: Dataset Collection & Ingestion

Phase 06C.2 (Prospective Clinical Recruitment and Quality Ingestion) cannot begin until all five conditions below are satisfied:

| Gate Criterion ID | Required Milestone | Verification Evidence Required | Responsible Sign-Off Authority |
| :--- | :--- | :--- | :--- |
| **GATE-06C2-01** | **Approved Protocol Package** | Finalization and human approval of `PHASE06C1_EXTERNAL_COHORT_ACQUISITION_PROTOCOL.md` and Data Dictionary. | Lead Clinical Research Methodologist |
| **GATE-06C2-02** | **BMRC & ERC Ethics Approval** | Formal written approval letter from the Bangladesh Medical Research Council (BMRC) National Ethics Review Committee and partner institutional ERCs. | Institutional Ethics Officer |
| **GATE-06C2-03** | **Authorized Institutional Agreements** | Bilateral executed Memoranda of Understanding (MoU), Data Use Agreements (DUA), and Material Transfer Agreements (MTA) with participating health centers and reference laboratory. | Legal & Clinical Partnerships Director |
| **GATE-06C2-04** | **Documented Provenance Manifest** | Detailed site assessment audit verifying equipment calibration, backup power, and certified enzymatic testing facilities. | Site Quality Assurance Lead |
| **GATE-06C2-05** | **Secure Data Ingestion Pipeline** | Technical verification of AES-256 encrypted database schema, double-entry validation scripts, and air-gapped pseudonymization key storage. | Lead Cybersecurity & Data Governance Engineer |

---

## 3. Objective Entry Criteria for Phase 06C.3: Independent Statistical Validation

Phase 06C.3 (Unblinding and Statistical Evaluation) cannot begin until all seven conditions below are satisfied:

| Gate Criterion ID | Required Milestone | Verification Evidence Required | Responsible Sign-Off Authority |
| :--- | :--- | :--- | :--- |
| **GATE-06C3-01** | **Dataset Acceptance Sign-Off** | Formal verification that the collected cohort has passed all 10 gates in `PHASE06C1_DATASET_ACCEPTANCE_CHECKLIST.md` ($100\%$ pass). | Independent Biostatistical Auditor |
| **GATE-06C3-02** | **Pre-Registered Analysis Plan (SAP)** | Pre-registration and locking of the Statistical Analysis Plan (SAP) defining primary endpoints, subgroup strata, and bootstrap methodology before unblinding outcomes. | Principal Biostatistician |
| **GATE-06C3-03** | **Locked Model & Calibrator Checksums** | SHA-256 checksum verification confirming that candidate model weights and Platt calibrator parameters match the frozen Phase 06B baseline. | Lead ML Safety Engineer |
| **GATE-06C3-04** | **Locked Validation Protocol** | Confirmation that evaluation benchmarks strictly follow `PHASE06C_VALIDATION_PROTOCOL.md`. | Clinical AI Governance Auditor |
| **GATE-06C3-05** | **Adjudicated Reference Standards** | Complete laboratory FPG and venous HPLC HbA1c adjudication on file for all cohort records. | Central Reference Laboratory Director |
| **GATE-06C3-06** | **Independent Audit Trail** | Timestamped git commit hashes and cryptographic run logs capturing the environment state. | Systems Auditor |
| **GATE-06C3-07** | **Ban on Test Threshold Selection** | Explicit binding attestation that decision thresholds evaluated on the validation cohort are pre-specified and will NOT be tuned post-hoc. | Principal Investigator |

---

## 4. Escalation & Dispute Resolution Protocol

1. **Protocol Amendments:** Any proposed modification to inclusion/exclusion criteria or sample size calculations requires a formal protocol amendment submitted to and approved by BMRC prior to implementation.
2. **Quality Discrepancies:** If inter-laboratory split-sample concordance falls below $95\%$ ($\text{ICC} < 0.95$), recruitment must be halted immediately until equipment is recalibrated.
3. **Regulatory Non-Compliance:** Any breach of informed consent or data security triggers immediate study suspension and notification to governing ethics committees.

---

## 5. Governance Lock Attestation

This phase gate framework is locked. Progression to Phase 06C.2 remains frozen until explicit human authorization is recorded.
