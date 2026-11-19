# Phase 06B.1 — DiaBD Calibration Independent Audit
**TriNexus | VitaGuard AI — Clinical Machine Learning Division**  
**Audit Date:** November 10, 2026  
**Auditor:** Independent Biostatistician & Clinical ML Validator  
**Focus:** Verification of Out-of-Fold Calibration Pipeline & Statistical Claims  

---

## 1. Audit Overview & Verification Protocol

This audit independently inspects the Python code, serialized estimators, and empirical outputs of the DiaBD probability calibration experiment conducted in `ML_Research/Phase06B/DiaBD/diabd_calibration_experiment.py` and saved to `diabd_calibration_results.json` and `Artifacts/diabd_research_calibrators.pkl`.

---

## 2. Granular 10-Point Technical Verification

### Point 1: How Out-of-Fold (OOF) Predictions Were Generated
- **Code Inspection:** In `diabd_calibration_experiment.py` (lines 111–114):
  ```python
  cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
  oof_raw_probs = cross_val_predict(base_xgb, X_train, y_train, cv=cv, method="predict_proba", n_jobs=-1)[:, 1]
  ```
- **Auditor Evaluation:** `cross_val_predict` partitions `X_train` ($N = 4,095$) into 5 stratified folds. For each fold $k \in \{1,\dots,5\}$, a fresh clone of `base_xgb` is fitted on the remaining 4 folds ($N \approx 3,276$) and evaluated on the held-out fold ($N \approx 819$).
- **Status:** **VERIFIED**

---

### Point 2: Whether Every OOF Observation Came from an Unseen Model
- **Statistical Evaluation:** By mathematical design of scikit-learn's `cross_val_predict` with `StratifiedKFold`, each observation $i \in \text{Fold}_k$ is predicted exclusively by the estimator fitted on folds $\{1,\dots,5\} \setminus \{k\}$. No sample's features or label were present in the training set of the model predicting it.
- **Status:** **VERIFIED**

---

### Point 3: Whether Calibrator Was Fitted Exclusively on OOF Predictions
- **Code Inspection:** In `diabd_calibration_experiment.py` (lines 121–128):
  ```python
  oof_raw_probs_clipped = np.clip(oof_raw_probs, eps, 1 - eps)
  oof_logits = np.log(oof_raw_probs_clipped / (1 - oof_raw_probs_clipped)).reshape(-1, 1)

  platt_calibrator = LogisticRegression(solver="lbfgs", max_iter=1000, random_state=42)
  platt_calibrator.fit(oof_logits, y_train)

  iso_calibrator = IsotonicRegression(out_of_bounds="clip", y_min=0.0, y_max=1.0)
  iso_calibrator.fit(oof_raw_probs, y_train)
  ```
- **Auditor Evaluation:** The calibrator inputs are `oof_logits` and `y_train`. The test set `X_test` and `y_test` were strictly absent from the `.fit()` call.
- **Status:** **VERIFIED**

---

### Point 4: Whether Final Test Set Remained Untouched Until Final Evaluation
- **Code Inspection:** Split performed in line 85:
  ```python
  X_train, X_test, y_train, y_test = train_test_split(
      X, y, test_size=0.20, random_state=42, stratify=y
  )
  ```
- **Auditor Evaluation:** `X_test` ($N=1,024$) was used only at line 134:
  `test_raw_probs = base_xgb.predict_proba(X_test)[:, 1]`
  after all calibrator and base model training routines were completed.
- **Status:** **VERIFIED**

---

### Point 5: Distribution Compatibility Between OOF and Test Sets
- **Empirical Measurement:**  
  The auditor reproduced and compared summary statistics between the OOF training predictions and the test set predictions:
  - *OOF Raw Predictions (Train, $N=4,095$):* Mean = 38.65%, Std = 0.218, Median = 36.82%
  - *Base Model Test Predictions ($N=1,024$):* Mean = 38.72%, Std = 0.216, Median = 36.91%
  - *Calibrated Platt Test Predictions ($N=1,024$):* Mean = 6.47%, Std = 0.0467, Median = 5.16%
  - *Calibrated Platt Range:* Min = 0.85%, Max = 25.14% (99th percentile = 19.33%)
- **Auditor Evaluation:** The training fold models (4/5ths data) and full base model produce nearly identical distribution parameters. Both match within 0.07 percentage points.
- **Status:** **VERIFIED**

---

### Point 6: Whether Calibration Metrics Were Calculated on Untouched Test Set
- **Code Inspection:** Lines 202–204:
  `eval_uncalibrated = evaluate_calibration("Uncalibrated_XGBoost_Baseline", y_test, test_raw_probs)`
  `eval_platt = evaluate_calibration("Platt_Sigmoid_Calibrated", y_test, test_platt_probs)`
- **Auditor Evaluation:** Metrics were evaluated strictly on the 1,024 test instances.
- **Status:** **VERIFIED**

---

### Point 7: Whether Null Brier Benchmark Uses Correct Test Prevalence
- **Empirical Check:** In test set ($N=1,024$), there are 65 positive cases:
  $$\text{Prevalence } \bar{y} = \frac{65}{1024} = 0.0634765625$$
  $$\text{Brier}_{\text{null}} = \bar{y}(1 - \bar{y}) = 0.0634765625 \times 0.9365234375 = \mathbf{0.059447}$$
- **Script Value:** `null_brier = round(float(np.mean(y_test) * (1 - np.mean(y_test))), 4) = 0.0594`.
- **Auditor Evaluation:** Correctly grounded in test prevalence.
- **Status:** **VERIFIED**

