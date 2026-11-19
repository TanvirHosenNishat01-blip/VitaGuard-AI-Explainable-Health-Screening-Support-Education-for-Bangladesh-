# TriNexus | VitaGuard AI — Research Experimental Validation Protocol
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical Machine Learning Safety & Biostatistics Governance  
**Document ID:** `EXPERIMENTAL_VALIDATION_PROTOCOL.md`  
**Evaluation Mode:** PRE-REGISTERED RESEARCH VALIDATION PROTOCOL (DOCUMENTATION ONLY)  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This protocol specifies the mathematical, statistical, and engineering standards governing all research experiments conducted in the TriNexus isolated research workspace. It establishes strict partitions between model development, internal cross-validation, unblinded historical test splits, and independent external clinical validation. External clinical validation is currently **NOT AVAILABLE**.

---

## 1. Methodological Purpose & Epistemological Boundaries

To eliminate the risk of "metric gaming," p-hacking, and post-hoc rationalization, this protocol establishes a standardized experimental design framework adhering to the **TRIPOD+AI** (Transparent Reporting of a Multivariable Prediction Model for Individual Prognosis or Diagnosis — AI Version) and **PROBAST+AI** (Prediction Model Risk of Bias Assessment Tool) guidelines.

### Core Protocol Principles:
1. **Separation of Data Partitions:**
   - **Development Set:** Used strictly for model training, feature selection, hyperparameter tuning, and out-of-fold calibration.
   - **Internal Validation (Out-of-Fold):** Cross-validation predictions generated out-of-sample across development folds.
   - **Historical Unblinded Test Set:** Preserved for backward comparability; explicitly prohibited from serving as independent validation.
   - **External Validation:** Must originate from an independently recruited cohort at distinct geographic sites; currently **NOT AVAILABLE**.
2. **Transparent Baseline Rule:** Every complex or tree-based architecture (Random Forest, Extra Trees, XGBoost, HistGradientBoosting) must be benchmarked against an interpretable linear baseline (StandardScaler + LogisticRegression with L1/L2 regularization).
3. **Dual Metric Mandate:** Discrimination (AUROC, AUPRC) and Calibration (Brier score, BSS, CITL, Calibration slope) must ALWAYS be evaluated and reported together. A model with high AUROC but poor calibration is clinically hazardous.

---

## 2. Cross-Validation & Resampling Specifications

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        DATA PARTITIONING & RESAMPLING ARCHITECTURE                                     │
│                                                                                                        │
│                                   CANONICAL RAW DATASET                                                │
│                                             │                                                          │
│                            Stratified 80/20 Holdout Split (Seed 42)                                    │
│                                             │                                                          │
│                     ┌───────────────────────┴───────────────────────┐                                  │
│                     ▼                                               ▼                                  │
│            DEVELOPMENT COHORT                               LOCKED TEST SPLIT                          │
│               (80% Sample)                                    (20% Sample)                             │
│                     │                                               │                                  │
│           5-Fold Stratified CV                                      │                                  │
│      (Fitted Strictly Inside Folds)                                 │                                  │
│                     │                                               │                                  │
│       ┌─────────────┴─────────────┐                                 │                                  │
│       ▼                           ▼                                 │                                  │
│ Candidate Estimator       Out-of-Fold Probabilities                 │                                  │
│ Hyperparameter Tuning     (OOF Probabilities Vector)                │                                  │
│       │                           │                                 │                                  │
│       ▼                           ▼                                 │                                  │
│ Frozen Pipeline           Platt / Isotonic Calibrator               │                                  │
│ Refitted on 80% Dev       Fitted on (OOF Probs, Y_Dev)              │                                  │
│       │                           │                                 │                                  │
│       └─────────────┬─────────────┘                                 │                                  │
│                     │                                               │                                  │
│                     └───────────────────────┬───────────────────────┘                                  │
│                                             ▼                                                          │
│                                HISTORICAL BENCHMARK SCORING                                            │
│                              (Single Scored Evaluation Record)                                         │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Cross-Validation Protocol
- **Stratified K-Fold:** $K = 5$ splits, shuffled with fixed random seed ($\text{Seed} = 42$), stratified on the binary target.
- **Leakage-Free Execution:** In each fold, transformers (`SimpleImputer`, `StandardScaler`, `PolynomialFeatures`) are fitted exclusively on the $(K-1)$ training folds ($X_{\text{train\_fold}}$) and evaluated on the held-out validation fold ($X_{\text{val\_fold}}$).
- **Out-of-Fold (OOF) Vector:** A complete vector of out-of-fold predicted probabilities $\hat{p}_{\text{OOF}} \in [0, 1]^N$ is generated, where each participant's prediction is produced by a model that never saw that participant during training.

### 2.2 Bootstrap Resampling for Confidence Intervals
- **Method:** Non-parametric percentile bootstrap.
- **Replicates:** $B = 1,000$ bootstrap iterations.
- **Coverage:** Two-sided $95\%$ confidence interval ($2.5^{\text{th}}$ and $97.5^{\text{th}}$ percentiles).
- **Stratification Safeguard:** Resampling ensures at least one positive case is present in every bootstrap sample to maintain non-degenerate ROC calculations.

