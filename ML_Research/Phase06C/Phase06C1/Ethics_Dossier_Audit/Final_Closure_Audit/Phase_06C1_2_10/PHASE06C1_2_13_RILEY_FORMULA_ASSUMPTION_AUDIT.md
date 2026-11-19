# Phase 06C.1.2.13 — Riley Formula Assumption & Canonical Variance Audit
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical Machine Learning Safety & Biostatistics Governance  
**Document ID:** `PHASE06C1_2_13_RILEY_FORMULA_ASSUMPTION_AUDIT.md`  
**Evaluation Mode:** TARGETED STATISTICAL CORRECTION & AUDIT (DOCUMENTATION ONLY)  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This document audits the mathematical assumptions, algebraic constants, and canonical variance estimates governing the Riley calibration slope sample size for Arm B (Outpatient Triage Cohort). Completion of this audit does NOT authorize clinical trial initiation, patient recruitment, specimen collection, hospital contracting, model recalibration, production source code modification, or institutional ethics submission. Phases 06C.2, 06C.3, and 06D remain strictly gated and blocked. Under binding governance covenants, AI systems are prohibited from selecting or authorizing clinical trial sample sizes.

---

## 1. Executive Audit Mandate

In the sample size justification for Arm B (Outpatient Triage), the standard error of the calibration slope was evaluated using the closed-form equation:
$$\text{SE}(\hat{\beta}_{\text{cal}}) = \sqrt{\frac{2.2295}{E}}$$

This audit executes a rigorous investigation into:
1. The exact algebraic derivation and underlying assumptions behind the coefficient **$2.2295$**;
2. The population transferability of community screening variance to hospital outpatient triage;
3. The canonical linear predictor variance values: historical approximate **$0.684$** versus reproduced test-set estimate **$0.6888$**; and
4. The sensitivity of the event requirement across alternative variance scenarios.

---

## 2. Algebraic Derivation of Coefficient $2.2295$

Riley et al. (2019, 2021) formulate the large-sample asymptotic variance of the calibration slope in external validation as:
$$\text{Var}(\hat{\beta}_{\text{cal}}) \approx \frac{1 + \frac{\text{Var}(\text{LP})}{2}}{N \cdot p \cdot (1 - p) \cdot \text{Var}(\text{LP})}$$

Expressing this in terms of the total positive event count $E = N \cdot p$:
$$\text{Var}(\hat{\beta}_{\text{cal}}) \approx \frac{1 + \frac{\text{Var}(\text{LP})}{2}}{E \cdot (1 - p) \cdot \text{Var}(\text{LP})} = \frac{C}{E}$$
Where $C$ is the scalar coefficient:
$$C = \frac{1 + \frac{\text{Var}(\text{LP})}{2}}{(1 - p) \cdot \text{Var}(\text{LP})}$$

### Step-by-Step Algebraic Substitution:
- **Parameter 1:** Historical provisional linear predictor variance: $\text{Var}(\text{LP}) = 0.684$
- **Parameter 2:** Assumed hospital outpatient diabetes prevalence: $p = 12.0\% = 0.12$

Evaluating the numerator:
$$\text{Numerator} = 1 + \frac{0.684}{2} = 1 + 0.342 = \mathbf{1.342000}$$

Evaluating the denominator factor:
$$\text{Denominator Factor} = (1 - 0.12) \cdot 0.684 = 0.88 \cdot 0.684 = \mathbf{0.601920}$$

Dividing numerator by denominator factor:
$$C = \frac{1.342000}{0.601920} = 2.22953216... \approx \mathbf{2.2295}$$

Thus, the standard error formula simplifies to:
$$\text{SE}(\hat{\beta}_{\text{cal}}) = \sqrt{\frac{2.2295}{E}}$$

