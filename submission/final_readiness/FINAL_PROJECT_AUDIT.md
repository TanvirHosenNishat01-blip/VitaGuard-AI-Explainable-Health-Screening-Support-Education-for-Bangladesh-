# Final project audit — TriNexus | VitaGuard AI

Date: 2026-11-19. Branch: `competition-readiness`. This pass did not commit or push.

Governance status used on the homepage and briefing:

**NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED**

This is a project status, not an institutional approval.

## 1. Executive summary

The guest-facing navigation loads, the four assessment pathways stay separate, and the Model Evaluation page now shows the latest verified research numbers instead of the leaked Pima accuracy. Production model files, the DiaBD cutoff 0.51, prediction code, and `backend/vitaguard.db` were not modified.

A stale local API process was still serving an older evaluation payload that labeled Pima’s invalid 87.66% result as the DiaBD card. The current source already read `bd_diabetes_metrics.json`. Restarting the local API on 127.0.0.1:8000 made the live card match that source: cutoff 0.51, accuracy 0.6904, precision 0.1159, recall 0.5846, 290 false positives, 27 false negatives.

Preliminary submission status: **ready with disclosed limitations**. Sampling-frame provenance is still unverified, there is no clinical validation, and signed-in doctor and patient journeys were not clicked in the browser during this pass. Backend role and consent tests on an isolated database did pass.

## 2. Navigation audit

Guest labels were checked in English and Bangla. Active state followed the open route. `/doctors` is not in the guest bar; opening it while signed out redirects to `/login`.

| Item | Route | Status | What was checked |
| --- | --- | --- | --- |
| Assessment | `/assessment` | FIXED | Four cards show what each pathway offers, then the limitations. CTAs reach `/bangladesh`, `/predict/diabetes`, and `/predict/cardio`. WHO uses the same Bangladesh screen as DiaBD because that page already hosts both tools. |
| Bangladesh | `/bangladesh` | PASS | DiaBD form and WHO chart form both render. Submit stays disabled until the screening-consent checkbox is used. The page states the estimate is not saved and is not a diagnosis. |
| Blood Network | `/blood` | PASS | Labeled as a simulation. After load, the synthetic-donor count was 3 and requests were 0. API `recruitment_authorized` is false. |
| Health Notice | `/notices` | WARNING | Page and Bangla/English label load. The public list is empty. No separate “no notices yet” sentence was seen. |
| Model Evaluation | `/evaluation` | FIXED | Research conclusion, four pathways, and live DiaBD/Cleveland cards were read in English and Bangla after the API restart. |
| Awareness | `/awareness` | PASS | Route loads a long educational page. Every paragraph was not re-read line by line. |
| Knowledge Hub | `/knowledge` | PASS | Educational notes load, including the note that a screening score is not a diagnosis and that Pima is not women’s clinical care. |
| Hospitals | `/hospitals` | PASS | Directory loads after a short loading state. Cards say address, phone, and specialty are not verified. Thana and area filters stay on “not verified”. |
| Briefing | `/presentation` | PASS | Shows the exact governance line and says there is no BMRC or DGHS approval, no hospital deployment, and no clinical-effectiveness claim. |
| Sign in / account | `/login`, `/register` | PASS | Login renders patient and doctor choices. The page says any email can register, and Google sign-in works only for accounts added in Google Cloud. |
| Doctors | `/doctors` | PASS for guests; NOT TESTED signed in | Guests are sent to login. A signed-in doctor directory was not opened. |

Mobile width 390: the assessment cards stay readable, and the menu button opens the same guest destinations plus sign-in and account creation. A tablet width was not checked.

## 3. Page-by-page content consistency

