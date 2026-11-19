# Innovation and AI-native design

**Component:** 1 of 5, 20 points  
**Governance:** NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED

## Innovation statement

VitaGuard AI treats a screening number as something that must carry its source, its limit, and a human review. The product does not try to make one model answer every question. It keeps four tools separate and puts explanation next to the score.

## The problem

People can mistake a statistical screen for a diagnosis when the dataset, the method, and the refusal cases are hidden.

## What is different from a conventional health app

A conventional app often shows one risk percentage and a call to action. This build does four narrower things:

1. Bangladesh DiaBD returns an uncalibrated screening index and local TreeSHAP. The status string is `uncalibrated_high_sensitivity_screening`. A feature contribution is not presented as a cause.
2. The Pima patient path returns 403. The dataset is a Native American community cohort and is not offered as a Bangladesh model.
3. Cleveland is labeled as a 1984 catheterization cohort. The screen uses global coefficients, not an individual SHAP story.
4. The WHO South Asia chart is a deterministic lookup for ages 40–74. A prior heart attack or stroke stops the lookup. It is not described as a trained model.

Knowledge search is also separate from prediction. It quotes project notes. If the notes do not contain the question, the answer is empty. The overlap count is labeled as a shared-word count, not clinical confidence.

## How the roles fit

A patient can request a visit and read educational pages. A doctor sees a chart only after a confirmed appointment or a guideline that doctor already wrote. An administrator can review a typed registration number. That review is not an independent medical-council check. The three roles share one access rule instead of a shared clinical record with no boundary.

## Strongest highlights

1. Pathway separation is enforced in code and in the explainability page, not only in a slide.
2. DiaBD explanation reuses the existing TreeSHAP explainer. Other pathways are not given invented SHAP values.
3. Unsupported educational questions fail closed.
4. The knowledge graph records `LIMITED_BY` style links and sets `causal_claims` to false.
5. Fairness metrics that lack subgroup ground truth are suppressed instead of displayed.

## Implemented versus experimental

| Implemented | Experimental or absent |
| --- | --- |
| Lexical retrieval over project notes | Embedding or generative medical answers |
| In-process graph of project concepts | A clinical ontology or a separate graph database |
| Local TreeSHAP for DiaBD | Individual explanations for Cleveland, WHO, or Pima patients |
| Historical DiaBD evaluation file, shown as historical | A new fairness study or clinical validation |

Evidence: `backend/app/services/knowledge.py`, `backend/app/services/intelligence.py`, `backend/app/services/lineage.py`, `frontend/src/pages/ExplainCenter.jsx`, `frontend/src/pages/FairnessDashboard.jsx`.
