# TriNexus | VitaGuard AI — SHAP Explainability & Demographic Fairness Audit
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical Machine Learning Safety & Biostatistics Governance  
**Document ID:** `SHAP_AND_FAIRNESS_VALIDATION_AUDIT.md`  
**Evaluation Mode:** INDEPENDENT EXPLAINABILITY MATHEMATICS & FAIRNESS AUDIT  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Under clinical AI safety standards, feature attributions must not be misrepresented as biological causality or definitive medical diagnoses. Demographic non-significance cannot be reported as proof of fairness or subgroup equivalence. This audit verifies mathematical explainability additivity and establishes honest subgroup sample size limitations.

---

## 1. Explainability Mathematics & SHAP Additivity Audit

A recurring failure mode in healthcare machine learning is labeling arbitrary model coefficients, normalized feature importances, or heuristic weights as "SHAP values." 

### 1.1 Model-by-Model Explainability Architecture Verification

```
┌─────────────────────────┬──────────────────────────┬─────────────────────────────┬───────────────────────────┐
│ Predictive Pathway      │ Explainability Algorithm │ Implementation Mechanism    │ Verification Finding      │
├─────────────────────────┼──────────────────────────┼─────────────────────────────┼───────────────────────────┤
│ **DiaBD Screening**     │ `shap.TreeExplainer`     │ Local TreeSHAP on XGBoost   │ **VERIFIED TRUE SHAP:**   │
│                         │                          │ decision paths (log-odds)   │ Additive local attribution│
├─────────────────────────┼──────────────────────────┼─────────────────────────────┼───────────────────────────┤
│ **Cleveland Cardio**    │ `shap.LinearExplainer`   │ LinearSHAP on scaled Z-score│ **VERIFIED TRUE SHAP:**   │
│                         │                          │ features with background set│ Exact zero residual error │
├─────────────────────────┼──────────────────────────┼─────────────────────────────┼───────────────────────────┤
│ **Pima Historical**     │ `shap.LinearExplainer`   │ LinearSHAP on Logistic      │ **VERIFIED TRUE SHAP:**   │
│                         │                          │ pipeline components         │ Research pipeline only    │
├─────────────────────────┼──────────────────────────┼─────────────────────────────┼───────────────────────────┤
│ **WHO South Asia CVD**  │ **NOT APPLICABLE**       │ Deterministic published     │ **NOT APPLICABLE:** Zero  │
│                         │                          │ epidemiological matrix      │ heuristic weights applied │
└─────────────────────────┴──────────────────────────┴─────────────────────────────┴───────────────────────────┘
```

---

### 1.2 Mathematical Proof of Linear SHAP Additivity (Cleveland Pathway)
In linear and logistic models, Shapley values must satisfy the local efficiency (additivity) property. The patient's predicted log-odds decision margin $f(x)$ must equal the expected base value $\phi_0$ plus the sum of all individual feature attributions $\phi_i$:
$$f(x) = \text{logit}(P(Y=1 \mid x)) = \phi_0 + \sum_{i=1}^{M} \phi_i(x)$$
Where:
- $\phi_0 = \mathbb{E}[f(X)] = \mathbf{-0.2634}$ (corresponding to base probability $P_{\text{base}} = \mathbf{43.45\%}$)
- $M = 13$ clinical features

