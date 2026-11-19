# Judging criteria matrix

**Project:** TriNexus | VitaGuard AI  
**Competition:** AIBC 2026, HealthSphere AI → PredictRx  
**Total:** 100 points. Five components, 20 points each.  
**Governance:** NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED

Projects are scored on this rubric alone, not against other teams. This file does not award a score. It places the existing evidence against the official bands.

## Official bands

| Points of 20 | Official meaning |
| --- | --- |
| 0–5 | Incremental, common, or weak. Limited AI or unclear value. |
| 6–10 | Moderately differentiated. Functional, with limited depth or validation. |
| 11–15 | Strong. Well-structured AI-native design with clear relevance and outcomes. |
| 16–20 | Breakthrough. Globally competitive, production-grade, with documented safeguards. |

The 16–20 band requires a production-grade system. VitaGuard is a tested local prototype. None of the five components meets that band.

## Where the evidence sits

| Component | Evidence that is real | Band the evidence can support | Why it is not 16–20 |
| --- | --- | --- | --- |
| Innovation and AI-native design | Four pathways stay separate. DiaBD uses local TreeSHAP. Empty knowledge questions stay empty. The graph has sources and no causal edges. | 6–10. A judge who weighs the pathway split heavily could argue the low end of 11–15. | The models already existed. Retrieval is word overlap, not a new intelligence core. No measured outcome. |
| Technical excellence and architecture | React 18, Vite 5, FastAPI, SQLite, JWT, bcrypt, admin authenticator, role rules. Separate-process tests: 14, 6, 7, 4, 7, and 4 passed. Frontend build exited 0. Nine artifact hashes match. | 6–10. Local tests are real. Depth is the explainability and access rules, not a deployed platform. | No encryption, no rate limit, no frontend unit tests, SQLite on one machine. The API process on port 8000 can be stale until restarted. |
| Business value and commercial viability | A written value: fewer ways to misread a score. A later institutional license is described as a proposal. | 0–5. The rubric asks for measurable economic value, and none has been measured. | No customers, price, revenue, or cost study. Clinical sale is blocked. |
| Global scalability and real-world impact | Bangla and English catalogs match at 266 keys. DiaBD and the WHO chart are scoped, not presented as universal. | 0–5 on scale and impact. Localization is a start, not evidence of millions of users. | No deployment, load test, jobs, exports, or measured health effect. |
| Responsible AI, data sovereignty, and presentation | Consent, limited deletion, doctor access rule, suppressed subgroup metrics, licenses marked NOT VERIFIED, briefing pages. | 6–10. Disclosure and safeguards are documented. A fairness program and cryptographic ownership are not. | No completed bias audit. Encryption is absent, so sovereignty is a policy, not a technical guarantee. No regulatory approval. |

NRB or global collaboration is a qualitative advantage inside technical excellence and scalability. None is recorded, so that advantage is not available. See `NRB_GLOBAL_COLLABORATION.md`.

## Evidence a judge can open

- Public pages: `http://127.0.0.1:5173/presentation`, `/knowledge`, `/knowledge/graph`, `/explain`, `/fairness`, `/pitchdeck`
- Pitch file: `docs/presentation/TriNexus_VitaGuard_AIBC_2026.pptx`
- Hash baseline: `ML_Research/Competition_Readiness/ML_ARTIFACT_BASELINE.json`
- Dataset cards: `docs/governance/DATA_CARDS.md`
- Test files: `backend/tests/test_phase_a_security.py` through `test_phase_f_readiness.py`

## What would be required to move a band

These are not implemented, and they are not claimed.

- 11–15 on business or scale would need measured outcomes. Inventing them would violate the rubric.
- 16–20 would need a production deployment, operations, encryption, and evidence of scale. That work stays blocked until a person approves it.
