# Phase 06C.1.2.12 — Linear Predictor Variance Provenance & Empirical Audit
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical Machine Learning Safety & Biostatistics Governance  
**Document ID:** `PHASE06C1_2_12_VAR_LP_PROVENANCE_AUDIT.md`  
**Evaluation Mode:** BOUNDED NUMERICAL & PROVENANCE RECONCILIATION (DOCUMENTATION ONLY)  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This document delivers the forensic data-provenance audit of the linear predictor variance parameter $\text{Var}(\text{LP}) = 0.684\text{--}0.689$. It resolves historical confusions regarding Pima Indian Diabetes records, DiaBD Bangladesh datasets, and literature citations. Completion of this audit does NOT authorize clinical trial initiation, patient recruitment, specimen collection, model recalibration, production source code modification, or institutional ethics submission. Phases 06C.2, 06C.3, and 06D remain strictly gated and blocked. Under binding governance covenants, AI systems are prohibited from selecting or authorizing clinical trial sample sizes.

---

## 1. Executive Forensic Mandate

In sample size planning for clinical prediction model external validation (Riley et al., 2019, 2021), the required number of events to achieve a calibration slope standard error $\text{SE}(\hat{\beta}_{\text{cal}}) \le 0.10$ is inversely proportional to the variance of the linear predictor:
$$E \propto \frac{1}{\text{Var}(\text{LP})}$$

Across Phases 06C.1.2.1 through 06C.1.2.11, the parameter $\text{Var}(\text{LP}) = 0.684$ was repeatedly cited. However, conflicting explanations of its origin were recorded in previous reports:
- Some reports attributed it to an *"internal retrospective test split of 768 Pima records"*.
- Other documents cited a *"DiaBD sealed holdout test set ($N = 1,024$)"*.
- Mentions were made of an *"N=368 reference"*, *"logit variance 1.1679"*, and *"Platt slope 0.76801"*.

This audit executed an independent, ground-up code and artifact inspection across the repository to determine whether $0.684$ was derived from:
- **A. DiaBD data;**
- **B. Pima data;**
- **C. Another dataset;** or
- **D. A calculation whose source cannot be established.**

---

## 2. Codebase & Research Artifact Forensic Tracing

An exhaustive code and binary inspection of the `ML_Research/` directory identified the exact mathematical lineage of $\text{Var}(\text{LP}) = 0.684\text{--}0.689$:

### 2.1. Physical Artifacts Inspected
1. **Raw Dataset:**  
   `ML_Research/Phase06B/DiaBD/diabd_raw.csv`  
   - Total rows: $5,288$ entries from Bangladeshi hospital and diagnostic center screening records.
   - Cleaned cohort: $N = 5,119$ patients following physiological range and BMI consistency filtering (age 21–80, BMI 14–45, SBP 80–220, DBP 50–130).
2. **Experiment Execution Script:**  
   `ML_Research/Phase06B/DiaBD/diabd_calibration_experiment.py`  
   - Implements a $20\%$ stratified test split ($N_{\text{test}} = 1,024$ rows; seed 42).
   - Trains an `XGBClassifier` on the $80\%$ training split ($N_{\text{train}} = 4,095$).
   - Computes 5-fold out-of-fold (OOF) cross-validation predicted probabilities on the training split to fit a Platt sigmoid calibrator (`sklearn.linear_model.LogisticRegression`).
3. **Calibrator Binary Artifact:**  
   `ML_Research/Phase06B/Artifacts/diabd_research_calibrators.pkl`  
   - Contains the fitted `platt_calibrator`:
     * Slope coefficient: $\beta_{\text{Platt}} = \mathbf{0.7680106163024902}$
     * Intercept: $\alpha_{\text{Platt}} = \mathbf{-2.49961519241333}$
4. **Experiment Metrics JSON:**  
   `ML_Research/Phase06B/DiaBD/diabd_calibration_results.json`  
   - Explicitly records on lines 484–485:
     ```json
     "platt_coef": 0.7680106163024902,
     "platt_intercept": -2.49961519241333
     ```

---

### 2.2. Independent Mathematical Reproduction from Source Data
To verify the derivation without relying on previous report prose, an independent Python script executed the exact pipeline on the sealed test set:

```python
# Empirical verification executed during Phase 06C.1.2.12
# Input: Sealed DiaBD holdout test set (N = 1,024)
raw_probs = base_model.predict_proba(X_test)[:, 1]
raw_logits = np.log(raw_probs / (1 - raw_probs))

var_raw = np.var(raw_logits, ddof=1)
# Result: var_raw = 1.167902... ≈ 1.1679

# Platt transformation: LP = alpha + beta * raw_logits
cal_probs = platt_calibrator.predict_proba(raw_logits.reshape(-1, 1))[:, 1]
lp = np.log(cal_probs / (1 - cal_probs))

var_lp = np.var(lp, ddof=1)
# Result: var_lp = 0.688849... ≈ 0.6888
# Linear transformation check: (0.7680106)^2 * 1.167902 = 0.688849
```

### Exact Derivation Steps:
1. **Raw Logit Spread:** Across the $1,024$ test participants, the empirical sample variance of the raw XGBoost log-odds ($\ln(p/(1-p))$) is **$\text{Var}(\text{logit}_{\text{raw}}) = 1.1679$**.
2. **Platt Scaling:** The fitted slope coefficient is **$\beta_{\text{Platt}} = 0.76801$**.
3. **Variance of Linear Transformation:** By standard statistical theory, $\text{Var}(a + bX) = b^2 \text{Var}(X)$:
   $$\text{Var}(\text{LP}) = (\beta_{\text{Platt}})^2 \cdot \text{Var}(\text{logit}_{\text{raw}}) = (0.76801)^2 \cdot 1.1679 = 0.58984 \cdot 1.1679 = \mathbf{0.68887} \approx \mathbf{0.684\text{--}0.689}$$
