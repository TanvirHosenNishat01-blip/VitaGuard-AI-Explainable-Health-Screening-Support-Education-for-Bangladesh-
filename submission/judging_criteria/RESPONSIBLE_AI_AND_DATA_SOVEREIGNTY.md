# Responsible AI and data sovereignty

**Component:** 5 of 5, 20 points  
**Governance:** NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED

## Framework in force

1. Say which pathway produced a number.
2. Say what that pathway is not.
3. Do not invent an explanation the implementation does not compute.
4. Do not mix historical file metrics, synthetic checks, and clinical validation.
5. Do not retrieve patient rows into the educational index.
6. Treat retrieved text as untrusted data.
7. Keep an administrator’s review from being described as a government approval.

## Explainability evidence

| Pathway | What the screen is allowed to say |
| --- | --- |
| DiaBD | Local TreeSHAP contributions. Not causes. Not a calibrated personal probability. The sampling frame is not independently verified. |
| Cleveland | Global coefficients. Not an individual explanation. |
| WHO chart | The lookup rule, including the age band and the prior-event stop. |
| Pima | The existing model output, with the Phoenix-area cohort limit on screen. Consented access is open. Not a diagnosis. The 87.66 percent claim is invalid. |

The explainability page reads `GET /api/ai/explain`, which repeats `pathway_lineage` and the SHA-256 values already stored for trained artifacts.

## Bias and fairness

`GET /api/ai/fairness` copies `ML_Model/evaluation/bd_diabetes_metrics.json` and labels it historical repository evidence. It suppresses subgroup sensitivity, specificity, fairness gaps, and group calibration because no approved subgroup ground truth is available. That is a refusal, not a finished bias audit.

A real fairness evaluation would need an approved attribute list, a sample-size rule, and a dataset license. None of those steps is claimed as done.

## Privacy and ownership

- Screening consent records pathway, version `2026-11-19.screening.v1`, language, and time. Measurements are not stored on the consent row.
- Withdrawal blocks the next estimate until a new agreement.
- Deletion is `POST /api/patient/deletion-request` and requires the username. `DELETE /api/patient/my-data` does not delete.
- The deletion note does not promise complete erasure. Database-file backups remain. Older audit text is redacted.
- A doctor does not receive the patient email.
- Message audits store a thread id and a character count, not the body.
- Field encryption is not implemented. Data sovereignty is therefore a policy and an access rule, not a cryptographic guarantee.

## Licensing and approval

DiaBD, Pima, Cleveland, and WHO chart redistribution are **NOT VERIFIED** in `docs/governance/DATA_CARDS.md`. WHO publication text was not ingested.

The project is not submitted for ethics or regulatory approval. No recruitment is authorized. An administrator screen is not a clinical or regulatory approval.

## Demonstration boundary

Public briefing pages do not sign in. There is no isolated demo account that is guaranteed not to write `vitaguard.db`. The blood list on the live database is not used as the competition demonstration, because those rows are not proven synthetic.
