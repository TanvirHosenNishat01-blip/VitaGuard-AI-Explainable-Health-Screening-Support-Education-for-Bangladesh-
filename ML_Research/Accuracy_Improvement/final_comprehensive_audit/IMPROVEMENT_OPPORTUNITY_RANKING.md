# Improvement opportunity ranking

No expected accuracy gain is stated as a promise.

## 1. A new representative labeled sample, including more adults aged 21–40

- Problem: 324 positives overall and 53 training positives aged 21–40. Non-lab features rank those young rows weakly (within-band PR-AUC 0.0745).
- Evidence: age-band table in the age report.
- Proposal: a later, approved study with a pre-specified label and enough young positives.
- Expected benefit: unknown until that sample exists.
- Risk: collecting data without approval.
- Required data: new data. Not feasible on this CSV.
- Class: REQUIRES NEW DATA. Confidence: high that the current file cannot close the age gap.

## 2. Keep glucose out of this pathway

- Problem: glucose correlates 0.2978 with the training label and is entangled with the diagnosis.
- Evidence: training-split correlation. The column was excluded.
- Proposal: leave it out. A lab pathway would be a different product and needs its own design.
- Class: NOT RECOMMENDED for this pathway. Confidence: high.

## 3. Do not retune the 0.51 cutoff to chase young-adult recall

- Problem: the cutoff sits above most young positive scores.
- Evidence: median young positive score 0.3205 versus cutoff 0.51.
- Proposal: any new cutoff needs an external sample and a stated false-alarm budget. This audit does not change 0.51.
- Class: NOT RECOMMENDED as a silent production edit. Confidence: high.

## 4. Further model families on these same rows

- Problem: logistic, forests, boosting, interactions, and naive Bayes have been compared.
- Evidence: prior research plus this naive Bayes pass=False and interaction pass=False.
- Class: LOW PRIORITY. Confidence: high that another algorithm on this file will not clear a practical margin.

## 5. External check of the published models

- Problem: no site or time split exists here.
- Class: REQUIRES NEW DATA. Confidence: high.
