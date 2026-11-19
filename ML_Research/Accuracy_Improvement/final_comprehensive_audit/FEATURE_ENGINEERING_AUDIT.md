# Feature engineering audit

DiaBD model inputs are age, sex, BMI, systolic pressure, diastolic pressure, family history, pulse pressure, and the high-blood-pressure flag. Pulse pressure is systolic minus diastolic. The high-blood-pressure flag is a cut of the same two pressures. Both are available at prediction time. They are redundant, not label leakage.

Glucose, pulse rate, hypertensive status, family hypertension, cardiovascular disease, and stroke stay out. Glucose is the strongest simple correlate (0.2978 on training rows) and is also tied to how diabetes is labeled. Putting it in this pathway would change the pathway into a lab-result screen.

No log transform is justified: age, BMI, and blood pressure are already on bounded clinical scales, and the tree model can split them. A training-fold logistic model with age×BMI, age×systolic, and BMI×systolic did not clear the pre-registered young-adult rule (pass=False). Overall out-of-fold counts at cutoff 0.51: {"n": 4095, "positives": 259, "tp": 167, "fp": 1228, "fn": 92, "tn": 2608, "recall": 0.6448, "precision": 0.1197}. Ages 21–40: {"n": 1796, "positives": 53, "tp": 13, "fp": 201, "fn": 40, "tn": 1542, "recall": 0.2453, "precision": 0.0607}.

Median imputation is unused for DiaBD because those eight fields are complete. Pima medians stay inside the training fold. Scaling is inside the logistic pipeline only.

Family history has a small negative logistic coefficient in the earlier training-row fit, and the positive class does not have a higher family-history rate in this split. It is a weak, possibly noisy field, not a reason to invent a new variable.