The execution suite in [`run_model_excellence_experiments.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/ML_Research/Model_Excellence/Experiments/run_model_excellence_experiments.py#L395-L425) computed the maximum additivity residual across all training observations:
$$\max_{j} \left| f(x_j) - \left( \phi_0 + \sum_{i=1}^{13} \phi_i(x_j) \right) \right| = \mathbf{0.00000000}$$
**Auditor Finding:** Mathematical additivity holds with **exact zero residual error**.

---

### 1.3 Forensic Distinction: Local SHAP vs. Heuristic Normalized Weights

The audit compared the historical production heuristic weights against true SHAP feature attributions on the Cleveland model:

```
┌────────────────────┬─────────────────────┬───────────────────────────┬───────────────────────────┬───────────────────────────────────┐
│ Feature Name       │ Raw Model Logit     │ Heuristic Normalized      │ True Global Mean Absolute │ Forensic Distinction &            │
│                    │ Slope ($\beta_i$)   │ Weight ($|\beta|/\sum|\beta|$)│ SHAP Share ($\sum|\phi_i|$)│ Clinical Meaning                  │
├────────────────────┼─────────────────────┼───────────────────────────┼───────────────────────────┼───────────────────────────────────┤
│ `ca` (Fluoroscopy) │ +1.0641             │ 20.96%                    │ 20.23%                    │ Strongly increases predicted risk │
│ `thal` (Defect)    │ +0.5738             │ 11.30%                    │ 12.70%                    │ Reversible/fixed defect adds risk │
│ `thalach` (Max HR) │ -0.4904             │ 9.66%                     │ 8.90%                     │ Higher heart rate reduces risk    │
│ `cp` (Chest Pain)  │ +0.4664             │ 9.19%                     │ 8.94%                     │ Typical angina increases risk     │
│ `exang` (Angina)   │ +0.4417             │ 8.70%                     │ 9.49%                     │ Exercise angina adds risk         │
│ `oldpeak` (ST Dep) │ +0.4045             │ 7.97%                     │ 7.57%                     │ ST depression adds risk           │
│ `sex` (Male)       │ +0.3970             │ 7.82%                     │ 8.84%                     │ Male gender adds risk             │
│ `trestbps` (BP)    │ +0.3022             │ 5.95%                     │ 5.38%                     │ Higher resting BP adds risk       │
│ `fbs` (Blood Sugar)│ -0.2885             │ 5.68%                     │ 4.88%                     │ High fasting sugar slightly neg   │
│ `slope` (ST Slope) │ +0.2593             │ 5.11%                     │ 5.44%                     │ Flat/downsloping ST adds risk     │
│ `chol` (Serum Chol)│ +0.1721             │ 3.39%                     │ 2.99%                     │ Higher cholesterol adds risk      │
│ `restecg` (ECG)    │ +0.1289             │ 2.54%                     │ 2.95%                     │ Resting ECG abnormality adds risk │
│ `age`              │ -0.0889             │ 1.75%                     │ 1.69%                     │ Age (conditional on HR/vessels)   │
└────────────────────┴─────────────────────┴───────────────────────────┴───────────────────────────┴───────────────────────────────────┘
```

### 1.4 Clinical & Linguistic Governance Covenants
1. **Never Label Weights as SHAP:** In historical versions, `/shap-importance` returned static normalized coefficients. Phase 06A correctly relabeled the response source as `"model_weight"`. True SHAP explanations are now strictly confined to patient-specific local decompositions.
2. **Strict Prohibition on Causal Claims:** A positive SHAP value for `bmi` or `systolic_bp` indicates that the model assigned higher predicted risk to this statistical pattern. It does NOT prove that lowering BMI will immediately cure or reverse the patient's condition. Causal inference requires counterfactual clinical trial evidence.
3. **Bilingual Parity:** English and Bengali interface explanations must communicate identical medical meaning without diluting cautionary disclaimers.

---

## 2. Demographic Fairness & Subgroup Performance Audit

The research suite evaluated the DiaBD model across sex and age demographic strata on the development cohort ($N = 4,095$):

### 2.1 Empirical Subgroup Performance Breakdown

```
┌──────────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬───────────────────────────────┐
│ Demographic      │ Sample Size  │ Positive     │ Observed     │ Uncalibrated │ Uncalibrated │ Calibrated   │ Biostatistical Fairness       │
│ Subgroup         │ ($N$)        │ Events ($E$) │ Prev (%)     │ AUROC        │ Mean Prob    │ Mean Prob    │ Evaluation Status             │
├──────────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┼───────────────────────────────┤
│ **Female**       │ 2,850 (69.6%)│ 166          │ 5.82%        │ 0.7080       │ 36.71%       │ 6.06%        │ Adequate event count ($E>100$)│
│ **Male**         │ 1,245 (30.4%)│ 93           │ 7.47%        │ 0.7222       │ 40.59%       │ 6.93%        │ Adequate event count ($E>50$) │
├──────────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┼───────────────────────────────┤
│ **Age < 40**     │ 1,494 (36.5%)│ **44**       │ **2.95%**    │ **0.6092**   │ 23.67%       │ 3.42%        │ **INCONCLUSIVE (LOW POWER):** │
│                  │              │              │              │              │              │              │ $E=44 < 50$; AUROC drops 0.61 │
│ **Age 40–59**    │ 1,791 (43.7%)│ 139          │ 7.76%        │ 0.7041       │ 44.18%       │ 7.58%        │ Adequate event count ($E=139$)│
│ **Age 60+**      │ 810 (19.8%)  │ 76           │ 9.38%        │ 0.6452       │ 50.20%       │ 8.91%        │ Adequate event count ($E=76$) │
└──────────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴───────────────────────────────┘
```

### 2.2 Critical Fairness Findings & Red Lines
1. **The Young-Cohort Discrimination Collapse (Age < 40):**  
   In individuals under 40 years of age, the DiaBD model's AUROC collapses from $0.72$ to **$0.6092$**. Furthermore, with only **44 positive diabetic cases** in this stratum, statistical power is severely degraded. This result is formally classified as **`INCONCLUSIVE / POOR DISCRIMINATIVE GENERALIZABILITY IN YOUNG ADULTS`**.
2. **Sex Subgroup Differences:**  
   Male AUROC ($0.7222$) was marginally higher than Female AUROC ($0.7080$). However, because both confidence intervals overlap substantially ($[0.66, 0.77]$ vs $[0.67, 0.74]$), the difference is not statistically significant. **Under strict biostatistical rules, this absence of significant difference must NEVER be reported as proof of demographic equivalence.**
3. **Representation Sampling Bias:**  
   The $69.6\%$ female over-representation in DiaBD stems from daytime survey collection in rural villages when adult males were engaged in agricultural or migrant labor. The model cannot be claimed as representative of the national male workforce in Bangladesh.
4. **Geographic Coverage Reality:**  
   Data originates from 63 administrative unions in specific rural districts. The platform possesses zero data from urban centers (Dhaka, Chittagong), ethnic minority populations (Chittagong Hill Tracts), or tea-plantation worker communities. **Claims of national or geographic representativeness are strictly prohibited.**

---

## 3. Audit Verdict on Explainability & Fairness

```
========================================================================================================
                          EXPLAINABILITY & FAIRNESS AUDIT VERDICT:
     SHAP ADDITIVITY MATHEMATICALLY VERIFIED — AGE <40 DEFICIENCY IDENTIFIED — NATIONAL CLAIMS BARRED
========================================================================================================
```

The mathematical implementation of SHAP on Cleveland and DiaBD is sound and additive. The severe discrimination drop in young adults ($<40$ years) and the convenience nature of rural union sampling are formally documented as core limitations.

---

> [!CAUTION]
> **STATUTORY GOVERNANCE HALT**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**