---

## 3. Mathematical Metric Definitions

### 3.1 Discrimination Metrics
1. **Area Under the Receiver Operating Characteristic Curve (AUROC):**
   $$\text{AUROC} = P(\hat{p}_i > \hat{p}_j \mid Y_i = 1, Y_j = 0)$$
   Measures rank-order discriminative capability across all potential decision thresholds.
2. **Area Under the Precision-Recall Curve (AUPRC / Average Precision):**
   $$\text{AUPRC} = \sum_k (R_k - R_{k-1}) P_k$$
   Essential for severely imbalanced cohorts (e.g., DiaBD prevalence $6.33\%$).

### 3.2 Calibration Metrics
1. **Brier Score (Mean Squared Probability Error):**
   $$\text{Brier} = \frac{1}{N} \sum_{i=1}^N (\hat{p}_i - Y_i)^2$$
2. **Null Prevalence Brier Benchmark ($\text{Brier}_{\text{null}}$):**
   $$\text{Brier}_{\text{null}} = \bar{Y} (1 - \bar{Y})$$
   The error achieved by a naive model that predicts the constant population prevalence for all individuals.
3. **Brier Skill Score (BSS):**
   $$\text{BSS} = 1 - \frac{\text{Brier}}{\text{Brier}_{\text{null}}}$$
   A negative BSS indicates that the model is **worse** than a null model predicting constant prevalence.
4. **Calibration-in-the-Large (CITL):**
   Intercept $\alpha$ from the logistic calibration curve $\text{logit}(Y) = \alpha + 1 \cdot \text{logit}(\hat{p})$. Measures whether the model systematically over- or under-predicts average risk.
5. **Calibration Slope ($\beta$):**
   Slope $\beta$ from the logistic regression $\text{logit}(Y) = \alpha + \beta \cdot \text{logit}(\hat{p})$.  
   $\beta = 1.0$ is perfect calibration; $\beta < 1.0$ indicates overconfidence/overfitting; $\beta > 1.0$ indicates underconfidence.
6. **Expected Calibration Error (ECE):**
   $$\text{ECE} = \sum_{m=1}^M \frac{|B_m|}{N} \left| \text{acc}(B_m) - \text{conf}(B_m) \right|$$
   Partitioned into $M = 10$ equal-width probability bins.

### 3.3 Diagnostic Performance at Specific Thresholds ($\tau$)
- **Sensitivity (True Positive Rate):** $\text{TPR} = \frac{\text{TP}}{\text{TP} + \text{FN}}$
- **Specificity (True Negative Rate):** $\text{TNR} = \frac{\text{TN}}{\text{TN} + \text{FP}}$
- **Positive Predictive Value (Precision):** $\text{PPV} = \frac{\text{TP}}{\text{TP} + \text{FP}}$
- **Negative Predictive Value:** $\text{NPV} = \frac{\text{TN}}{\text{TN} + \text{FN}}$
- **Positive Likelihood Ratio:** $\text{PLR} = \frac{\text{Sensitivity}}{1 - \text{Specificity}}$
- **Negative Likelihood Ratio:** $\text{NLR} = \frac{1 - \text{Sensitivity}}{\text{Specificity}}$

---

## 4. Subgroup Fairness & Demographic Protocol

For any pathway with recorded demographic indicators:
1. **Subgroup Stratification:**
   - **Sex:** Female vs. Male.
   - **Age Brackets:** $<40$ years, $40\text{--}59$ years, $\ge 60$ years.
2. **Evaluation Metrics:**
   - Subgroup prevalence, sample size, positive event count.
   - Subgroup AUROC with 95% bootstrap CI.
   - Subgroup mean predicted probability vs. observed event rate (calibration delta).
   - Subgroup Brier score.
3. **Reporting Caveats:**
   - A non-statistically significant difference between subgroups MUST NOT be interpreted or reported as proof of demographic equivalence.
   - Subgroups with $< 50$ positive events are flagged as **`INSUFFICIENT SAMPLE SIZE FOR STATISTICAL INFERENCE`**.

---

## 5. Protocol Execution Rules

| Phase | Activity | Permitted Operations | Prohibited Operations |
|---|---|---|---|
| **Phase I** | Baseline Benchmark | Fit transparent Logistic Regression on training folds | Silently modifying feature definitions |
| **Phase II** | Non-Linear Comparison | Evaluate Random Forest, Extra Trees, XGBoost, HistGradientBoosting | Optimizing hyperparameters against held-out test set |
| **Phase III** | OOF Calibration | Fit Platt and Isotonic calibrators on development OOF scores | Fitting calibrators on in-sample training predictions |
| **Phase IV** | Historical Benchmark | Evaluate champion pipeline once on locked test set | Modifying model weights after observing test results |
| **Phase V** | External Validation | Independent external dataset evaluation | Manufacturing "external" validation by random split |

---

> [!CAUTION]
> **STATUTORY GOVERNANCE HALT**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> External validation remains **NOT AVAILABLE** across all four pathways. Generalizability to external clinical populations is not established.
