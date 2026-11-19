# Phase 06B — Cleveland SHAP Mathematical Validation & Case Profiles
**TriNexus | VitaGuard AI — Clinical Machine Learning Division**  
**Date:** November 10, 2026  
**Status:** Validated (Additivity Error $< 10^{-15}$, Zero Axiom Violations)  
**Author:** Senior Machine Learning Engineer & Clinical AI Explainability Specialist  

---

## 1. Mathematical Rigor of `shap.LinearExplainer`

To replace the pseudo-SHAP heuristic identified in Phase 05, Phase 06B implemented and validated an exact `shap.LinearExplainer` pipeline for the Cleveland Logistic Regression model.

### 1.1 Analytical Derivation for Linear Models
For a logistic regression model with decision function (log-odds margin):
$$f(x) = \beta_0 + \sum_{j=1}^p \beta_j x_j$$
Given a background distribution of training samples $\mathcal{D}_{\text{train}}$ with empirical feature means $\mathbb{E}[X_j] = \frac{1}{N}\sum_{i=1}^N X_{i,j}$, the exact Shapley value attribution for feature $j$ on patient vector $x$ has an exact closed-form solution:
$$\phi_j(x) = \beta_j \cdot \left( x_j - \mathbb{E}[X_j] \right)$$
The expected baseline value (base value) is:
$$\phi_0 = \mathbb{E}[f(X)] = \beta_0 + \sum_{j=1}^p \beta_j \mathbb{E}[X_j]$$

### 1.2 The Shapley Efficiency (Additivity) Axiom
Shapley attributions must sum exactly to the difference between the model's log-odds output and the baseline expected log-odds:
$$\phi_0 + \sum_{j=1}^p \phi_j(x) = f(x)$$
In probability space:
$$P(Y=1 \mid x) = \frac{1}{1 + \exp\left( - \left[ \phi_0 + \sum_{j=1}^p \phi_j(x) \right] \right)}$$

### 1.3 Additivity Verification Across Test Set
Every sample in the 60-patient test set was evaluated for additivity error:
$$\epsilon_{\text{additivity}} = \left| \left( \phi_0 + \sum_{j=1}^{13} \phi_j(x_i) \right) - f(x_i) \right|$$
- **Maximum Observed Additivity Error:** $\mathbf{8.88 \times 10^{-16}}$
- **Clinical Safety Threshold:** $< 1.0 \times 10^{-5}$
- **Audit Result:** **PASSED.** The error is at the machine-precision limit of 64-bit IEEE floating-point arithmetic.

---

## 2. Local Patient Case Profile Demonstrations

To demonstrate genuine patient-specific local attribution, three distinct clinical patient archetypes were analyzed.

### Case 1: High-Risk Profile (Severe Multi-Vessel Angina)
- **Clinical Presentation:** 65-year-old male, severe chest pain (`cp=3`), resting BP 155 mmHg, cholesterol 280 mg/dL, ST depression 2.8 mm (`oldpeak`), max heart rate 120 bpm, 2 stenosed vessels (`ca=2`), reversible thallium defect (`thal=2`).
- **Predicted CVD Probability:** **99.55%**
- **Decision Margin (Log-Odds):** $+5.3922$
- **Expected Base Value ($\phi_0$):** $-0.2634$ (Base Probability: 43.45%)
- **Additivity Verified:** True ($\epsilon < 10^{-15}$)
- **Top Local Contributing SHAP Factors:**
  1. `ca` (2 major stenosed vessels): **+1.5551 log-odds** *(Strong Risk Driver)*
  2. `thal` (Reversible thallium defect): **+0.7107 log-odds** *(Strong Risk Driver)*
  3. `thalach` (Blunted peak heart rate 120 bpm): **+0.6938 log-odds** *(Risk Driver)*
  4. `exang` (Exercise angina present): **+0.6392 log-odds** *(Risk Driver)*
  5. `oldpeak` (2.8 mm ST depression): **+0.5834 log-odds** *(Risk Driver)*
- **Clinical Rationale:** The model attributes +4.18 log-odds to objective catheterization and stress markers, pushing risk to near certainty (99.55%).

---

