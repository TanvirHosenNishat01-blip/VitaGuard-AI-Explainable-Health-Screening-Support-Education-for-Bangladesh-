# Preliminary submission summary

**Project:** TriNexus | VitaGuard AI  
**Competition:** AIBC 2026, HealthSphere AI → PredictRx  
**Governance:** NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED

## Executive summary

VitaGuard AI is a local workspace for screening support and health education. It keeps four different tools separate, shows where each number comes from, and states what the number cannot decide. It is not a diagnosis, a prescription, or an approved clinical service.

## What is distinctive

The product treats explanation and limits as part of the screen. DiaBD shows local TreeSHAP and an uncalibrated index. Cleveland is labeled as a historical cohort. The WHO chart is labeled as a lookup. Pima stays closed to patients. Knowledge answers are quoted project passages, or they are left empty.

## What is implemented

- Three role workspaces with server-side access rules.
- Consent, withdrawal, and a username-confirmed deletion request that does not promise complete erasure.
- Appointment lifecycle and a simulated blood workflow.
- Educational search, a sourced knowledge graph, an explainability page, a fairness page that suppresses unsupported subgroup metrics, and an administrator AI registry.
- A competition briefing and a 17-slide pitch file. The business, scale, and score-band slides are proposals or limits, not operating results.

## Tests verified in this pass

Each suite was run alone.

| Suite | Result |
| --- | --- |
| Phase A security | 14 OK |
| Phase B privacy | 6 OK |
| Phase C platform | 7 OK |
| Phase D coordination | 4 OK |
| Phase E intelligence | 7 OK |
| Phase F hashes and recorded DiaBD profiles | 4 OK |
| Frontend `npm run build` | Exit 0 |

There is no frontend unit-test suite.

## Known limits

- No regulatory approval and no claim of clinical effectiveness.
- External dataset licenses remain **NOT VERIFIED**.
- Encryption, login rate limiting, and embedding retrieval are not implemented.
- Phase 2 tables are not applied on `vitaguard.db`.
- The API process that was already listening on port 8000 predates the newer routes. A fresh start is required before `/explain` and `/fairness` answer from that process.
- Signed-in browser journeys were not exercised in this pass, because login writes the local database.
- `npm audit` still reports Vite and React Router advisories. Major upgrades were not applied.

## Later work, only with approval

Verified licenses for external text, encryption, a truly isolated demo database, and any clinical study. None of that is part of this submission.