| Topic | Status | Finding |
| --- | --- | --- |
| DiaBD locked test | FIXED | Evaluation card and assessment limitations agree: precision 0.1159, 290 false positives, 27 false negatives, cutoff 0.51, accuracy about 69.0% on 1,024 rows. |
| Age 21–40 recall | FIXED | Stated as training out-of-fold recall about 0.3208, not a locked-test subgroup. |
| Sampling frame | WARNING | The page says a published article mentions 63 unions, the CSV has no site column, and site-level provenance has not been independently verified. That conflict is disclosed, not resolved. |
| Pima 87.66% | FIXED | Called invalid because of label leakage. Leakage-free logistic OOF PR-AUC 0.7166 and Brier 0.1627 are shown as research-fold numbers, not clinical validation. The patient form at `/predict/diabetes` is open and asks for consent. |
| Cleveland | PASS | 60-row locked test, accuracy 0.9167, matrix 32 / 0 / 5 / 23. The page says this is not community screening. |
| WHO chart | PASS | Ages 40–74, lookup rather than a trained model, 700/700 described as table consistency, ages 39 and 75 out of range. |
| Governance | PASS | Homepage English uses the exact status sentence and says it is not an institutional approval. Briefing repeats it. |
| “Verified doctor” | FIXED | User-facing strings that said a verified doctor were changed to a qualified clinician or an admin-reviewed doctor. Admin review is not described as government BMDC verification. |
| Clinical Decision Support title | WARNING | The document title, logo line, and footer still say “Clinical Decision Support System”, with a sentence that it is not a certified clinical system and not a substitute for a clinician. The product name was not renamed in this pass. |
| Bangla selection-rule text from the API | WARNING | On the Bangla evaluation page, the DiaBD and Cleveland selection-rule strings returned by the API remain English. |

## 4. Frontend audit

Status: FIXED for the pages edited in this pass, then rebuilt.

Edited files, all uncommitted:

- `frontend/src/pages/Home.jsx` — governance line, six verifiable achievement cards, third hero link goes to `/assessment` instead of a second Bangladesh link, admin-review wording.
- `frontend/src/pages/Assessment.jsx` — offers, then limitations, for all four pathways, with the requested calls to action.
- `frontend/src/pages/ModelEvaluation.jsx` — research conclusion, DiaBD imbalance note, Pima section, WHO section, ROC-AUC rounded to four decimals, no doubled period between the cohort sentence and the counts.
- `frontend/src/i18n.js` — evaluation limit no longer says the DiaBD numbers are merely “public research tables” that are not about Bangladesh. Doctor wording no longer says “verified”.
- `frontend/src/pages/HospitalDetail.jsx` and `frontend/src/pages/Dashboard.jsx` — list doctors as listed or admin-reviewed, not verified.

`npm run build` passed after these edits: `dist/assets/index-BM-RsFiy.js` (650.39 kB) and `dist/assets/index-B91HALkW.css`. The only build warning is the existing chunk-size notice. `dist` is gitignored.

Console errors and a full React warning pass were not captured. Status for that check: NOT TESTED.

Unused `pimaPaused*` strings remain in `i18n.js` and are not rendered. Status: WARNING.

## 5. Backend and API audit

Status: PASS for the suites that ran. No prediction route, cutoff, or authorization code was edited.

`GET /api/evaluation` after the API restart:

- DiaBD threshold 0.51, model `XGBClassifier`, accuracy 0.6904, precision 0.1159, recall 0.5846, false positives 290, false negatives 27, test rows 1024.
- `trained_on` includes the unverified sampling-frame sentence.
- `pima_historical_file.displayed_as_performance` is false.
- Cleveland accuracy 0.9167, confusion matrix `[[32, 0], [5, 23]]`.
- The diabetes payload does not include `compared_with`, so the old Random Forest 87% runner line is not shown as a DiaBD result.

Other public reads: `/api/notices` 200 with an empty list, `/api/hospitals` 200, `/api/blood/donors` 200 with `demo: true` and `recruitment_authorized: false`, `/api/blood/requests` 200 with an empty request list, `/docs` 200. `/api/health`, `/api/knowledge`, `/api/awareness`, and `/api/doctors` returned 404; those screens are frontend routes, not those API paths.

The joblib bundle `backend/app/ml_models/bd_diabetes.joblib` still reports threshold 0.51. It was only loaded for that read.

