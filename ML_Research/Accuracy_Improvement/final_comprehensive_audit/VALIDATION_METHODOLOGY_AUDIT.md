# Validation methodology audit

DiaBD and Pima use a stratified 80/20 split at seed 42, then 5-fold shuffled cross-validation on the training rows. Preprocessing for the new logistic and naive Bayes models is inside the fold. The published DiaBD test was scored once to confirm 290 false positives and 27 false negatives. It was not used to accept the interaction model or naive Bayes.

Cleveland's published 32/0/5/23 matrix was reproduced on the same split style. Repeated 5×10 training validation from the immediately previous research run remains the comparison. That 60-row test is not a selection set.

There is no visit date or clinic identifier, so a temporal or site split cannot be built from these files. Duplicate feature rows were counted and kept. Thresholds for the new fits were not searched; the comparison uses the existing 0.51 cutoff so a cutoff change is not mistaken for a better model.

Hyperparameter search was not reopened. The earlier searches already selected on training folds and did not clear their margins. Searching again on the same rows would reuse the same labels.
