# GitHub file split

One repository. Do not make five copies. The app runs only when these files stay in one folder.

`C:\Users\TANVIRHOSENNISHAT\Desktop\TriNexus (Final Work)\TriNexus-VitaGuard-AI`

Branch: `competition-readiness`

Tanvir 40% (lead), Farhan 20%, Naif 20%, Fardin 10%, Monima 10%.

Each person commits only the files named in their section, from their own GitHub account. Do not commit `backend\venv\`, `frontend\node_modules\`, `frontend\dist\`, `backend\.env`, `backend\vitaguard.db`, or the stray file `=`.

## Tanvir — 40%, lead

### Model files

- `backend\app\ml_models\bd_diabetes.joblib`
- `backend\app\ml_models\cardio_model.joblib`
- `backend\app\ml_models\cardio_scaler.joblib`
- `ML_Model\models\best_model.pkl`
- `ML_Model\models\imputer.pkl`
- `ML_Model\models\scaler.pkl`
- `ML_Model\models\.gitkeep`

### Model code and metrics

- `ML_Model\train.py`
- `ML_Model\ethical_compare.py`
- `ML_Model\preprocessing\preprocess.py`
- `ML_Model\preprocessing\.gitkeep`
- `ML_Model\notebooks\.gitkeep`
- `ML_Model\explainable_ai\shap_analysis.py`
- `ML_Model\explainable_ai\plots\feature_importance.json`
- `ML_Model\explainable_ai\plots\shap_feature_importance.png`
- `ML_Model\explainable_ai\plots\shap_summary_beeswarm.png`
- `ML_Model\evaluation\bd_diabetes_metrics.json`
- `ML_Model\evaluation\cardio_metrics.json`
- `ML_Model\evaluation\metrics.json`
- `ML_Model\evaluation\pabna_external.json`
- `backend\train_bd_diabetes.py`
- `backend\train_cardio.py`

### Prediction services

- `backend\app\services\bd_diabetes_service.py`
- `backend\app\services\diabetes_service.py`
- `backend\app\services\model_service.py`
- `backend\app\services\shap_service.py`
- `backend\app\services\bd_cvd_chart.py`
- `backend\app\services\intelligence.py`
- `backend\app\services\lineage.py`
- `backend\app\services\knowledge.py`
- `backend\app\services\knowledge_catalog.py`

### Dataset

- `dataset\README.md`
- `dataset\data_dictionary.md`
- `dataset\raw\diabetes.csv`
- `dataset\raw\heart_cleveland_upload.csv`
- `dataset\processed\train.csv`
- `dataset\processed\test.csv`

### Research folders

Every file inside these folders:

- `ML_Research\Accuracy_Improvement\`
- `ML_Research\Competition_Readiness\`
- `ML_Research\Final_Technical_Readiness\`
- `ML_Research\Model_Excellence\`
- `ML_Research\Phase06B\`
- `ML_Research\Phase06C\`
- `ML_Research\Security_Remediation\`

### Lead documents

- `README.md`
- `start-local.bat`
- `PROJECT_AUDIT.md`
- `ML_DATA_LEAKAGE_AUDIT.md`
- `ML_VALIDATION_METRICS.md`
- `SHAP_EXPLAINABILITY_AUDIT.md`
- `CLINICAL_VALIDITY_AND_CALIBRATION_AUDIT.md`
- `PHASE05_ML_AUDIT_REPORT.md`
- `PHASE05_RECOMMENDATIONS.md`
- `PHASE06B1_CLEVELAND_EXPLAINABILITY_VERIFICATION.md`
- `PHASE06B1_DIABD_CALIBRATION_AUDIT.md`
- `PHASE06B1_INDEPENDENT_VERIFICATION_REPORT.md`
- `PHASE06B1_PIMA_PIPELINE_VERIFICATION.md`
- `PHASE06B1_PRODUCTION_INTEGRITY_VERIFICATION.md`
- `PHASE06B1_THRESHOLD_LEAKAGE_AUDIT.md`
- `PHASE06B2_GOVERNANCE_RECONCILIATION.md`
- `phase06b_baseline_hashes.txt`
- `GROUP_GITHUB_SPLIT.md`

## Farhan — 20%

### App entry, login, and database

- `backend\app\main.py`
- `backend\app\auth.py`
- `backend\app\security_config.py`
- `backend\app\database\database.py`
- `backend\app\models\models.py`
- `backend\app\models\phase2.py`
- `backend\app\models\schemas.py`
- `backend\requirements.txt`
- `backend\create_admin.py`
- `backend\test_api.py`
- `backend\README.md`

### API route files

- `backend\app\routes\appointments.py`
- `backend\app\routes\auth.py`
- `backend\app\routes\bangladesh.py`
- `backend\app\routes\blood.py`
- `backend\app\routes\coordination.py`
- `backend\app\routes\dashboard.py`
- `backend\app\routes\directory.py`
- `backend\app\routes\evaluation.py`
- `backend\app\routes\notices.py`
- `backend\app\routes\platform.py`
- `backend\app\routes\prediction.py`
- `backend\app\routes\privacy.py`

### Other backend services used by those routes

- `backend\app\services\care_access.py`
- `backend\app\services\privacy.py`
- `backend\app\services\notify.py`
- `backend\app\services\phase2.py`
- `backend\app\services\hospitals.py`
- `backend\app\data\__init__.py`
- `backend\app\data\bd_private_hospitals.py`

### Tests

- `backend\tests\test_phase_a_security.py`
- `backend\tests\test_phase_b_privacy.py`
- `backend\tests\test_phase_c_platform.py`
- `backend\tests\test_phase_d_coordination.py`
- `backend\tests\test_phase_e_intelligence.py`
- `backend\tests\test_phase_f_readiness.py`
- `backend\tests\test_phase_g_ecosystem.py`

### Security notes

- `docs\security\ENCRYPTION_PROPOSAL.md`
- `docs\security\JWT_SECRET_ROTATION.md`
- `PHASE06A1_SECURITY_VERIFICATION.md`
- `PHASE06A1_TEST_RESULTS.md`
- `PHASE06A1_OUTPUT_CONSISTENCY_AUDIT.md`
- `PHASE06A_SAFETY_IMPLEMENTATION_REPORT.md`
- `PHASE06A_TEST_REPORT.md`
- `PHASE06A_CHANGED_FILES.md`
- `PHASE06A2_API_SEMANTICS_REPORT.md`
- `PHASE06A2_CHANGED_FILES.md`
- `PHASE06A2_COMPATIBILITY_TEST_REPORT.md`

## Naif — 20%

### App shell

- `frontend\index.html`
- `frontend\package.json`
- `frontend\package-lock.json`
- `frontend\vite.config.js`
- `frontend\postcss.config.js`
- `frontend\tailwind.config.js`
- `frontend\src\main.jsx`
- `frontend\src\App.jsx`
- `frontend\src\i18n.js`
- `frontend\src\index.css`
- `frontend\src\locales\en.json`
- `frontend\src\locales\bn.json`
- `frontend\src\services\api.js`
- `frontend\src\context\AuthContext.jsx`
- `frontend\src\context\LanguageContext.jsx`
- `frontend\src\utils\roles.js`
- `frontend\src\utils\validationSchemas.js`

### Shared components

- `frontend\src\components\Navbar.jsx`
- `frontend\src\components\Footer.jsx`
- `frontend\src\components\ProtectedRoute.jsx`
- `frontend\src\components\GoogleAuthButton.jsx`
- `frontend\src\components\ResultCard.jsx`
- `frontend\src\components\ShapChart.jsx`
- `frontend\src\components\HeartGraphic.jsx`
- `frontend\src\components\ErrorBoundary.jsx`
- `frontend\src\components\Appointments.jsx`
- `frontend\src\components\CoordinationPanel.jsx`
- `frontend\src\components\JourneyTimeline.jsx`
- `frontend\src\components\NotificationCenter.jsx`
- `frontend\src\components\StoryModal.jsx`
- `frontend\src\components\ui\AccessibleModal.jsx`
- `frontend\src\components\ui\AlertBanner.jsx`
- `frontend\src\components\ui\ClinicalCard.jsx`
- `frontend\src\components\ui\ClinicalInput.jsx`
- `frontend\src\components\ui\ClinicalSelect.jsx`
- `frontend\src\components\ui\EmptyState.jsx`
- `frontend\src\components\ui\ErrorState.jsx`
- `frontend\src\components\ui\LoadingSkeleton.jsx`
- `frontend\src\components\ui\MedicalButton.jsx`
- `frontend\src\components\ui\PageContainer.jsx`
- `frontend\src\components\ui\SectionHeader.jsx`
- `frontend\src\components\ui\StatusBadge.jsx`
- `frontend\src\components\ui\StepProgress.jsx`
- `frontend\src\components\ui\renderIcon.jsx`
- `frontend\src\components\ui\index.js`

### Pages

- `frontend\src\pages\Home.jsx`
- `frontend\src\pages\Assessment.jsx`
- `frontend\src\pages\BangladeshScreen.jsx`
- `frontend\src\pages\DiabetesPredict.jsx`
- `frontend\src\pages\CardioAssessment.jsx`
- `frontend\src\pages\CardioPredict.jsx`
- `frontend\src\pages\ModelEvaluation.jsx`
- `frontend\src\pages\Login.jsx`
- `frontend\src\pages\Register.jsx`
- `frontend\src\pages\Dashboard.jsx`
- `frontend\src\pages\DoctorDashboard.jsx`
- `frontend\src\pages\DoctorDirectory.jsx`
- `frontend\src\pages\AdminDashboard.jsx`
- `frontend\src\pages\Messages.jsx`

## Fardin — 10%

### Data provenance

- `docs\governance\DATA_CARDS.md`
- `docs\governance\DATA_LINEAGE.md`
- `docs\governance\DATA_RETENTION_AND_DELETION.md`
- `docs\governance\PHASE3_AI_INTELLIGENCE.md`
- `PHASE06C0_DATASET_INVENTORY.md`
- `PHASE06C0_INDEPENDENCE_AND_PROVENANCE_AUDIT.md`
- `PHASE06C0_CLINICAL_COMPATIBILITY_REPORT.md`
- `PHASE06C0_READINESS_DECISION.md`
- `PHASE06C1_DIABD_DATA_DICTIONARY.md`
- `PHASE06C1_DATASET_ACCEPTANCE_CHECKLIST.md`
- `PHASE06C1_SAMPLE_SIZE_JUSTIFICATION.md`
- `PHASE06C1_ETHICS_AND_DATA_GOVERNANCE.md`
- `PHASE06C1_EXTERNAL_COHORT_ACQUISITION_PROTOCOL.md`
- `PHASE06C_SCOPE_AND_ENTRY_CRITERIA.md`
- `PHASE06C_VALIDATION_PROTOCOL.md`

### Hospital, blood, and notice screens

- `frontend\src\pages\Hospitals.jsx`
- `frontend\src\pages\HospitalDetail.jsx`
- `frontend\src\pages\BloodNetwork.jsx`
- `frontend\src\pages\HealthNotice.jsx`

## Monima — 10%

### Explanation and presentation files

- `VitaGuard_Project_Explanation.html`
- `TriNexus_VitaGuard_5Part_Presentation.pptx`
- `TriNexus_VitaGuard_One_Page_Project_Summary.docx`
- `docs\presentation\TriNexus_VitaGuard_AIBC_2026.pptx`
- `docs\presentation\build_pitch_deck.py`
- `docs\presentation\build_one_page_summary_docx.py`
- `docs\presentation\render_flow_infographic.html`
- `docs\presentation\actual_prototype_flow_infographic.png`
- `docs\presentation\actual_prototype_flow_ai_art.jpg`
- `docs\presentation\.gitkeep`

### Education pages

- `frontend\src\pages\Awareness.jsx`
- `frontend\src\pages\KnowledgeHub.jsx`
- `frontend\src\pages\KnowledgeArticle.jsx`
- `frontend\src\pages\KnowledgeGraph.jsx`
- `frontend\src\pages\ExplainCenter.jsx`
- `frontend\src\pages\FairnessDashboard.jsx`
- `frontend\src\pages\Competition.jsx`
- `frontend\src\components\AwarenessSection.jsx`
- `frontend\src\components\VideoCard.jsx`

### Submission documents

- `submission\PROJECT_OVERVIEW.md`
- `submission\AI_METHODOLOGY_AND_LIMITATIONS.md`
- `submission\DEMO_SCRIPT.md`
- `submission\SETUP_AND_DEMO_GUIDE.md`
- `submission\PRELIMINARY_SUBMISSION_SUMMARY.md`
- `submission\SYSTEM_ARCHITECTURE.md`
- `submission\SECURITY_AND_GOVERNANCE.md`
- `submission\FINAL_READINESS_REPORT.md`
- `submission\judging_criteria\JUDGING_CRITERIA_MATRIX.md`
- `submission\judging_criteria\JUDGING_EVIDENCE_CHECKLIST.md`
- `submission\judging_criteria\JUDGES_PRESENTATION_TALKING_POINTS.md`
- `submission\judging_criteria\INNOVATION_AND_AI_DESIGN.md`
- `submission\judging_criteria\TECHNICAL_EXCELLENCE_AND_ARCHITECTURE.md`
- `submission\judging_criteria\RESPONSIBLE_AI_AND_DATA_SOVEREIGNTY.md`
- `submission\judging_criteria\BUSINESS_VALUE_AND_COMMERCIAL_VIABILITY.md`
- `submission\judging_criteria\GLOBAL_SCALABILITY_AND_REAL_WORLD_IMPACT.md`
- `submission\judging_criteria\NRB_GLOBAL_COLLABORATION.md`
- `submission\final_readiness\FINAL_PROJECT_AUDIT.md`
- `submission\final_readiness\DOCUMENTATION_CONSISTENCY_AUDIT.md`
- `submission\final_readiness\PRESENTATION_DEMO_SCRIPT.md`
- `submission\final_readiness\ASSESSMENT_PURPOSE_AND_LIMITATIONS.md`
- `submission\final_readiness\REMAINING_LIMITATIONS.md`
- `submission\final_readiness\FINAL_SUBMISSION_READINESS.md`
- `submission\final_readiness\FINAL_SYSTEM_AUDIT.md`
- `submission\final_readiness\FINAL_TEST_RESULTS.md`
- `submission\final_readiness\FEATURE_INTEGRATION_AUDIT.md`
- `submission\final_readiness\NAVIGATION_AND_ROLE_AUDIT.md`
- `submission\final_readiness\SECURITY_AND_PRIVACY_AUDIT.md`
- `submission\final_readiness\DATABASE_AND_DEMO_ACCOUNTS.md`

The folders `submission\audit_backups\2026-11-19\` and `submission\audit_backups\2026-11-19-doc-consistency\` are old snapshots. Monima owns them, but they should not be rewritten.

### Interface writing

- `DESIGN_SYSTEM_SPECIFICATION.md`
- `DESIGN_SYSTEM_IMPLEMENTATION_REPORT.md`
- `DOCTOR_ADMIN_UX_SPECIFICATION.md`
- `HEALTHCARE_UX_AUDIT.md`
- `ACCESSIBILITY_AUDIT.md`
- `ARCHITECTURE_OVERVIEW.md`
- `FEATURE_INVENTORY.md`
- `CLINICAL_ASSESSMENT_WIREFRAME.md`
- `PATIENT_DASHBOARD_WIREFRAME.md`
- `PREDICTION_RESULT_WIREFRAME.md`
- `BANGLADESH_PATIENT_EXPERIENCE.md`