### Identification of Provisional Inputs:
Both primary inputs to this constant are unverified planning assumptions:
1. **$\text{Var}(\text{LP}) = 0.684$:** Derived retrospectively from a cleaned internal test split of Bangladeshi community records; not empirically validated in prospective healthcare settings.
2. **$p = 12.0\%$:** An epidemiological planning assumption based on anticipated enrichment among symptomatic clinic attendees; true clinic yield is unmeasured.

---

## 3. Population Transferability & Clinical Assumption Audit

> [!WARNING]
> **CRITICAL CLINICAL EPIDEMIOLOGY WARNING ON LP VARIANCE:**  
> The Arm B calculation assumes that the linear predictor variance measured in the DiaBD community test split ($\text{Var}(\text{LP}) \approx 0.684\text{--}0.6888$) applies directly to the Arm B hospital outpatient triage population.  
> **This assumption is clinically unverified. Do NOT assume that DiaBD community test-set variance necessarily represents an outpatient triage population.**

### Clinical Grounds for Discrepancy:
1. **Spectrum Shift & Case-Mix Homogeneity:** Hospital outpatient attendees are often older, symptomatic, or present with pre-existing cardiovascular risk factors. If outpatient attendees cluster within a narrower, high-risk band of clinical features, the model's linear predictor spread will contract ($\text{Var}(\text{LP}) < 0.684$).
2. **Impact on Required Events:** As shown in Section 5, if population homogeneity narrows $\text{Var}(\text{LP})$ from $0.684$ to $0.400$, the scalar constant $C$ inflates from $2.2295$ to $3.4091$, increasing the minimum required events from $223$ to $341$ events.
3. **Planning Status:** This derivation represents an **exploratory planning approximation**, NOT a complete sample-size design or authorized clinical trial protocol.

---

## 4. Canonical Variance Audit: Historical 0.684 vs. Reproduced 0.6888

In Phase 06C.1.2.12, exact code execution on the sealed 1,024-row DiaBD test set (`ML_Research/Phase06B/Artifacts/diabd_research_calibrators.pkl`) reproduced the empirical test-set linear predictor variance:
- **Reproduced Test-Set Variance:** $\text{Var}(\text{LP})_{\text{reproduced}} = \mathbf{0.688849... \approx 0.6888}$
- **Historical Approximate Variance:** $\text{Var}(\text{LP})_{\text{historical}} = \mathbf{0.684000}$