---

### Point 8: Calibration Slope and Intercept Estimation
- **Code Inspection:** Lines 180–184:
  ```python
  p_clip = np.clip(y_prob, 1e-6, 1 - 1e-6)
  logit = np.log(p_clip / (1 - p_clip)).reshape(-1, 1)
  lr_slope = LogisticRegression(solver="lbfgs", max_iter=1000)
  lr_slope.fit(logit, y_true)
  cal_slope = float(lr_slope.coef_[0][0])
  ```
- **Auditor Discovery:** In scikit-learn, `LogisticRegression` applies an L2 penalty by default (`C=1.0`). In biostatistical validation (TRIPOD guidelines), calibration slope $\beta$ must be estimated via **unregularized** logistic regression ($\text{penalty}=\text{None}$ or $C=\infty$):
  - *Reported with L2 ($C=1.0$):* $\text{Slope} = \mathbf{0.9840}$, $\text{Intercept} = \mathbf{-0.0593}$
  - *Independent Unregularized ($C=\infty$):* $\text{Slope} = \mathbf{1.0177}$, $\text{Intercept} = \mathbf{+0.0223}$
- **Auditor Evaluation:** While unregularized regression is the rigorous standard, both yield values exceptionally close to the ideal ($1.0000$ and $0.0000$). The L2 regularization introduced negligible shrinkage due to sample size ($N=1,024$).
- **Status:** **VERIFIED WITH LIMITATIONS**

---

### Point 9: ECE Binning, Bin Counts, and Uncertainty
- **Code Inspection:** 10 equal-width bins in $[0, 1]$ were used.
- **Auditor Findings:**
  - Bin 1 ($[0.0, 0.1]$): $N = 799$, Mean Pred = $4.41\%$, Observed = $4.38\%$ (Diff = $0.03\%$)
  - Bin 2 ($[0.1, 0.2]$): $N = 218$, Mean Pred = $13.46\%$, Observed = $12.39\%$ (Diff = $1.07\%$)
  - Bin 3 ($[0.2, 0.3]$): $N = 7$, Mean Pred = $23.60\%$, Observed = $42.86\%$ (Diff = $19.26\%$)
  - Bins 4–10 ($[0.3, 1.0]$): $N = 0$ (Completely empty)
- **Auditor Evaluation:** Equal-width binning in low-prevalence screening produces sparsely populated upper bins. Equal-frequency (quantile) binning would provide more granular resolution in the $0.01$–$0.15$ range. However, all counts and bootstrap confidence intervals ($[0.0021, 0.0089]$) are fully documented.
- **Status:** **VERIFIED WITH LIMITATIONS**

---

### Point 10: The Reported 70.2% Relative Brier Improvement Claim
- **Audit Verification of Math:**
  $$\text{Relative Reduction vs. Uncalibrated Model} = \frac{0.1920 - 0.0572}{0.1920} \times 100\% = \mathbf{70.21\%}$$
  $$\text{Brier Skill Score vs. Null Prevalence Baseline} = \left( 1 - \frac{0.0572}{0.0594} \right) \times 100\% = \mathbf{+3.70\%}$$
- **Auditor Finding:** The original report described this metric as *"beating null Brier 0.0594 by 70.2% relative error reduction"*. This claim was technically conflated. The Platt calibrator beats the uncalibrated model by 70.21%, and beats the null baseline by +3.70%.
- **Status:** **VERIFIED WITH LIMITATIONS**

---

## 3. Summary of Independent Metric Reproduction Table

| Parameter / Metric | Original Claim | Independently Reproduced Value | Discrepancy | Audit Verdict |
| :--- | :--- | :--- | :--- | :--- |
| **Uncalibrated Mean Score** | 38.72% | 38.72% | 0.00% | **VERIFIED** |
| **Calibrated Mean Score** | 6.47% | 6.47% | 0.00% | **VERIFIED** |
| **Test Event Prevalence** | 6.35% | 6.35% | 0.00% | **VERIFIED** |
| **Calibration Gap** | +0.12% | +0.12% | 0.00% | **VERIFIED** |
| **Uncalibrated Brier Score** | 0.1920 | 0.1920 | 0.0000 | **VERIFIED** |
| **Platt Brier Score** | 0.0572 | 0.0572 | 0.0000 | **VERIFIED** |
| **Null Brier Benchmark** | 0.0594 | 0.0594 | 0.0000 | **VERIFIED** |
| **Platt ECE** | 0.0038 | 0.0038 | 0.0000 | **VERIFIED** |
| **Calibration Slope (L2, C=1.0)**| 0.9840 | 0.9840 | 0.0000 | **VERIFIED** |
| **Calibration Slope (Unregularized)**| *Not reported* | 1.0177 | +0.0337 | **VERIFIED (STANDARD)** |
| **AUROC (Discrimination)** | 0.7059 | 0.7059 | 0.0000 | **VERIFIED** |
| **Rel. Brier Drop vs. Uncalibrated**| 70.2% | 70.21% | +0.01% | **VERIFIED** |
| **Rel. Brier Drop vs. Null** | *Claimed 70.2%*| 3.70% (BSS) | -66.50% | **CORRECTED** |

---

## 4. Conclusion on DiaBD Calibration Validity

The DiaBD Out-of-Fold Platt Sigmoid calibration pipeline is **methodologically sound, mathematically verified, and free of data leakage**. The calibrator successfully eliminates the 32 percentage point overconfidence gap while preserving 100% of the model's discriminative ranking power (AUROC 0.7059).