## 6. Database and security audit

Status: PASS for isolation. Production database was not the test database.

Tests set `VITAGUARD_DB_PATH` to a temp file and ran each module in its own process:

| Suite | Result |
| --- | --- |
| `tests.test_phase_a_security` | 14 tests, OK |
| `tests.test_phase_b_privacy` | 6 tests, OK |
| `tests.test_phase_c_platform` | 7 tests, OK |
| `tests.test_phase_d_coordination` | 4 tests, OK |
| `tests.test_phase_e_intelligence` | 7 tests, OK |
| `tests.test_phase_f_readiness` | 4 tests, OK |
| `tests.test_phase_g_ecosystem` | 4 tests, OK |

Phase E still expects consented Pima access to be open. That expectation was not changed. Deprecation warnings for `datetime.utcnow` and `httpx`/`starlette` remain. sklearn 1.9.0 pickles still warn on 1.9.1. No model was retrained.

JWT secrets were not printed. Authentication, consent, and doctor-access rules were not loosened. A signed-in browser walk of doctor-only patient access was NOT TESTED in this pass; the isolated API tests cover that rule.

## 7. Model Evaluation page changes

Status: FIXED and rechecked in the browser.

The page leads with: “Latest research conclusion: No reliable production improvement was established. Current data limitations remain, and additional representative, appropriately approved data is required.”

It states that the four pathways are not on one scale and that accuracy alone does not explain a result. DiaBD and Cleveland numbers come from the live API. Pima and WHO are separate static sections so they are not ranked against the live cards. The age 21–40 recall is labeled as training out-of-fold, not a locked-test subgroup. Table consistency for WHO is not called accuracy.

Before the restart, the running API still showed “DiaBD · XGBoost” with Pima Phoenix text, precision 0.7869, and accuracy 87.7%. That was a stale process, not the current file. After restart, the card is “DiaBD · XGBClassifier” with precision 11.6%, 290 false positives, 27 false negatives, and 669 / 290 / 27 / 38 in the matrix.

## 8. Assessment UX changes

Status: FIXED and rechecked in English and Bangla.

Each card shows “What this pathway offers” before “Important limitations”. Calls to action:

- Explore Bangladesh-focused screening → `/bangladesh`
- Explore the Pima research pathway → `/predict/diabetes` (form is open; guest result is not saved)
- Explore cardiovascular research assessment → `/predict/cardio`
- Explore the WHO risk chart → `/bangladesh`, where the chart form sits under the DiaBD form

A full screening submission was not clicked in the browser. Status for an end-to-end result page: NOT TESTED in the browser. Phase E covers the consented API.

## 9. Achievements and claims

Status: FIXED on the homepage section that was added. Remaining older sentences are WARNING, not deleted in bulk.

The new homepage cards claim only: four separate pathways, local TreeSHAP that is not a cause, consent plus the confirmed-appointment doctor rule, the invalid 87.66% Pima figure, production artifacts left unchanged, and the WHO lookup. They do not claim clinical validation, BMRC or DGHS approval, hospital partnerships, recruitment, or deployment.

The homepage still has older module and FAQ copy around those cards. That copy was not rewritten line by line. The briefing page already states the governance limits.

## 10. Tests executed

| Check | Result |
| --- | --- |
| Frontend production build | PASS, twice. The second build is the one that matches the final copy. |
| Backend unittest modules A–G on a temp database | PASS, 46 tests. |
| `GET /api/evaluation` metric check | PASS after API restart. |
| Guest navigation and pathway clicks | PASS for the routes in section 2. |
| Bangla and English on assessment, evaluation, and home | PASS for the edited copy. |
| Phone width 390 on assessment, including the menu | PASS. |
| Tablet width | NOT TESTED. |
| Signed-in patient, doctor, and admin browser journeys | NOT TESTED. |
| Browser submission of a screening form | NOT TESTED. |
| Frontend unit tests | NOT TESTED. There is no frontend test script. |
| Console and React warning capture | NOT TESTED. |

## 11. Known limitations

