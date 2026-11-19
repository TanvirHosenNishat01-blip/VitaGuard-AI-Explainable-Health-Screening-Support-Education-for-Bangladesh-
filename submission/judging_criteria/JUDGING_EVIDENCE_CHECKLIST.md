# Judging evidence checklist

**Governance:** NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED

## Evidence that exists

| Claim | Location |
| --- | --- |
| Four pathways and their limits | `backend/app/services/lineage.py`, `submission/AI_METHODOLOGY_AND_LIMITATIONS.md` |
| DiaBD TreeSHAP and uncalibrated status | `backend/app/services/bd_diabetes_service.py` |
| Pima with a stated cohort limit | Consented `POST /api/predict` returns 200. Phase E expects `patient_access: allowed_with_stated_limits`. The 87.66 percent file is not shown as accuracy. |
| WHO lookup, not a trained model | `backend/app/services/bd_cvd_chart.py` |
| Lexical knowledge search and empty answers | `backend/app/services/knowledge.py`, `backend/tests/test_phase_e_intelligence.py` |
| Graph sources and no causal flag | `GET /api/knowledge/graph` |
| Fairness suppressions | `backend/app/services/intelligence.py` |
| Nine artifact hashes | `ML_Research/Competition_Readiness/ML_ARTIFACT_BASELINE.json` and Phase F |
| Test counts 14, 6, 7, 4, 7, 4 and a passing frontend build | `submission/FINAL_READINESS_REPORT.md` |
| Consent, deletion limits, doctor access | `docs/governance/DATA_RETENTION_AND_DELETION.md`, `backend/app/services/care_access.py` |
| Licenses NOT VERIFIED | `docs/governance/DATA_CARDS.md` |
| DiaBD sampling frame unverified | The CSV has no site column. The metrics file and an older inventory disagree. Dataset sampling frame and site-level provenance have not been independently verified from the available source documentation. |
| Pima leakage-free research result | Out-of-fold PR-AUC 0.7166 and Brier score 0.1627. Not the invalid 87.66 percent file. |
| No partnership claim | `PHASE06C1_INSTITUTIONAL_COLLABORATION_FRAMEWORK.md` |
| Pitch | `docs/presentation/TriNexus_VitaGuard_AIBC_2026.pptx` and `/pitchdeck` |
| Judging notes | `submission/judging_criteria/` |

## Demonstration to record if a screenshot is required

1. `/presentation` with the governance line visible.
2. `/knowledge` after the screening-versus-diagnosis question, showing a citation.
3. `/knowledge/graph` with one node open.
4. `/explain` after the API is restarted onto current code. Until then this page can show Not Found.
5. `/fairness` with the suppressed-metric list, same restart condition.
6. `/pitchdeck` on the business slide and the scale slide, so a judge sees the word “proposal”.

Do not screenshot a signed-in dashboard unless the account is synthetic and the database write is acceptable. This pass did not create that account.

## Claims that must not be made

- Clinical validation, BMRC approval, DGHS approval, or ethics approval.
- A verified DiaBD sampling frame, hospital catchment, or national sample.
- That 87.66 percent is a valid Pima accuracy.
- A hospital, university, NRB, or commercial partnership.
- User counts, revenue, market size, cost savings, or jobs created.
- That the fairness page completed a bias audit.
- That retrieval is an embedding model or a clinically validated answer.
- That deletion erases backups.
- That administrator review is a government credential check.
- That the nine research and production files were retrained for this submission.
