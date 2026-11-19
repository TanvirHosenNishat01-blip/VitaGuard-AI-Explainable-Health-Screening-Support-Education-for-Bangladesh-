# Data quality and leakage audit

## DiaBD

Clean rows {'rows': 5119, 'positives': 324, 'prevalence': 0.0633, 'missing_in_features': 0, 'exact_duplicate_rows': 3, 'conflicting_labels_for_same_features': 0}.
Glucose correlation with the label on training rows only: 0.2978. Glucose was not passed to any model.
Exact feature-pattern overlap between the training and locked-test splits, rounded to 5 decimals: 1. Rows were not silently deleted.
Pulse pressure is systolic minus diastolic. It is redundant with the blood-pressure inputs and is not derived from the label.
Imputation was unnecessary for the eight model fields. Scaling and the inner feature selector were fit inside each training fold.

## Pima

Canonical rows {'rows': 768, 'positives': 268, 'prevalence': 0.349, 'missing_in_features': 652, 'exact_duplicate_rows': 0, 'conflicting_labels_for_same_features': 0}.
Biological zeros in glucose, blood pressure, skin thickness, insulin, and BMI were set to missing before the split. Medians were fit inside each fold. Outcome-conditional fills were not used.

## Cleveland

Rows {'rows': 297, 'positives': 137, 'prevalence': 0.4613, 'missing_in_features': 0, 'exact_duplicate_rows': 0, 'conflicting_labels_for_same_features': 0}.
No model field is a copy of the condition label. The published 60-row matrix reproduced, which checks that this split matches the saved model.

## WHO

No labeled cohort is attached to the chart. There is no trainable leakage path because no model was trained.