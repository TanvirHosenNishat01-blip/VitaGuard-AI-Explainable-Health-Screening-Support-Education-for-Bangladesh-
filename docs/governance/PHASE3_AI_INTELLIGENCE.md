# Phase 3 — AI intelligence layer

**Governance:** NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED

This layer is educational. It does not diagnose, prescribe, set a dose, or change the four screening pathways.

## Architecture

The clinical prediction code is unchanged. New read-only functions live in `backend/app/services/intelligence.py` and extend the existing project-text index in `backend/app/services/knowledge.py`.

```text
Browser pages
  /knowledge  /knowledge/graph  /explain  /fairness  admin AI governance
        |              |            |         |
        v              v            v         v
FastAPI /api/knowledge/*   /api/ai/explain   /api/ai/fairness   /api/admin/ai-governance
        |
        v
Project-authored chunks and the in-process graph
        |
        x  prediction routes, model files, patient rows, external APIs
```

Embedding models, a separate graph database, and external document downloads are not installed. Semantic embedding retrieval is **BLOCKED BY HUMAN APPROVAL**.

## RAG

Retrieval is lexical token overlap over project notes already in the repository. The overlap count is a shared-word count. It is not clinical confidence.

An answer is a concatenation of retrieved passages. If no passage shares a query word, the answer is empty and `unsupported` is true. Retrieved text is labeled untrusted. A query that asks the system to ignore instructions is flagged and is not executed.

WHO publication text and other external medical documents are not ingested. Their redistribution status stays **NOT VERIFIED**.

## Document registry

| Document | Source | License | Retrieval |
| --- | --- | --- | --- |
| Project pathway notes | `docs/governance/` and in-code knowledge chunks | Project documentation, or NOT VERIFIED where the data card says so | Lexical overlap |
| WHO chart publication | Not ingested | NOT VERIFIED | Not retrieved |
| DiaBD, Pima, Cleveland files | Described in `docs/governance/DATA_CARDS.md` | NOT VERIFIED | Not redistributed by this layer |

## Knowledge graph

Nodes and edges are the existing in-process graph, with a source path on every edge. Relations use `LIMITED_BY` for consent and clinician-review limits. There are no causal edges. There is no separate graph database.

## Explainability

`GET /api/ai/explain` repeats the existing lineage record:

| Pathway | Explanation that is actually implemented |
| --- | --- |
| DiaBD | Local TreeSHAP. Uncalibrated screening score. |
| Cleveland | Global coefficients. Not an individual SHAP explanation. |
| WHO South Asia chart | Deterministic lookup. Not a trained model. |
| Pima | Patient path remains forbidden. |

No new threshold is introduced. Artifact SHA-256 values shown for trained models are the values already stored in `ML_ARTIFACT_BASELINE.json`.

## Fairness

`GET /api/ai/fairness` copies the existing DiaBD evaluation file and labels it historical repository evidence. It does not run a new evaluation. Subgroup sensitivity, specificity, fairness gaps, and group calibration are suppressed because this module has no approved subgroup ground truth. Synthetic fairness results are not generated, so they are not mixed with the historical file.

## Governance

`GET /api/admin/ai-governance` is admin-only. It lists pathway lineage, dataset license status, document license status, and graph provenance. An admin view is not a BMRC, DGHS, or clinical approval.

## Dependencies

No new package was installed.
