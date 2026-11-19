# Assessment purpose and limitations

The four pathways were not merged and their calculations were not changed.

## Bangladesh DiaBD

Why it is there: to show an uncalibrated screening index from the Bangladesh table, and to show the existing local TreeSHAP contributions.

What the person receives: the existing screening index, the existing tier, and the TreeSHAP view. The API returns `saved: false`.

Who it is for: someone entering age, sex, BMI, blood pressure, and family history.

What it cannot do: diagnose diabetes, replace a laboratory test, or provide a calibrated personal probability.

Status: Completed and already covered by the existing Bangladesh route. A live click of a new score was not repeated in this session.

## Pima

Why the file remains: it is the historical research model. The table is 768 women near Phoenix, aged 21 to 81. It is not a model for men, children, or patients in Bangladesh.

Patient and guest prediction: open again, with the cohort written on the page. The pathway stays because DiaBD does not read glucose, insulin, skin thickness, pregnancy count, or the pedigree score. A signed-in result can be saved. It is still not a diagnosis and not a Bangladesh model. The model file was not edited.

Status: Phase E expects `patient_access: allowed_with_stated_limits` and a 200 from a consented synthetic request.

## Cleveland

Why it is there: to show the existing historical catheterization model and its global coefficients.

What it cannot do: stand in for community screening or a heart-disease diagnosis. A feature coefficient is not a cause.

Status: The route and result card remain. A new score was generated only inside the presentation seed, by calling `predict_cardio` with synthetic inputs inside the existing ranges.

## WHO South Asia chart

Why it is there: to look up one published non-laboratory chart cell for ages 40 to 74. It is not a trained model. A previous heart attack or stroke is refused with 400.

Status: Unchanged lookup. Not re-clicked in this session.

## Comparison

`/assessment` shows the four pathways and a comparison table. The table does not recommend one pathway from a person's symptoms.

## Result pages

Cleveland and admin Pima results keep the existing score, band, and explanation type, and now say the number does not choose a disease, a medicine, or the next test. DiaBD already shows the calibration notice on its own page. No new threshold was added.