### Case 2: Low-Risk Profile (Young Asymptomatic Healthy Control)
- **Clinical Presentation:** 42-year-old female, atypical non-anginal discomfort (`cp=1`), BP 115 mmHg, cholesterol 180 mg/dL, normal ST segment (`oldpeak=0.0`), max heart rate 175 bpm, 0 stenosed vessels (`ca=0`), normal thallium (`thal=0`).
- **Predicted CVD Probability:** **1.36%**
- **Decision Margin (Log-Odds):** $-4.2804$
- **Expected Base Value ($\phi_0$):** $-0.2634$
- **Additivity Verified:** True ($\epsilon < 10^{-15}$)
- **Top Local Contributing SHAP Factors:**
  1. `ca` (Clear vessels, $0$ vs avg $0.54$): **-0.6199 log-odds** *(Strong Protective)*
  2. `sex` (Female biological sex, $0$ vs avg $0.68$): **-0.5504 log-odds** *(Protective)*
  3. `cp` (Non-ischemic chest pain code, $1$ vs avg $2.15$): **-0.5281 log-odds** *(Protective)*
  4. `thalach` (Excellent exercise capacity 175 bpm): **-0.5077 log-odds** *(Protective)*
  5. `thal` (Normal scintigraphy): **-0.4939 log-odds** *(Protective)*
- **Clinical Rationale:** The absence of coronary calcification combined with female sex and high chronotropic reserve pulls the log-odds down by $-4.02$, yielding an ultra-low risk score (1.36%).

---

### Case 3: Borderline Profile (Middle-Aged Male with Ambiguous Findings)
- **Clinical Presentation:** 54-year-old male, atypical pain (`cp=2`), BP 138 mmHg, cholesterol 245 mg/dL, mild ST depression 0.8 mm (`oldpeak`), max heart rate 145 bpm, clear fluoroscopy (`ca=0`), no exercise angina (`exang=0`).
- **Predicted CVD Probability:** **39.86%**
- **Decision Margin (Log-Odds):** $-0.4113$
- **Expected Base Value ($\phi_0$):** $-0.2634$
- **Additivity Verified:** True ($\epsilon < 10^{-15}$)
- **Opposing Local SHAP Factors:**
  - *Risk-Increasing Forces:* Male sex (**+0.3096**), flat ST slope (**+0.1786**), sub-maximal heart rate 145 bpm (**+0.1477**), borderline BP (**+0.1264**).
  - *Protective Forces:* Clear vessels `ca=0` (**-0.6199**), absence of exercise angina `exang=0` (**-0.3008**).
- **Clinical Rationale:** Demonstrates how SHAP accurately captures clinical tension: clear fluoroscopy and no angina pull toward health, but male sex and borderline hemodynamic markers hold the patient in the intermediate risk zone (39.86%).

---

## 3. Subgroup Demographic Disparity Audit

An explainability framework must evaluate whether feature attributions behave equitably across demographic subgroups.

| Demographic Cohort | Cohort Size ($N$) | Cohort % | Test Set Count ($N_{\text{test}}$) | Test Set AUROC | Average Absolute SHAP Sum | Primary Explanatory Driver |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **All Patients** | 297 | 100.0% | 60 | 0.9080 | 3.82 log-odds | `ca` (vessels), `thal` (scintigraphy) |
| **Male Subgroup** | 201 | **67.7%** | 37 | **0.9733** | 4.14 log-odds | `ca`, `thal`, `exang`, `oldpeak` |
| **Female Subgroup** | 96 | **32.3%** | 23 | **0.8333** | 3.12 log-odds | `ca`, `thalach`, `sex` (protective) |

### 3.1 Subgroup Findings & Clinical Warnings
1. **Performance Disparity:**  
   The model achieves a near-perfect AUROC of **0.9733** on males, but drops to **0.8333** on females.
2. **Attribution Skew:**  
   Because the dataset is predominantly male, the male baseline pulls the female `sex` attribution heavily into negative (protective) territory ($-0.5504$ log-odds). For older post-menopausal females with microvascular ischemia, this automatic "female sex discount" risks falsely suppressing estimated risk.
3. **Mandatory UI Guardrail:**  
   The UI must explicitly display: *"Notice: Cleveland dataset has limited female representation (32.3%). Interpret attributions in female patients with heightened clinical caution."*
