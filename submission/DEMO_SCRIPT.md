# Demo script

**Length:** about 6 minutes  
**Governance line to say aloud:** NOT SUBMITTED. NOT APPROVED. NO RECRUITMENT AUTHORIZED.

Do not sign in during this script. Do not open the live blood list. Do not read a password.

## 0:00 Opening

Open `http://127.0.0.1:5173/presentation`.

Say that VitaGuard is a screening-support and education workspace. A score is not a diagnosis and not a prescription. Switch once between English and Bangla to show the same limits.

## 1:00 Four pathways

Stay on the introduction. Name the four tools and keep them separate:

- DiaBD is an uncalibrated screening index with local TreeSHAP. Say the locked-test precision 0.1159, 290 false positives, 27 false negatives, and cutoff 0.51. Do not describe the sampling frame as verified. The CSV has no site column.
- Pima stays open with consent for guests and patients. Say the cohort: historical Phoenix-area women, ages 21–81. It is not a diagnosis and not a Bangladesh model. Do not cite 87.66 percent. If a research number is needed, the leakage-free logistic out-of-fold PR-AUC is 0.7166 and the Brier score is 0.1627.
- Cleveland is a 1984 catheterization cohort, not community screening.
- The WHO South Asia chart is a lookup, not a trained model.

## 2:15 Knowledge

Open `/knowledge`. Ask: “What does screening mean, and how is it different from diagnosis?”

Show the project-document citation and the license note. Say the overlap count is a shared-word count, not clinical confidence. If the API process is current and the question has no source, the page says so instead of inventing an answer.

## 3:15 Graph

Open `/knowledge/graph`. Select a node. Show the category and the source. Say there is no causal medical arrow.

## 4:00 Explainability and fairness

Open `/explain`, then `/fairness`, after the API has been started from the current code.

Say DiaBD contributions are not causes, Cleveland coefficients are not an individual explanation, and the fairness page does not invent subgroup results.

## 5:00 Roles, without logging in

Open `/app`, then `/demo-doctor` and `/demo-admin`.

Say a doctor sees a chart only after a confirmed appointment or that doctor’s own guideline. An administrator review of a typed registration number is not a government seal. There is no demo password on these pages.

## 6:00 Close

Return to `/presentation`. Repeat the governance line. Say encryption is not implemented, public deployment is not approved, and the nine model files were checked by hash rather than replaced.

The slide version of this story is `/pitchdeck` and `docs/presentation/TriNexus_VitaGuard_AIBC_2026.pptx`. The deck has 17 slides. The business, scale, and score-band slides are plans or limits, not operating results.
