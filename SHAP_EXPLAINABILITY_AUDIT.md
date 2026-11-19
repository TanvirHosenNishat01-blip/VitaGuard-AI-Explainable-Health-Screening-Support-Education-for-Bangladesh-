# SHAP & EXPLAINABLE AI (XAI) TECHNICAL AUDIT
## TriNexus | VitaGuard AI — Algorithmic Explainability Review
**Audit Date:** November 10, 2026  
**Auditor:** Senior Machine Learning Engineer & Clinical AI Auditor  
**Document Code:** VG-AUDIT-P05-EXPLAINABILITY  

---

## 1. EXECUTIVE AUDIT SUMMARY

This audit examined the mathematical validity, implementation fidelity, and clinical communication of Explainable AI (XAI) features across VitaGuard AI.

```
+------------------------------------------------------------------------------------------------------------------------+
|                                              EXPLAINABILITY AUDIT SUMMARY                                              |
+--------------------------+-----------------------+-----------------------------+--------------------+------------------+
| Predictive Pathway       | Stated Explainer Type | Actual Implemented Engine   | Mathematical Status| Clinical Status  |
+--------------------------+-----------------------+-----------------------------+--------------------+------------------+
| DiaBD Bangladesh Model   | Local TreeSHAP        | shap.TreeExplainer (XGBoost)| PASS (Additivity OK| Sound local XAI  |
| Pima Diabetes Model      | SHAP / Feature Weights| Global Tree Feature Import. | PASS (Global-only) | Skewed by Leakage|
| Cleveland Cardio Model   | SHAP Importance       | Normalized Abs Coefficients | MISLABELED (Not XAI| Static Fake SHAP |
| WHO South Asia CVD Chart | None                  | Pure Tabular Chart Lookup   | PASS (No XAI claim)| Transparent Table|
+--------------------------+-----------------------+-----------------------------+--------------------+------------------+
```

---

## 2. DIABD BANGLADESH MODEL: LOCAL TREESHAP VERIFICATION

### 2.1 Explainer Selection & Mathematical Rigor
- **Engine:** `shap.TreeExplainer(bundle["model"])` in `backend/app/services/bd_diabetes_service.py`.
- **Input Pipeline:** The TreeExplainer operates directly on the raw unscaled input row matching the exact tree split thresholds of the XGBoost champion model.
- **Additivity Verification (Efficiency Property):**
  For tree models with log-odds margins, SHAP guarantees:
  $$\sum_{i=1}^M \phi_i(x) + \phi_0 = f(x)$$
  where $f(x) = \text{logit}(p)$.
  - **Empirical Additivity Check:** Computed across all 1,024 held-out test rows.
  - **Maximum Absolute Additivity Error:** **$1.67 \times 10^{-6}$ log-odds units**.
  - **Status:** **PASS**. The TreeSHAP implementation satisfies the foundational local accuracy axiom.

### 2.2 Feature Attribution Ranking & Directional Correlation
Mean absolute SHAP contributions across the 1,024 test patients:

```
+--------------------+---------------------+---------------------+---------------------------------------------------+
| Feature            | Mean |SHAP| (Log-odds) | Correlation with X  | Directional Clinical Meaning                      |
+--------------------+---------------------+---------------------+---------------------------------------------------+
| 1. Age             | 0.4795              | +0.8424             | Older age strongly drives risk upward             |
| 2. Diastolic BP    | 0.3867              | +0.8314             | Higher diastolic BP drives risk upward            |
| 3. Systolic BP     | 0.2745              | +0.8434             | Higher systolic BP drives risk upward             |
| 4. BMI             | 0.2741              | +0.7888             | Higher BMI drives risk upward                     |
| 5. Pulse Pressure  | 0.1030              | +0.2031             | Wider arterial pulse pressure increases risk      |
| 6. High BP Flag    | 0.0366              | +0.9793             | Clinical hypertension increases risk              |
| 7. Sex             | 0.0213              | +0.8666             | Male sex slightly increases risk                  |
| 8. Family Diabetes | 0.0007              | -0.9044             | Anomalous survey noise (minimal model reliance)   |
+--------------------+---------------------+---------------------+---------------------------------------------------+
```

### 2.3 UI Visualization & Interpretation Safeguards
- In `BangladeshScreen.jsx` and `ShapChart.jsx`:
  - Features are appropriately signed with distinct visual cues (`+Risk` in red, `-Risk` in teal).
  - A persistent disclaimer states: *"Values represent raw model feature weights / SHAP attributions in model units, not additive percentages."*
  - This prevents patients from misinterpreting a log-odds attribution of `+0.45` as an additional `+45%` probability of disease.

---

## 3. CLEVELAND CARDIOVASCULAR MODEL: PSEUDO-SHAP MISLABELING (P1)

