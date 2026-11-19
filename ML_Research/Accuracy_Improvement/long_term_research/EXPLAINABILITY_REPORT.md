# Explainability

No candidate cleared the training rule, so no new explainer was prepared for promotion.

Standardized logistic coefficients on the DiaBD training rows:

| feature | standardized_coefficient |
| --- | --- |
| age | 0.4131 |
| sex | 0.0539 |
| bmi | 0.3073 |
| systolic_bp | 0.1535 |
| diastolic_bp | 0.2646 |
| family_diabetes | -0.0474 |
| pulse_pressure | 0.0071 |
| high_bp | 0.1868 |

Mean absolute SHAP on 120 training rows of the published-config XGBoost refit. This is not a cause and not a clinical proof.

| feature | mean_abs_shap_on_120_training_rows |
| --- | --- |
| age | 0.4424 |
| diastolic_bp | 0.336 |
| systolic_bp | 0.2917 |
| bmi | 0.2612 |
| pulse_pressure | 0.0919 |
| high_bp | 0.0533 |
| sex | 0.0192 |
| family_diabetes | 0.0027 |

A coefficient or a SHAP value does not prove that the feature causes diabetes, and it does not make the score a diagnosis.