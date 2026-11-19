# Judges’ talking points

**Governance line:** NOT SUBMITTED. NOT APPROVED. NO RECRUITMENT AUTHORIZED.

## Opening

“VitaGuard is a local screening-support workspace. Its main idea is that a score should show its source and its limit. It is not a diagnosis, not a prescription, and not an approved clinical service.”

## 1. Innovation, 20 points

“We did not build one universal risk engine. Four tools stay separate. DiaBD has local TreeSHAP, is uncalibrated, and its locked test precision is 0.1159 with 290 false positives and 27 false negatives. Pima stays open with a cohort limit, and we do not cite the leaked 87.66 percent file. Cleveland is a historical cohort, and 91.7 percent is 55 of 60 locked-test rows. The WHO chart is a lookup, not a trained model. No experiment replaced a production model. If our knowledge notes do not contain an answer, the page stays empty.”

Do not say the DiaBD sampling frame is verified. Dataset sampling frame and site-level provenance have not been independently verified from the available source documentation. If asked for the Pima research number, say leakage-free logistic out-of-fold PR-AUC 0.7166 and Brier score 0.1627, and say 87.66 percent is invalid.

Show `/explain` and `/knowledge`.

## 2. Technical excellence, 20 points

“The browser is React and Vite. The API is FastAPI. The database is SQLite. Doctors open a chart only after a confirmed visit or their own guideline. Six test suites passed separately: 14, 6, 7, 4, 7, and 4. The frontend production build exits 0. Nine model files match their recorded hashes. Encryption and a production deployment are not in this build.”

## 3. Business value, 20 points

“The present value is fewer ways to misread a score. A paid institutional license is a later idea. We have no customers, no revenue, and no savings number. A clinical sale is blocked until approval exists.”

## 4. Scale and impact, 20 points

“Bangla and English are both in the interface, 266 keys each. The app runs on one machine. We do not claim millions of users, jobs, or a measured health effect. A larger deployment needs another database, operations, and legal review.”

## 5. Responsible AI, 20 points

“Subgroup fairness numbers are hidden because we do not have an approved subgroup table. Dataset redistribution is NOT VERIFIED. Consent and a username-confirmed deletion request exist. Deletion does not promise that backups disappear. No ethics board and no ministry has approved this.”

## Closing

“Please score this as a tested local prototype. The 16-to-20 band means production-grade, and we are not asking for that band. The pitch file has 17 slides. The business, scale, and score-band slides are limits, not results.”

## If a judge asks for a number

Do not offer a total. Say which band the evidence can support:

- Innovation and technical work: 6–10, because they function and are tested, and they are not production-grade.
- Business value and global scale: 0–5, because the economic and scale results the rubric asks for have not been measured.
- Responsible AI: 6–10, because the safeguards and the refusals are written down, and encryption and a finished fairness audit are not.

## Do not say

- We are clinically validated.
- We have a hospital partner or an NRB partnership.
- We reduced cost by any percentage.
- The fairness page proves the model is fair.
- RAG output is a medical guideline.