### 3.1 Forensic Code Inspection
In `backend/app/services/model_service.py`, lines 87–98:
```python
weights = getattr(cardio_model, "feature_importances_", None)
if weights is None and hasattr(cardio_model, "coef_"):
    weights = np.abs(np.asarray(cardio_model.coef_)).ravel()
influence = []
if weights is not None:
    for name, weight, raw in zip(names, weights, features_array[0]):
        influence.append({
            "feature": name,
            "value": round(float(raw), 3),
            "importance": round(float(weight), 4),
            "description": "Global weight in the trained heart model. The same weights are used for every person.",
        })
```
Furthermore, in `backend/app/routes/prediction.py`, the endpoint `/api/shap-importance?model=cardio` returns:
```python
{"source": "model_weight", "note": "...", "model": "cardio", "features": []}
```

### 3.2 Audit Critique:
1. **Misleading Nomenclature:** In `ResultCard.jsx` and `DoctorDashboard.jsx`, this output is rendered inside `<ShapChart />` and headlined: *"Explainable AI (SHAP) Biomarker Attribution"*.
2. **Failure of Local Attribution:** For logistic regression, true local SHAP values are feature-specific and patient-dependent:
   $$\phi_j(x) = \beta_j \cdot (x_j - E[X_j])$$
   Instead of computing $\beta_j(x_j - \mu_j)$, the backend returns $|\beta_j|$ (normalized to sum to 1.0).
3. **Clinical Impact:** A 30-year-old female with non-anginal chest pain and a 70-year-old male with severe ST-depression receive the exact same "SHAP" ranking (Major Vessels = 0.21, Thalassemia = 0.11, Max HR = 0.10). This misleads clinicians into believing they are reviewing a personalized patient biomarker breakdown.

---

## 4. PIMA DIABETES MODEL: LEAKAGE ARTIFACT IN FEATURE IMPORTANCE

### 4.1 Global Feature Weighting Distortion
In `ML_Model/models/best_model.pkl`, the XGBoost model reports the following feature importances:
- `Insulin`: **0.4104** (41.0% of total tree split gain)
- `SkinThickness`: **0.1714** (17.1%)
- `Glucose`: **0.1049** (10.5%)
- `Age`: **0.1033** (10.3%)
- `BMI`: **0.0692** (6.9%)

### 4.2 Audit Finding:
- As proven in `ML_DATA_LEAKAGE_AUDIT.md`, missing Insulin values in `dataset/raw/diabetes.csv` were replaced by class medians (102.5 for Outcome=0; 169.5 for Outcome=1).
- The "explainability" engine dutifully highlights Insulin as the most important disease driver, not because of biological significance, but because the trees split on the injected target leakage values.
- Communicating this explanation to patients or doctors gives false confidence in an artificial statistical correlation.

---

## 5. DISTINCTION BETWEEN ATTRIBUTION, PROBABILITY, AND CAUSALITY

To prevent cognitive errors in clinical decision-making, the system must maintain clear linguistic and mathematical distinctions:

```
+--------------------------+------------------------------------------------+-------------------------------------------------+
| Concept                  | Correct Definition                             | Common Misconception to Avoid                   |
+--------------------------+------------------------------------------------+-------------------------------------------------+
| **Feature Attribution**  | Marginal mathematical shift in model log-odds. | "This factor adds 12% to my diabetes risk."     |
| **Disease Probability**  | Calibrated population posterior risk $P(Y=1|X)$.| "The sum of all feature bars equals my score." |
| **Causal Importance**    | Treatment effect under clinical intervention.  | "If I lower this bar, my risk drops by X."     |
+--------------------------+------------------------------------------------+-------------------------------------------------+
```

### Key Safety Warnings for Patient Communication:
- **SHAP values are not causal treatment targets:** If a patient's highest SHAP factor is `Age` or `Pulse Pressure`, an explanation must not imply that pharmacological lowering of pulse pressure alone reverses disease propensity.
- **Attributions cannot explain missing data:** If a value was imputed, the explanation reflects the model's response to the imputation surrogate, not the patient's actual physiology.

---

## 6. RECOMMENDATIONS FOR FUTURE PHASES

1. **True Linear SHAP for Cardiovascular Model:**  
   Replace `np.abs(model.coef_)` with standard linear SHAP:
   $$\phi_j(x) = \beta_j \cdot \left(\frac{x_j - \mu_j}{\sigma_j}\right)$$
   so that each patient receives personalized positive and negative risk drivers.
2. **Terminate Pima Feature Importance Display:**  
   Remove Pima feature importance charts immediately to prevent displaying target-leakage-driven insulin weights.
3. **Standardize UI Nomenclature:**  
   Ensure that static global weights are labeled *"General Model Weights"* and only true patient-specific decompositions are labeled *"Personalized Factor Breakdown (SHAP)"*.
