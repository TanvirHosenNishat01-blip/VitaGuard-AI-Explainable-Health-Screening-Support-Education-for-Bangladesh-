# Phase 06B — DiaBD Threshold Analysis & Clinical Operating Points
**TriNexus | VitaGuard AI — Clinical Machine Learning Division**  
**Date:** November 10, 2026  
**Status:** Complete  
**Author:** Clinical AI Auditor & Healthcare Operations Specialist  

---

## 1. The Decision Threshold Paradox Post-Calibration

A common clinical trap when moving from an uncalibrated loss-reweighted model to a calibrated model is retaining an arbitrary decision threshold of **0.50**.

### 1.1 The Failure of a 0.50 Cutoff on Calibrated Low-Prevalence Models
- In the legacy uncalibrated DiaBD service, `scale_pos_weight = 14.81` artificially inflated scores so that high-risk patients scored between 0.50 and 0.85. A naive cutoff of 0.50 achieved approximately 60.0% sensitivity.
- However, when the model is properly calibrated, its outputs represent **true individual event probabilities**. Because population diabetes prevalence is only 6.35%, even patients with multiple severe risk factors (e.g. age 60, BMI 32, systolic BP 160, positive family history) rarely exhibit an absolute diabetes probability exceeding 25%–30%.
- Consequently, if a clinician applies a static 0.50 threshold to the calibrated model:
  $$\text{Sensitivity at } 0.50 = \mathbf{0.0\%} \quad (0 \text{ of } 65 \text{ diabetic cases detected})$$
  $$\text{Specificity at } 0.50 = \mathbf{100.0\%} \quad (\text{Every patient is classified as non-diabetic})$$
- The model becomes completely useless as a screening tool if the decision cutoff is not adapted to the calibrated probability scale.

---

## 2. Threshold Sweep & Operating Characteristics Table

The table below details diagnostic performance on the sealed holdout test set ($N = 1,024$, 65 positive cases) across decision thresholds for the champion Platt-calibrated model, contrasted against the uncalibrated baseline:

| Decision Cutoff ($\tau$) | Model Pipeline | Sensitivity (Recall) | Specificity | PPV (Precision) | NPV | Youden's Index ($J$) | Confusion Matrix (TP / FP / FN / TN) | Clinical Recommendation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **0.04** | Platt Calibrated | **87.69%** | 35.87% | 8.46% | 97.73% | 0.2356 | 57 / 615 / 8 / 344 | Ultra-high sensitivity (wide community health camps) |
| **0.05** | Platt Calibrated | **78.46%** | 51.00% | 9.81% | 97.23% | 0.2946 | 51 / 470 / 14 / 489 | **Primary Screening Recommended (High Sensitivity)** |
| **0.06** | Platt Calibrated | **72.31%** | 58.71% | 10.61% | 96.90% | **0.3102** | 47 / 396 / 18 / 563 | Maximum Youden's $J$ (Balanced Screening) |
| **0.08** | Platt Calibrated | **60.00%** | **70.49%** | 12.11% | 96.44% | **0.3049** | 39 / 283 / 26 / 676 | **Outpatient Triage Recommended (Balanced)** |
| **0.10** | Platt Calibrated | 46.15% | 80.71% | 13.95% | 95.68% | 0.2686 | 30 / 185 / 35 / 774 | Resource-constrained setting |
| **0.12** | Platt Calibrated | 33.85% | 88.53% | 16.67% | 95.18% | 0.2238 | 22 / 110 / 43 / 849 | High specificity confirmation triage |
| **0.15** | Platt Calibrated | 20.00% | 95.62% | 23.64% | 94.63% | 0.1562 | 13 / 42 / 52 / 917 | Severe laboratory shortage |
| **0.20** | Platt Calibrated | 4.62% | 99.58% | 42.86% | 93.90% | 0.0420 | 3 / 4 / 62 / 955 | Clinically unacceptable (95.4% false negatives) |
| **0.30** | Platt Calibrated | 0.00% | 100.00% | 0.00% | 93.65% | 0.0000 | 0 / 0 / 65 / 959 | Non-viable (Complete diagnostic failure) |
| **0.50** | Platt Calibrated | **0.00%** | **100.00%** | **0.00%** | **93.65%** | **0.0000** | **0 / 0 / 65 / 959** | **Complete diagnostic failure on calibrated scale** |
| *0.50* | *Uncalibrated Legacy* | *60.00%* | *68.09%* | *11.30%* | *96.18%* | *0.2809* | *39 / 306 / 26 / 653* | *Historical baseline (uncalibrated score artifact)* |

---

## 3. Operational Tiers for Bangladeshi Healthcare Deployment

In Phase 06C or future clinical implementation, a single fixed 0.50 cutoff must never be hardcoded. Instead, VitaGuard AI should provide clinical role-based operating points:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             DIABD CLINICAL OPERATING TIERS                       │
├──────────────────────────────────────────────────────────────────────────────────┤
│ TIER 1: COMMUNITY SCREENING CAMPS (Threshold = 0.05 / 5.0% Calibrated Risk)      │
│ - Sensitivity: 78.5% | Specificity: 51.0% | NPV: 97.2%                           │
│ - Clinical Goal: Maximize detection of asymptomatic diabetes in rural outreach.   │
│ - Action: Patient advised to undergo confirmatory laboratory fasting blood test.  │
├──────────────────────────────────────────────────────────────────────────────────┤
│ TIER 2: GENERAL OUTPATIENT CLINICS (Threshold = 0.08 / 8.0% Calibrated Risk)     │
│ - Sensitivity: 60.0% | Specificity: 70.5% | NPV: 96.4%                           │
│ - Clinical Goal: Balanced triage in high-volume Upazila Health Complexes.        │
│ - Action: High-risk queue prioritized for physician clinical consultation.       │
├──────────────────────────────────────────────────────────────────────────────────┤
│ TIER 3: RESOURCE-CONSTRAINED SETTINGS (Threshold = 0.12 / 12.0% Calibrated Risk) │
│ - Sensitivity: 33.8% | Specificity: 88.5% | PPV: 16.7%                           │
│ - Clinical Goal: Limit false-positive laboratory overload where reagents are low.│
│ - Action: Targeted diagnostic workup reserved for top 12% highest-risk patients. │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. UI/UX Translation Guidelines

1. **Dual Output Representation:**  
   The UI should never display a raw binary "Diabetic vs. Non-Diabetic" label without context. It should present:
   - **Calibrated Personal Risk:** e.g. *"Calibrated Probability: 9.4%"*
   - **Risk Category:** *"Elevated Screening Risk (Above 8% Clinic Triage Threshold)"*
   - **Contextual Prevalence Anchor:** *"Average adult baseline in this survey population is 6.3%."*
2. **Physician Review Gate:**  
   Every screening outcome above the selected operational cutoff must route to the doctor review dashboard before definitive clinical management is initiated.