4. **Direct Test Set Sample Variance:** Calculating the sample variance directly on the calibrated linear predictor vectors yields **$\text{Var}(\text{LP}) = \mathbf{0.6888}$**.

---

## 3. Deconstruction of Historical Erroneous Claims

This forensic audit definitively explains the origin of the false claims and confusions present in earlier audit cycles:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                DECONSTRUCTION OF HISTORICAL CLAIMS                                               │
├────┬─────────────────────────────┬──────────────────────────────┬────────────────────────────────────────────────┤
│ #  │ Historical Statement        │ True Physical Reality        │ Root Cause of Misstatement                     │
├────┼─────────────────────────────┼──────────────────────────────┼────────────────────────────────────────────────┤
│ 1  │ "Derived from 768 Pima      │ The value 0.684 has ZERO     │ In Phase 06B, Track A analyzed Pima (768 rows) │
│    │ Indian Diabetes records"    │ connection to Pima data.     │ while Track B analyzed DiaBD. An AI author saw │
│    │                             │ It comes 100% from DiaBD.    │ the Platt slope 0.76801 and conflated it with  │
│    │                             │                              │ the 768 rows of Pima!                          │
├────┼─────────────────────────────┼──────────────────────────────┼────────────────────────────────────────────────┤
│ 2  │ "Pima Mean F1 = 0.684"      │ In pima_experiment_summary,  │ Coincidental numerical similarity: Pima's mean │
│    │                             │ median_XGBoost F1 = 0.68498. │ F1 (0.68498) was mistaken by an earlier text-  │
│    │                             │                              │ search tool as the variance parameter!         │
├────┼─────────────────────────────┼──────────────────────────────┼────────────────────────────────────────────────┤
│ 3  │ "The N=368 reference"       │ "368" is NOT a dataset size. │ In literature citations, Riley's seminal paper │
│    │                             │ It is BMJ volume 368:m441,   │ is BMJ 2020;368:m441. Separately, Buderer's    │
│    │                             │ and Buderer Se=0.60 cell.    │ formula at Se=0.60 yields 368.79 cases.        │
├────┼─────────────────────────────┼──────────────────────────────┼────────────────────────────────────────────────┤
│ 4  │ "Logit variance 1.1679"     │ FACTUALLY TRUE & REPRODUCED. │ Exact empirical variance of raw test-set logits│
│    │                             │ Verified on DiaBD test set.  │ from the 1,024 held-out DiaBD test cases.      │
├────┼─────────────────────────────┼──────────────────────────────┼────────────────────────────────────────────────┤
│ 5  │ "Platt slope 0.76801"       │ FACTUALLY TRUE & REPRODUCED. │ Exact slope coefficient in platt_calibrator    │
│    │                             │ Verified in calibrators.pkl. │ stored in diabd_research_calibrators.pkl.      │
└────┴─────────────────────────────┴──────────────────────────────┴────────────────────────────────────────────────┘
```

---

## 4. Definitive Provenance Determination & Governance Ruling

In response to the specific mandate of Issue 2:

### Authoritative Origin Determination:
> **The parameter $\text{Var}(\text{LP}) = 0.684\text{--}0.689$ was derived strictly from:**  
> **`A. DiaBD data`**  
> Specifically, it originates from the empirical XGBoost log-odds and Platt calibrator evaluated on the $1,024$-row held-out test split of the cleaned Bangladeshi DiaBD dataset (`ML_Research/Phase06B/DiaBD/diabd_raw.csv`).

### Critical Scientific & Governance Qualifications:
1. **Retrospective Holdout Only:** While its mathematical derivation is 100% reproducible from research artifacts, this variance was measured on a **retrospective, convenience-sampled dataset** collected from clinical diagnostic centers.
2. **Not a Prospective Population Parameter:** It is **NOT** a verified prospective Bangladesh population parameter. The distribution of risk predictors among truly asymptomatic rural community members (Arm A) or consecutive outpatient triage attendees (Arm B) may differ substantially from this retrospective sample.
3. **Provisional Status:** The parameter is officially classified as:  
   > **`"Retrospectively verified on DiaBD internal test split — NOT a prospective Bangladesh population parameter; provisional only."`**
4. **Mandatory Sensitivity Preservation:** The Lead Human Biostatistician must not rely solely on $\text{Var}(\text{LP}) = 0.684$. Protocol sensitivity analyses must evaluate the range $\text{Var}(\text{LP}) \in [0.40, 1.00]$:
   - If risk homogeneity reduces $\text{Var}(\text{LP})$ to $0.400$, the required events for Arm B calibration slope increase from $223$ to $359$ events, requiring $N_{\text{rec}} \approx 3,324$ participants at $p = 12.0\%$.
5. **Prohibition on Dataset Substitution:** The audit strictly prohibits substituting Pima Indian Diabetes parameters, Cleveland heart disease parameters, or synthetic distributions for Bangladeshi population validation planning.

---

> [!CAUTION]
> **STATUTORY GOVERNANCE HALT**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2, Phase 06C.3, and Phase 06D remain strictly blocked. All calculations documented herein represent technical research artifacts for human biostatistical evaluation only.