- DiaBD sampling frame and site-level provenance remain unverified. The CSV has no site column.
- No reliable production improvement was established. More representative, appropriately approved labeled data would be required before any model change.
- DiaBD precision is low. A positive screen needs follow-up. The tool is experimental screening support, not a diagnosis.
- Pima is a historical Phoenix-area cohort of women ages 21–81. The open consent path does not make it a Bangladesh model.
- Cleveland’s 0.9167 is a 60-row historical test.
- WHO 700/700 is table consistency, not accuracy.
- Blood network is a labeled simulation. Hospital rows are a directory with verification still pending.
- Health notices are currently an empty public list.
- The shell still uses the Clinical Decision Support name, with an explicit non-certification disclaimer.
- Unused `pimaPaused*` translation keys still exist and are not shown.
- Some API selection-rule sentences stay English when the page is in Bangla.

## 12. Protected hashes

Rechecked after the edits and tests. All match the baseline. Production database size is 311296 bytes.

| File | SHA-256 | Bytes |
| --- | --- | --- |
| `backend/app/ml_models/bd_diabetes.joblib` | `d9a921af71c27bafa9bace696b9c590c28dbad82e8ce2935ccdc64eb0c1f38d7` | 235255 |
| `backend/app/ml_models/cardio_model.joblib` | `d6a975625abe80eb52a66592b9a82aa35e41b4d13f593359f8aa95ac92104f5f` | 975 |
| `backend/app/ml_models/cardio_scaler.joblib` | `7cd6c5cc7050be779b783d786d974d27b071526e39c17f580fe2d7cfd47737a4` | 1231 |
| `ML_Model/models/best_model.pkl` | `b83e89714c302d128ba093cc18e0d57d988aef32d3bc9c52035852c6e802bfd5` | 243636 |
| `ML_Model/models/imputer.pkl` | `8e78a788b6012aae4b477d7aaa83efaeb5bda34ac725a716bb2deaa41dff6336` | 919 |
| `ML_Model/models/scaler.pkl` | `5e204890312672ceaeddffe679e0ad3a267e5eeff280dd59931909c6cefa70a3` | 1127 |
| `ML_Research/Phase06B/Artifacts/diabd_research_calibrators.pkl` | `631f113737d2d023fd3ede373f36d01e27bacbac6ca8ed92bab8df2edd8840ea` | 227960 |
| `ML_Research/Phase06B/Artifacts/cleveland_shap_explainer.pkl` | `e7593e20eaab9e73558d2c2bcdaf1314eeb7e37aed66a439e591c2356ffb2614` | 24803 |
| `ML_Research/Phase06B/Artifacts/pima_leakage_free_pipeline.pkl` | `93f5188abdc4b1bec59f0a4c4ddc3abf19ffd888dd0b2628d75d5bb307ae2c7f` | 4199 |
| `backend/vitaguard.db` | `dc8d382825ab2e5f0099bf67eefdda5b9a3f5544e67a1e642f6447866bd70ab2` | 311296 |

Git status after the audit: modified `frontend/src/i18n.js`, `Assessment.jsx`, `Dashboard.jsx`, `Home.jsx`, `HospitalDetail.jsx`, and `ModelEvaluation.jsx`, plus the untracked file `=`, which was not staged. This report is a new untracked file. No commit was created.

## 13. Remaining submission risks

- Judges can still read the product title as a clinical decision-support product. The nearby sentences say it is not certified and not a diagnosis, but the title itself was left in place.
- DiaBD provenance is honestly unknown. Do not fill that gap with the 63-union article or the older BIRDEM inventory.
- Signed-in workflows and a live screening result were not exercised in the browser in this pass. The API tests passed on synthetic data.
- If an old API process is left running, the evaluation page can again show the leaked Pima card. The local server was restarted so the current route is what the browser used.
- Low precision and the small Cleveland test set will look weak next to a leaderboard. That is the correct presentation.

The project is ready for a preliminary submission only with those limits stated. It is not clinically validated, not approved, and not authorized to recruit.
