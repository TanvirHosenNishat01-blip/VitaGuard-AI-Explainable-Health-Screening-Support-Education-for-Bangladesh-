# Phase 06B.1 — DiaBD Threshold Leakage & Operating Point Audit
**TriNexus | VitaGuard AI — Clinical Machine Learning Division**  
**Audit Date:** November 10, 2026  
**Auditor:** Independent Clinical AI Safety Auditor & Biostatistical Reviewer  
**Audit Object:** `DIABD_THRESHOLD_ANALYSIS.md` & `diabd_calibration_experiment.py`  

---

## 1. Executive Summary & Governance Concern

A critical responsibility of an independent validator is determining whether reported performance metrics at specific operational thresholds reflect genuine, unbiased prospective performance or post-hoc threshold selection on test data.

This audit evaluates the experimental provenance of the decision cutoffs ($\tau = 0.05, 0.08, 0.12$) reported in `DIABD_THRESHOLD_ANALYSIS.md` and calculates their true statistical status.

---

## 2. Forensic Investigation of Threshold Generation

### 2.1 Dataset Used to Sweep and Select Thresholds
- **Code Inspection:** In `ML_Research/Phase06B/DiaBD/diabd_calibration_experiment.py` (lines 260–294):
  ```python
  threshold_grid = [0.05, 0.08, 0.10, 0.12, 0.15, 0.20, 0.30, 0.40, 0.50, 0.60]
  for th in threshold_grid:
      platt_pred = (test_platt_probs >= th).astype(int)
      tn_p, fp_p, fn_p, tp_p = confusion_matrix(y_test, platt_pred, labels=[0, 1]).ravel()
      ...
  ```
- **Auditor Finding:** The threshold sweep was performed directly against `test_platt_probs` and `y_test`—which is the **final holdout test set** ($N = 1,024$).
- **Status:** **VERIFIED**

---

### 2.2 Post-Hoc Threshold Selection Analysis
- **Audit Question:** Were thresholds $\tau = 0.05, 0.08, 0.12$ chosen prior to unblinding the test set, or were they chosen after inspecting test results?
- **Forensic Evidence:**  
  1. No script exists in `ML_Research/Phase06B/` that optimized decision thresholds using training Out-Of-Fold (OOF) cross-validation predictions.
  2. The author computed the confusion matrix across the full grid on the sealed test set first, saved the test results to `diabd_calibration_results.json`, and then authored `DIABD_THRESHOLD_ANALYSIS.md` selecting $\tau = 0.05, 0.08, 0.12$ because they yielded favorable sensitivity/specificity pairs on that test set.
- **Biostatistical Evaluation:** Selecting operational thresholds based on the test set is a form of **test-set tuning leakage**. When cutoffs are selected post-hoc to maximize Youden's $J$ ($0.3102$ at $\tau=0.06$) or balance sensitivity/specificity ($60.0\% / 70.5\%$ at $\tau=0.08$), the reported test metrics are subject to selection bias and may overstate performance on future unseen cohorts.
- **Status:** **VERIFIED WITH LIMITATIONS (SELECTION LEAKAGE DETECTED)**

---

### 2.3 Metric Classification: Validation vs. Test
- **Evaluation:** Are the reported values (e.g. Sensitivity 78.5% at 0.05, 60.0% at 0.08) validation metrics or test metrics?
  - They were computed on the test set instances, making them test set measurements.
  - However, because the decision thresholds were chosen *after* inspecting those exact test set rows, they **cannot be considered unbiased test estimates**.
- **Mandatory Classification:** These metrics must be formally classified as **EXPLORATORY POINT ESTIMATES WITH POTENTIAL OPTIMISTIC SELECTION BIAS**.
- **Status:** **VERIFIED**

---

### 2.4 Availability of Confidence Intervals
- **Audit Finding:** In `diabd_calibration_results.json` and `DIABD_THRESHOLD_ANALYSIS.md`:
  - 95% bootstrap confidence intervals were computed for overall Brier score, ECE, and AUROC.
  - **Zero confidence intervals** were computed or reported for threshold-specific sensitivity, specificity, PPV, NPV, or Youden's Index.
- **Impact:** Point estimates such as Sensitivity = 60.00% (39 / 65) carry binomial sampling error ($\text{SE} = \sqrt{\frac{0.6 \times 0.4}{65}} \approx 6.08\%$, corresponding to a 95% CI of approximately $[48.1\%, 71.9\%]$). Omitting these intervals gives a false illusion of numerical precision.
- **Status:** **FAILED (OMITTED UNCERTAINTY)**

---

### 2.5 Clinical Decision Framework Support
- **Audit Question:** Are threshold recommendations supported by an explicit clinical decision framework?
- **Auditor Evaluation:**  
  `DIABD_THRESHOLD_ANALYSIS.md` presented clinical tiers based on intuitive healthcare operations (community health camps vs outpatient clinics vs laboratory scarcity). However:
  - No formal **Decision Curve Analysis (DCA)** was performed.
  - No quantitative net benefit calculation weighting the relative clinical harms of false positives vs. false negatives ($w = \frac{\tau}{1 - \tau}$) was conducted.
  - No clinical consensus panel or clinical trial protocol was cited.
- **Status:** **VERIFIED WITH LIMITATIONS**

---

## 3. Strict Auditor Governance Directives

1. **No Threshold Approval:**  
   The auditor explicitly declares that **NO decision threshold ($\tau = 0.05, 0.08, 0.12$, or any other) is approved for clinical production deployment**.
2. **No Selection of Replacement Thresholds:**  
   In compliance with Phase 06B.1 restrictions, the auditor has not re-tuned, selected, or substituted alternative thresholds on the test set.
3. **Requirement for Phase 06C:**  
   If Phase 06C is authorized, decision thresholds must be:
   - Established strictly using cross-validation training folds (or external validation datasets) prior to touching any prospective evaluation set.
   - Evaluated using Decision Curve Analysis (DCA) and reported with 95% confidence intervals.
   - Implemented in the user interface as adjustable clinical guidance sliders rather than hardcoded automated diagnosis barriers.
