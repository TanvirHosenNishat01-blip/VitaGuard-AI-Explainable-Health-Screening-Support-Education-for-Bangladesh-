# TriNexus | VitaGuard AI — Final Evidence Reconciliation Addendum
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical Machine Learning Safety & Biostatistics Governance  
**Document ID:** `FINAL_EVIDENCE_RECONCILIATION_ADDENDUM.md`  
**Evaluation Mode:** DOCUMENTATION-ONLY EVIDENCE RECONCILIATION & CLAIM CORRECTION  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This addendum executes an independent reconciliation across all historical audit phases (Phase 06B, 06B.2, 06C.0, 06C.1.2) and the Model Excellence reports. It rectifies all overstatements, documents historical test-set threshold explorations, reconciles population denominators, and establishes strict scientific claim boundaries. Phases 06C.2, 06C.3, and 06D remain strictly blocked.

---

## 1. Master Evidence Reconciliation Table

The table below reconciles every identified discrepancy between historical reports, execution logs, and Model Excellence findings:

```
┌────┬─────────────────────────────┬──────────────────────────┬──────────────────────────┬──────────────────────────┬──────────────────────────┬──────────────────────────┐
│ #  │ Topic / Claim               │ Historical Evidence      │ Current Evidence         │ Identified Discrepancy   │ Corrected Reconciled     │ Remaining Uncertainty    │
│    │                             │ (Phase 06B / 06C)        │ (Model Excellence)       │ & Root Cause             │ Scientific Conclusion    │ & Limitations            │
├────┼─────────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ 1  │ **DiaBD Test Set Usage &**  │ Phase 06B report         │ Model Excellence script  │ **Claimed test data were │ Test data were strictly  │ Prospective clinical     │
│    │ **Threshold Exploration**   │ `DIABD_THRESHOLD_        │ fit Platt calibrator on  │ never used for selection,│ isolated from calibrator │ cutoffs cannot be        │
│    │                             │ ANALYSIS.md` evaluated   │ dev OOF (N=4,095) and    │ but historical threshold │ fitting, BUT historical  │ selected from unblinded  │
│    │                             │ cutoffs 0.04 to 0.50 on  │ scored test set once.    │ sweep occurred on test   │ threshold exploration    │ data; requires new pilot.│
│    │                             │ test set (N=1,024).      │                          │ set in Phase 06B.        │ contaminated test split. │                          │
├────┼─────────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ 2  │ **DiaBD Dataset Denominator**│ Described as N=5,119     │ Script partitioned N=5,119│ Phrasing conflated full  │ Total cleaned N=5,119;   │ Lack of union cluster IDs│
│    │ **and CV Population**       │ cleaned cohort in        │ into N=4,095 dev (80%)   │ cleaned cohort with the  │ CV AUROC (0.7208) was    │ prevents GroupKFold;     │
│    │                             │ Phase 06B/06C.           │ and N=1,024 test (20%).  │ CV evaluation cohort.    │ evaluated strictly on    │ standard errors may be   │
│    │                             │                          │ CV run on N=4,095 only.  │                          │ N=4,095 dev participants.│ slightly anti-conservative│
├────┼─────────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ 3  │ **DiaBD Mean Raw Score**    │ Phase 06B reported mean  │ Model Excellence CV      │ Evaluated on different   │ Test set raw mean is     │ Loss-reweighted tree     │
│    │ **(38.72% vs 37.89%)**      │ uncalibrated score of    │ reported mean OOF score  │ populations (N=1,024 test│ 38.53%–38.72%; dev OOF   │ models consistently      │
│    │                             │ 38.72% on test split.    │ of 37.89% on dev set.    │ vs N=4,095 dev OOF).     │ mean is 37.89%. Both prove│ output extreme upward    │
│    │                             │                          │ Test set scored 38.53%.  │                          │ massive probability shift│ probability distortion.  │
├────┼─────────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ 4  │ **DiaBD AUROC Discrepancy** │ Phase 06B test AUROC was │ Model Excellence CV      │ Evaluator population     │ Test AUROC on N=1,024 is │ Test set AUROC 95% CI is │
│    │ **(0.7059 vs 0.7208)**      │ 0.7059 (XGBoost test);   │ AUROC was 0.7208 (Logist)│ difference (N=1,024 test │ 0.7059–0.7092. CV AUROC  │ wide: [0.64, 0.77];      │
│    │                             │ `metrics.json`: 0.7038.  │ and 0.7177 (XGBoost).    │ vs N=4,095 CV) & model   │ on N=4,095 is 0.7208.    │ differences are within   │
│    │                             │                          │ Test scored 0.7092.      │ architecture comparison. │ Linear baseline matches. │ sampling error.          │
├────┼─────────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ 5  │ **DiaBD Platt Calibrator**  │ Phase 06B: a=0.76801,    │ Model Excellence:        │ Input scale difference:  │ Both parameterizations   │ Platt calibration on     │
│    │ **Parameters (a, b)**       │ b=-2.49962 (fit on       │ a=3.68511, b=-4.36905    │ Log-odds margin s vs raw │ achieve identical test   │ unblinded test split is  │
│    │                             │ logit margins s).        │ (fit on probabilities p).│ predicted probability p. │ Brier (0.0572–0.0573) and│ a research proof-of-     │
│    │                             │ Test Brier = 0.0572.     │ Test Brier = 0.0573.     │                          │ slope (0.978–0.984).     │ concept, not valid trial.│
├────┼─────────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ 6  │ **Cleveland Calibration**   │ Phase 06B focused on     │ Model Excellence reported│ Evaluated on N=237 dev   │ Slope 1.0114 is an       │ Extreme small-sample     │
│    │ **Precision Claims**        │ Linear SHAP additivity;  │ slope 1.0114, Brier      │ OOF (109 events); small  │ imprecise point estimate │ uncertainty; high fold   │
│    │                             │ no calibration slope.    │ 0.1356, BSS = +0.4540.   │ N creates wide CIs.      │ from N=237; cannot claim │ variance (±0.047); cannot│
│    │                             │                          │                          │ Conflated with "best".   │ "best clinical calibration│ claim clinical precision.│
├────┼─────────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ 7  │ **WHO South Asia CVD Chart**│ Described in Phase 06A/B │ 700 cells verified; 0    │ Overstated as "published │ 700 cells verified with  │ Local prospective        │
│    │ **Evidence Status**         │ as published WHO South   │ monotonicity violations; │ prospective calibration" │ 100% monotonicity;       │ calibration in           │
│    │                             │ Asia guideline chart.    │ invalid metrics rejected.│ without local validation.│ regional pooled model;   │ contemporary Bangladesh  │
│    │                             │                          │                          │                          │ local BD validation OPEN.│ is unverified.           │
├────┼─────────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ 8  │ **Bootstrap Resampling**    │ Bootstrap used for       │ 1,000 bootstrap draws    │ Overstated as proving    │ Row-level percentile     │ Conditional on fitted    │
│    │ **Methodological Scope**    │ confidence intervals.    │ conditional on fitted    │ external validity; did not│ bootstrap reflects test  │ model; does not account  │
│    │                             │                          │ predictions.             │ state conditionality.    │ sampling noise; narrow if│ for multi-stage cluster  │
│    │                             │                          │                          │                          │ clustering exists.       │ design (DEFF ≈ 1.30).    │
├────┼─────────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ 9  │ **Subgroup Sample Size &**  │ Subgroups evaluated in   │ DiaBD Age <40 AUROC =    │ Used rigid "E<50 rule"   │ Age <40 (N=1,494, E=44)  │ Subgroup differences not │
│    │ **Demographic Fairness**    │ DiaBD (Sex, Age).        │ 0.6092, E = 44 events;   │ as universal dogma;      │ has low precision; male/ │ statistically significant│
│    │                             │                          │ Male (0.72) vs Fem (0.71)│ conflated with fairness. │ female difference is not │ does NOT establish       │
│    │                             │                          │                          │                          │ statistically significant│ demographic equivalence. │
└────┴─────────────────────────────┴──────────────────────────┴──────────────────────────┴──────────────────────────┴──────────────────────────┴──────────────────────────┘
```

