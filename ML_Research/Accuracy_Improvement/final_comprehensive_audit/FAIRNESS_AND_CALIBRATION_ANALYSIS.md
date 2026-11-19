# Fairness and calibration

This is not a completed fairness audit. The DiaBD file has sex and age. It does not have ethnicity, income, disability, or site.

Training out-of-fold recall at cutoff 0.51 is about 0.32 for ages 21–40 and about 0.70 for ages 41–80. The young band has 53 positives. That is enough to see the gap and too little to tune a separate young-adult model.

Earlier training-fold calibration bins remain the right description: the top score bin had a mean prediction near 0.70 and an observed positive rate near 0.145. The production field is already named an uncalibrated screening score. Recalibrating it on these same rows would not create a new external test, and this audit does not change the cutoff.

Pima has no male rows. Cleveland is too small for a subgroup claim. The WHO chart has no outcome labels, so it has no subgroup accuracy.
