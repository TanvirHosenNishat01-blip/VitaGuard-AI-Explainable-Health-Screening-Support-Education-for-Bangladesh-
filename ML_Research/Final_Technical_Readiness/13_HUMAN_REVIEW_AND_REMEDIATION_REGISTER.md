# TriNexus | VitaGuard AI — Human Review and Remediation Register
**Project:** TriNexus | VitaGuard AI  
**Division:** Engineering Remediation Planning & Multi-Disciplinary Governance  
**Document ID:** `13_HUMAN_REVIEW_AND_REMEDIATION_REGISTER.md`  
**Execution Standard:** Prioritized Engineering Action Plan & Human Authority Gates  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **GOVERNANCE BOUNDARY & REMEDIATION RULE**  
> In accordance with Phase 06 governance rules, **no production source code, model weights, database schemas, or package dependencies have been modified**. This document establishes the binding remediation roadmap requiring independent qualified human specialist sign-offs.  
> **Status:** NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.

---

## 1. Remediation Sequencing & Priority Hierarchy

Remediations are categorized into three mandatory priority tiers:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        PRIORITIZED ENGINEERING REMEDIATION ROADMAP                                     │
│                                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ TIER P0 — CRITICAL BLOCKERS FOR ANY TECHNICAL DEMONSTRATION OR LOCAL TESTING                     │  │
│  │ 1. Inject SECRET_KEY from environment; purge hardcoded key from auth.py                          │  │
│  │ 2. Patch Admin TOTP verification to strictly abort if totp_secret is NULL                         │  │
│  │ 3. Restrict CORS to explicit whitelisted frontend origins (remove allow_origins=["*"])           │  │
│  │ 4. Add *.db and vitaguard.db to .gitignore to prevent accidental database commits                 │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                   │                                                    │
│                                                   ▼                                                    │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ TIER P1 — ESSENTIAL PRE-REQUISITES FOR PILOT CLINICAL SOFTWARE EVALUATION                        │  │
│  │ 5. Scope /doctor/records strictly to assigned patients with active appointments or review requests │  │
│  │ 6. Standardize backend entrypoint on app.main:app and update README.md documentation             │  │
│  │ 7. Implement rate-limiting middleware (slowapi) on login, register, and prediction endpoints      │  │
│  │ 8. Remove non-ASCII Unicode emojis from stdout in model_service.py to prevent Windows crashes    │  │
│  │ 9. Enable SQLite Write-Ahead Logging (PRAGMA journal_mode=WAL) and foreign key enforcement        │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                   │                                                    │
│                                                   ▼                                                    │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ TIER P2 — PRE-CLINICAL TRIAL & REGULATORY SUBMISSION REQUIREMENTS                                │  │
│  │ 10. Upgrade vulnerable frontend npm dependencies (follow-redirects, react-router-dom)             │  │
│  │ 11. Implement encrypted field-level storage for sensitive patient PII (DSA 2018 compliance)      │  │
│  │ 12. Build containerized Docker deployment manifests with automated daily backup routines         │  │
│  │ 13. Formal Clinical PI authorization of emergency referral triggers and clinical thresholds      │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Multi-Disciplinary Human Review Sign-Off Gates

The following specific determinations must be resolved and signed off by qualified human authorities prior to advancing beyond technical research:

```
┌───────────────────────────┬───────────────────────────────────┬────────────────────────────────────────────────────────┐
│ Human Specialist Role     │ Designated Authority Scope        │ Specific Mandatory Decisions Required                 │
├───────────────────────────┼───────────────────────────────────┼────────────────────────────────────────────────────────┤
│ **Security & DevOps Lead**│ System Security & Infrastructure  │ 1. Sign off on environment variable secret injection.  │
│                           │                                   │ 2. Certify CORS origin whitelisting.                   │
│                           │                                   │ 3. Review TOTP 2FA replay protections and rate limits. │
├───────────────────────────┼───────────────────────────────────┼────────────────────────────────────────────────────────┤
│ **Clinical PI**           │ Medical Safety & Ethics           │ 4. Authorize doctor-patient scoping for medical records│
│                           │                                   │ 5. Validate clinical cutoff thresholds.                │
│                           │                                   │ 6. Approve emergency triage and referral SOPs.         │
├───────────────────────────┼───────────────────────────────────┼────────────────────────────────────────────────────────┤
│ **Lead Biostatistician**  │ Clinical Prediction Methodology   │ 7. Review prospective calibration slope standards.     │
│                           │                                   │ 8. Approve candidate two-arm estimand trial sizing.    │
├───────────────────────────┼───────────────────────────────────┼────────────────────────────────────────────────────────┤
│ **Clinical Lab Director** │ Assay & Reference Standards       │ 9. Authorize NGSP boronate HPLC HbA1c standards.       │
│                           │                                   │ 10. Certify blood sample cold-chain SOPs.              │
├───────────────────────────┼───────────────────────────────────┼────────────────────────────────────────────────────────┤
│ **Qualified Legal Counsel**│ Regulatory Compliance (DSA 2018) │ 11. Certify domestic health data sovereignty in BD.    │
│                           │                                   │ 12. Determine DGDA SaMD statutory classification.      │
├───────────────────────────┼───────────────────────────────────┼────────────────────────────────────────────────────────┤
│ **Institutional IRB/BMRC**│ Ethical Protocol Clearance        │ 13. Grant full board institutional ethical clearance.  │
│                           │                                   │ 14. Authorize trial registration in WHO primary registry│
└───────────────────────────┴───────────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 3. Definitive Technical Governance Statement

Automated AI auditing formally ceases with this report. The TriNexus | VitaGuard AI codebase remains strictly contained in research mode.

> [!CAUTION]
> **STATUTORY GOVERNANCE HALT**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2 (Pilot Study), Phase 06C.3 (Clinical Trial Execution), and Phase 06D (Clinical Diagnostic Deployment) remain strictly locked, gated, and blocked until all Tier P0 and P1 remediations are independently executed, verified, and signed off by qualified human specialists.