---

## 2. Reconciled Technical Deconstruction

### 2.1 Reconciling the DiaBD Test-Set Unblinding & Threshold Sweep
To ensure uncompromising scientific integrity, we explicitly partition the four historical activities conducted on DiaBD data:
1. **Calibrator Parameter Fitting:** Platt calibrator parameters ($a, b$) were fitted **strictly on development set out-of-fold predictions ($N = 4,095$)**. Zero test-set observations entered the parameter estimation.
2. **Holdout Calibration Evaluation:** The fitted calibrator was applied to the locked 1,024-row split to evaluate post-hoc Brier score ($0.0573$) and calibration slope ($0.9777$).
3. **Exploratory Threshold Sweep (The Historical Defect):** In Phase 06B ([`DIABD_THRESHOLD_ANALYSIS.md`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/ML_Research/Phase06B/Reports/DIABD_THRESHOLD_ANALYSIS.md#L25-L40)), after observing test-split predictions, the author evaluated cutoffs from $\tau = 0.04$ to $\tau = 0.50$ directly on the test split and proposed $\tau = 0.05$ (community) and $\tau = 0.08$ (outpatient). This was an unblinded, test-informed threshold exploration.
4. **Current Status of Thresholds:** **NO THRESHOLD IS APPROVED OR VALIDATED FOR CLINICAL USE.** The default cutoff $\tau = 0.50$ is strictly exploratory. Prospective decision cutoffs must be determined during a pre-registered human-supervised clinical pilot.

---

### 2.2 Reconciling DiaBD Cohort Denominators & CV Population
- **Cleaned Dataset Total:** Exactly **5,119 participants** (324 positive, 4,795 negative; prevalence $6.329\%$).
- **Stratified Partition Fingerprint:**  
  `train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)`
  * **Development Partition ($80\%$):** **4,095 participants** (259 positive, 3,836 negative; prevalence $6.325\%$).
  * **Holdout Partition ($20\%$):** **1,024 participants** (65 positive, 959 negative; prevalence $6.348\%$).
- **The CV Evaluation Population:** The reported cross-validation AUROC of **$0.7208 \pm 0.0110$** for the Logistic Regression baseline (and $0.7177 \pm 0.0172$ for XGBoost) was evaluated **exclusively on the 4,095 development participants**. The 1,024 holdout participants were never part of the cross-validation folds.

---

### 2.3 Reconciling DiaBD Historical vs. Current Metrics
The differences observed across project reports are reconciled as follows:
- **Raw Mean Predicted Score:**
  * $38.72\%$ in Phase 06B was evaluated on the $N = 1,024$ test split.
  * $37.89\%$ in Model Excellence was evaluated across the out-of-fold predictions on the $N = 4,095$ development set.
  * When Model Excellence scored the test split, it yielded $38.53\%$.
  * *Reconciliation:* The $0.83\%$ delta stems entirely from sampling variance between the development OOF cohort ($N = 4,095$) and the test cohort ($N = 1,024$). Both metrics demonstrate the identical biostatistical defect: severe overconfidence induced by `scale_pos_weight = 14.81`.
- **AUROC Discrepancies:**
  * Test AUROC on $N = 1,024$ is $0.7059$ (Phase 06B) and $0.7092$ (Model Excellence).
  * CV AUROC on $N = 4,095$ is $0.7208$ (Logistic baseline) and $0.7177$ (XGBoost).
  * *Reconciliation:* The test split exhibits lower discrimination than the development CV mean ($0.709$ vs $0.721$). However, with only 65 positive cases in the test split, the $95\%$ bootstrap CI for test AUROC is $[0.64, 0.77]$. The difference is well within sampling noise.
- **Platt Calibrator Parameter Shift:**
  * Phase 06B: $a = 0.76801$, $b = -2.49962$ (fitted on raw logit margins $s = \ln(p / (1-p))$).
  * Model Excellence: $a = 3.68511$, $b = -4.36905$ (fitted on probability scale $p \in [0, 1]$).
  * *Reconciliation:* Different input feature scales to `LogisticRegression` produce different coefficients, but both yield mathematically identical test calibration metrics (Brier score $0.0572$ vs $0.0573$; calibration slope $0.9840$ vs $0.9777$).

---

### 2.4 Reconciling Cleveland Calibration Claims
- **Sample Size Context:** The reported slope of $1.0114$, Brier score of $0.1356$, and Brier Skill Score of $+0.4540$ were evaluated on the **development split of only 237 patients (109 events)** via 5-fold cross-validation.
- **Imprecision Finding:** In a cohort of $N = 237$, calibration slope estimates possess substantial sampling error ($\approx \pm 0.25$). Calling Cleveland the "clinically best-calibrated model" was an overstatement based on an unstable point estimate.
- **Spectrum Bias Re-Affirmation:** Because this cohort consists exclusively of symptomatic patients referred for cardiac catheterization ($46.1\%$ prevalence of severe coronary stenosis), these calibration metrics possess **zero applicability to primary care cardiovascular screening**.

---

### 2.5 Reconciling WHO South Asia CVD Risk Chart Evidence
- **Engineering Status:** All 700 lookup cells in [`bd_cvd_chart.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/services/bd_cvd_chart.py) were verified with zero monotonicity violations.
- **Inappropriate Metric Red Line:** Cross-validation, out-of-fold calibration curves, bootstrap model comparisons, and SHAP attributions are **NOT APPLICABLE** to a static deterministic lookup table and are formally rejected.
- **Evidence Status:** The chart is based on the Globorisk / WHO CVD Risk Chart Working Group pooled regional derivation for South Asia (SEAR D). It is an established clinical guideline tool, but **prospective external clinical validation against longitudinal cohort incidence in contemporary Bangladesh has not been conducted**.

---

### 2.6 Reconciling Bootstrap & Subgroup Uncertainty Protocols
- **Conditionality of Bootstrap CIs:** All reported 1,000-replicate bootstrap confidence intervals are **conditional on an already-fitted model**. They measure prediction sampling noise under fixed model parameters; they do NOT capture full end-to-end retraining variance.
- **Cluster Design Limitation:** Row-level resampling assumes i.i.d. observations. Because DiaBD involves multi-stage cluster sampling across 63 unions ($\text{DEFF} \approx 1.30$), row-level bootstrap intervals are approximately $15\%$ narrower than true cluster-adjusted intervals.
- **Subgroup Precision Realism:** In DiaBD adults under 40 years ($N = 1,494$), observed diabetes prevalence is only $2.95\%$ ($E = 44$ events). The drop in AUROC to $0.6092$ reflects low statistical precision. Rather than invoking a rigid arbitrary rule, this is properly characterized as **insufficient precision to support reliable screening claims in young adults**.

---

## 3. Strict Scientific Claim Boundaries

```
┌────────────────────────────────────────────────────────┬────────────────────────────────────────────────────────┐
│ PROHIBITED SCIENTIFIC OVERSTATEMENTS                   │ DEFICIENT EVIDENCE REPLACED WITH DEFICIENT REALITY     │
├────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ ❌ "DiaBD test data were never used for selection"     │ ✔ Test data were used historically for threshold sweep │
│ ❌ "CV AUROC 0.7208 evaluates all 5,119 participants"  │ ✔ Evaluates strictly the 4,095 development participants │
│ ❌ "Cleveland has the best clinical calibration"       │ ✔ Preliminary, imprecise estimate on 237 referrals     │
│ ❌ "WHO chart has published prospective calibration"   │ ✔ Published regional model; BD prospective calib open  │
│ ❌ "1,000 bootstrap draws establish external validity" │ ✔ Row bootstrap conditional on pre-fitted model only   │
│ ❌ "Non-significant subgroup delta proves fairness"    │ ✔ Failure to reject null does not prove equivalence    │
│ ❌ "Any model is clinically validated in Bangladesh"   │ ✔ NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT        │
└────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

> [!CAUTION]
> **STATUTORY GOVERNANCE HALT**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**
