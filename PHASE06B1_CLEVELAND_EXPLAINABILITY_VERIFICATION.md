# Phase 06B.1 — Cleveland Explainability & SHAP Validation Audit
**TriNexus | VitaGuard AI — Clinical Machine Learning Division**  
**Audit Date:** November 10, 2026  
**Auditor:** Independent AI Explainability Auditor & Biostatistical Reviewer  
**Audit Object:** `ML_Research/Phase06B/Cleveland/`  

---

## 1. Executive Summary & Verification Mandate

In Phase 05, the audit exposed that the production backend (`backend/app/services/model_service.py`) claimed to provide "SHAP values" while actually returning static normalized logistic regression coefficients. In Phase 06B, an exact `shap.LinearExplainer` research pipeline was constructed.

This audit independently inspects the model configuration, feature order, SHAP explainer mathematics, additivity errors, clinical archetype origins, and subgroup sample sizes.

---

## 2. Granular Technical Verification Findings

### 2.1 Model Architecture & Preprocessing Pipeline
- **Pipeline Structure:**  
  $$\text{Input Vector } X \xrightarrow{\text{StandardScaler}} X_{\text{scaled}} \xrightarrow{\text{LogisticRegression}} \text{Log-Odds Margin } f(X)$$
- **Hyperparameter Configuration:**
  - `StandardScaler(with_mean=True, with_std=True)` fitted on `X_train` ($N=237$).
  - `LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42)` fitted on `X_train_scaled`.
- **Status:** **VERIFIED**

---

### 2.2 Feature Names & Dimension Alignment
- **Feature Order:**  
  `["age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"]`
- **Verification:** Feature ordering strictly matches the 13 feature columns of `dataset/raw/heart_cleveland_upload.csv`.
- **Status:** **VERIFIED**

---

### 2.3 SHAP Explainer Configuration & Output Space
- **Explainer Class:** `shap.LinearExplainer` initialized with training data masker:
  ```python
  explainer = shap.LinearExplainer(model, X_train_scaled, feature_names=feature_names)
  ```
- **Output Space:** Model margin (log-odds scale).
- **Expected Baseline Value ($\phi_0$):**  
  $$\phi_0 = \mathbb{E}[f(X)] = \mathbf{-0.2634} \quad (\text{Base Probability } P_0 = 43.45\%)$$
- **Biostatistical Evaluation:** Linear explainer operating in log-odds margin space guarantees exact closed-form Shapley values ($\phi_j = \beta_j (x_j - \mathbb{E}[X_j])$) without sampling approximation noise.
- **Status:** **VERIFIED**

---

### 2.4 Additivity Reconstruction Across Test Set
- **Shapley Efficiency Axiom:**  
  For every test sample $x_i$, the sum of local attributions plus baseline must equal the model's decision function:
  $$\epsilon_i = \left| \left( \phi_0 + \sum_{j=1}^{13} \phi_j(x_i) \right) - f(x_i) \right|$$
- **Auditor Empirical Measurement:**  
  Across all 60 test instances:
  $$\max_{i=1..60} \epsilon_i = \mathbf{8.88 \times 10^{-16}}$$
- **Clinical Safety Threshold:** $< 1.0 \times 10^{-5}$.
- **Auditor Evaluation:** The maximum error is at the machine-precision limit of double-precision floating-point arithmetic ($2^{-52} \approx 2.22 \times 10^{-16}$). Zero axiom violations observed.
- **Status:** **VERIFIED**

---

### 2.5 Clinical Archetype Authenticity: Synthetic vs. Real
- **Audit Question:** Are the three case profiles evaluated in `CLEVELAND_SHAP_VALIDATION_REPORT.md` (Case 1: 99.55%, Case 2: 1.36%, Case 3: 39.86%) actual de-identified patient observations from the Cleveland CSV or synthetic constructs?
- **Forensic Inspection:** In `cleveland_explainability_experiment.py` (lines 100–113):
  - Case 1: `{"age": 62, "sex": 1, "cp": 3, "trestbps": 150, "chol": 260, "fbs": 0, "restecg": 2, "thalach": 120, "exang": 1, "oldpeak": 2.8, "slope": 1, "ca": 2, "thal": 2}`
  - Case 2: `{"age": 36, "sex": 0, "cp": 1, "trestbps": 110, "chol": 170, "fbs": 0, "restecg": 0, "thalach": 175, "exang": 0, "oldpeak": 0.0, "slope": 0, "ca": 0, "thal": 0}`
  - Case 3: `{"age": 52, "sex": 1, "cp": 2, "trestbps": 135, "chol": 230, "fbs": 0, "restecg": 1, "thalach": 145, "exang": 0, "oldpeak": 0.8, "slope": 1, "ca": 0, "thal": 1}`
- **Auditor Finding:** Searching the raw dataset `heart_cleveland_upload.csv` reveals that **no patient matches these exact feature combinations**.
- **Conclusion:** These three case profiles are **SYNTHETIC CLINICAL VIGNETTES** designed to demonstrate extreme high-risk, low-risk, and borderline scenarios. They are not real historical patient records.
- **Status:** **VERIFIED WITH LIMITATIONS (SYNTHETIC PROFILE LABEL APPLIED)**

---

### 2.6 Subgroup Sex Imbalance & Statistical Power
- **Reported Claim:** Cleveland model achieves an AUROC of **0.9733** in males, but drops to **0.8333** in females.
- **Sample Count Inspection:**
  - Full Dataset ($N=297$): 201 Males (67.68%), 96 Females (32.32%).
  - Test Set Split ($N=60$):
    - **Male Test Set:** $N = 37$ (25 diseased, 12 healthy) $\to$ **AUROC = 0.9733**
    - **Female Test Set:** $N = 23$ (**ONLY 3 DISEASED**, 20 healthy) $\to$ **AUROC = 0.8333**
- **Auditor Biostatistical Warning:**  
  In a sample with only 3 positive events, the variance of the Wilcoxon-Mann-Whitney U statistic is massive ($\text{SE} \approx 0.12$). A 95% confidence interval spans roughly $[0.58, 1.00]$. The shift of a single patient classification changes the female AUROC by **$33.3$ percentage points**.
- **Conclusion:** The claim of female discrimination impairment is directionally credible due to the 68% male training bias, but the exact point estimate of 0.8333 is **statistically underpowered and lacks confidence intervals**.
- **Status:** **VERIFIED WITH LIMITATIONS (UNDERPOWERED SUBGROUP SAMPLE)**

---

## 3. Explainability Governance Rules for Phase 06C

1. **Association vs. Causation Prohibition:**  
   SHAP values quantify the additive contribution of a feature to the statistical decision margin. **They do not establish clinical etiology or treatment efficacy.** For instance, high maximum heart rate (`thalach`) carries a protective log-odds attribution (-0.49), but pharmacologically accelerating a patient's heart rate does not treat coronary atherosclerosis. UI displays in Phase 06C must include mandatory disclaimers:  
   *"Notice: Risk attributions reflect statistical associations in historical referral data, not causal medical advice."*
2. **Mandatory Sex Disparity Warning:**  
   Because only 32% of the Cleveland cohort was female, feature attributions for women are benchmarked against a predominantly male baseline. Phase 06C must prominently alert clinicians when viewing explanations for female patients.