To maintain complete documentation integrity, this audit evaluates whether the coefficient $2.2295$ changes materially when the reproduced variance is used:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                           IMPACT OF REPRODUCED VARIANCE ON RILEY CONSTANT & SIZING                               │
├──────────────────────────────────────┬──────────────────────────────┬────────────────────────────────────────────┤
│ Metric Dimension                     │ Historical Baseline (0.684)  │ Reproduced Empirical (0.6888)              │
├──────────────────────────────────────┼──────────────────────────────┼────────────────────────────────────────────┤
│ Linear Predictor Variance Var(LP)    │ 0.684000                     │ 0.688800                                   │
│ Numerator Factor (1 + Var/2)         │ 1.342000                     │ 1.344400                                   │
│ Denominator Factor (1 - p)·Var       │ 0.601920                     │ 0.606144                                   │
│ Stated Riley Constant C              │ 2.229532 ≈ 2.2295            │ 2.217955 ≈ 2.2180                          │
│ Percentage Difference in Constant    │ Baseline                     │ -0.52% reduction                           │
├──────────────────────────────────────┼──────────────────────────────┼────────────────────────────────────────────┤
│ Required Events (E for SE ≤ 0.10)    │ E ≥ 222.95 events (⌈E⌉=223)  │ E ≥ 221.80 events (⌈E⌉=222)                │
│ Difference in Required Events        │ Baseline                     │ -1.15 events                               │
├──────────────────────────────────────┼──────────────────────────────┼────────────────────────────────────────────┤
│ Evaluable Participants (p = 12.0%)   │ n_eval ≥ 1,857.92            │ n_eval ≥ 1,848.30                          │
│ Difference in Evaluable N            │ Baseline                     │ -9.62 participants                         │
├──────────────────────────────────────┼──────────────────────────────┼────────────────────────────────────────────┤
│ Recruitment Target (10% Attrition)   │ N_rec = ⌈1,857.92 / 0.90⌉    │ N_rec = ⌈1,848.30 / 0.90⌉                  │
│                                      │ = ⌈2,064.35⌉ = 2,065         │ = ⌈2,053.66⌉ = 2,054                       │
│ Difference in Recruitment Target     │ Baseline                     │ -11 participants (-0.53%)                  │
└──────────────────────────────────────┴──────────────────────────────┴────────────────────────────────────────────┘
```

### Audit Conclusion on Canonical Variance:
1. **Materiality:** Replacing the historical approximate value ($0.684$) with the reproduced test-set variance ($0.6888$) alters the Riley constant by only **$-0.52\%$** ($2.2295 \to 2.2180$). This shifts the recruitment target by only **$11$ participants** ($2,065 \to 2,054$).
2. **Policy Against Silent Substitution:** The dossier preserves both values transparently:
   - Historical planning reports utilized $\text{Var}(\text{LP}) = 0.684$ ($C = 2.2295 \implies N = 2,065$).
   - Reproduced empirical holdout analyses establish $\text{Var}(\text{LP}) = 0.6888$ ($C = 2.2180 \implies N = 2,054$).
   - Neither value is silently overwritten or substituted.

---

## 5. Full Sensitivity Matrix Across Linear Predictor Variance

Because the true risk heterogeneity of the prospective cohort is unknown, the human biostatistician must evaluate required event counts across a wide range of variance scenarios $\text{Var}(\text{LP}) \in [0.40, 1.00]$ at $p = 12.0\%$:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   ARM B RILEY EVENT & SAMPLE SIZE SENSITIVITY MATRIX (p = 12.0%, Attr = 10%)                     │
├──────────────┬──────────────────┬──────────────────┬─────────────────┬──────────────────────┬────────────────────┤
│ Scenario     │ Var(LP)          │ Scalar Const (C) │ Required Events │ Evaluable N (n_eval) │ Recruitment Target │
├──────────────┼──────────────────┼──────────────────┼─────────────────┼──────────────────────┼────────────────────┤
│ Severe Homog │ 0.400 (Low)      │ 3.4091           │ E ≥ 340.91      │ 2,840.92             │ 3,157              │
│ Moderate Hom │ 0.500 (Moderate) │ 2.8409           │ E ≥ 284.09      │ 2,367.42             │ 2,631              │
│ Historical   │ 0.684 (Baseline) │ 2.2295           │ E ≥ 222.95      │ 1,857.92             │ 2,065              │
│ Reproduced   │ 0.6888 (Empiric) │ 2.2180           │ E ≥ 221.80      │ 1,848.30             │ 2,054              │
│ High Heterog │ 0.800 (High)     │ 1.9886           │ E ≥ 198.86      │ 1,657.20             │ 1,842              │
│ Extreme Het  │ 1.000 (Very High)│ 1.7045           │ E ≥ 170.45      │ 1,420.45             │ 1,579              │
└──────────────┴──────────────────┴──────────────────┴─────────────────┴──────────────────────┴────────────────────┘
```

> [!CAUTION]
> **GOVERNANCE DIRECTIVE FOR LEAD BIOSTATISTICIAN:**  
> If the prospective outpatient population is clinically homogeneous ($\text{Var}(\text{LP}) \le 0.500$), an intake of $N = 2,065$ will fail the calibration slope standard error target. The Lead Biostatistician must formally review and justify the adopted variance scenario before protocol finalization.

---

> [!CAUTION]
> **STATUTORY GOVERNANCE HALT**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2, Phase 06C.3, and Phase 06D remain strictly blocked. All calculations documented herein represent research planning benchmarks for human biostatistical review only.
