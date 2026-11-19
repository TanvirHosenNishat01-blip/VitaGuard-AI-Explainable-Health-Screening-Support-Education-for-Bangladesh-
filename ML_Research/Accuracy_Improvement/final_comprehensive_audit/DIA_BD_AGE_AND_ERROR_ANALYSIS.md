# DiaBD age and error analysis

Locked test, n=1024, cutoff 0.51: true positives 38, false positives 290, false negatives 27, precision 0.1159, recall 0.5846.

Training out-of-fold, n=4095, same published configuration, same cutoff: false positives 1145, false negatives 96, precision 0.1246, recall 0.6293.

## Why precision is low

About 6.3 percent of clean rows have the diabetes label. A cutoff that catches a large share of those rows also flags many people without the label. Precision is true positives divided by all alarms. On the locked test that is 38 / (38 + 290) = 0.1159. Majority-class accuracy would be about 93.7 percent and would catch nobody.

## Age bands on training out-of-fold scores

- Ages 21_40: n=1796, positives=53, prevalence=0.0295, recall at 0.51=0.3208, precision=0.109, PR-AUC=0.0745, median score if positive=0.3205, median score if negative=0.2139, positives reaching 0.51=17.
- Ages 41_60: n=1756, positives=154, prevalence=0.0877, recall at 0.51=0.7013, precision=0.1257, PR-AUC=0.1636, median score if positive=0.6543, median score if negative=0.4858, positives reaching 0.51=108.
- Ages 61_80: n=543, positives=52, prevalence=0.0958, recall at 0.51=0.7308, precision=0.1297, PR-AUC=0.1586, median score if positive=0.6176, median score if negative=0.5201, positives reaching 0.51=38.

Ages 21–40 have prevalence 0.0295 and only 53 positives. Their median score when the label is positive is 0.3205, against 0.2139 when the label is negative. The global cutoff 0.51 is above the typical young positive score, so recall is 0.3208. Only 17 of 53 young positives reach that cutoff.

The within-band PR-AUC for ages 21–40 is 0.0745. That is the ranking inside the band, independent of the 0.51 cutoff. It stays close to a low base rate, so the gap is not only a cutoff sitting too high. The available non-lab features separate young labeled cases weakly.

The interaction model did not raise young-adult recall by the pre-registered 0.10 while holding false positives and PR-AUC. Pass=False.
