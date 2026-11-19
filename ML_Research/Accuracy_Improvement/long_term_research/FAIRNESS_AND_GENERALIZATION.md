# Fairness and generalization

This is not a completed fairness audit. Ethnicity, disability, and income are not in these tables. Sex and age are reported only because they are already inputs, and only where the positive count is at least 20.

## DiaBD training out-of-fold at cutoff 0.51

- female: n=2850, positives=166, recall=0.5843, precision=0.1114, fp=774, fn=69.
- male: n=1245, positives=93, recall=0.7097, precision=0.151, fp=371, fn=27.
- age_21_40: n=1796, positives=53, recall=0.3208, precision=0.109, fp=139, fn=36.
- age_41_60: n=1756, positives=154, recall=0.7013, precision=0.1257, fp=751, fn=46.
- age_61_80: n=543, positives=52, recall=0.7308, precision=0.1297, fp=255, fn=14.

## Pima training out-of-fold logistic at cutoff 0.5

- age_under_40: n=446, positives=124, recall=0.6855, precision=0.6439, fp=47, fn=39.
- age_40_or_older: n=168, positives=90, recall=0.7778, precision=0.6306, fp=41, fn=20.

Pima contains only women aged 21 to 81 in the historical Phoenix-area table. It cannot support a claim about men, children, or patients in Bangladesh.

Cleveland has 237 training rows from a catheterization cohort. Sex-specific claims are not made here. The 60-row test is too small for subgroup conclusions.

The WHO chart is a published table for ages 40 to 74. Matching its cells is not a fairness study.