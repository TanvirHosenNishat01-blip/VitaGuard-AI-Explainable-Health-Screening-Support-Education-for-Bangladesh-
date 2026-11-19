# Phase 06C.1.2.12 — Numerical Reconciliation & Arithmetic Re-Derivation
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical Machine Learning Safety & Biostatistics Governance  
**Document ID:** `PHASE06C1_2_12_NUMERICAL_RECONCILIATION.md`  
**Evaluation Mode:** BOUNDED NUMERICAL & PROVENANCE RECONCILIATION (DOCUMENTATION ONLY)  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This document executes an independent mathematical reconciliation of the Riley calibration slope sample size for Arm B and the exact unrounded expected-value decomposition of candidate sizing $N = 7,406$. Completion of this document does NOT constitute clinical trial approval, protocol authorization, or sample size selection. No patient recruitment, hospital contracting, specimen collection, model recalibration, production source code modification, or institutional ethics submission is authorized. Phases 06C.2, 06C.3, and 06D remain strictly gated and blocked. Under binding governance covenants, AI systems are prohibited from selecting or authorizing clinical trial sample sizes.

---

## 1. Executive Context & Reconciliation Mandate

Phase 06C.1.2.11 identified remaining numerical ambiguities across the Phase 06C review package, notably:
1. Discrepancies between the approximate target of $E = 210$ events versus the exact minimum event requirement dictated by the closed-form Riley numerator ($2.2295$).
2. Conflicting recruitment targets for Arm B ($N = 1,200$, $N = 1,945$, $N = 2,065$, $N = 2,066$, and $N = 2,400$).
3. Inconsistent intermediate rounding versus continuous expectation in the decomposition of candidate sizing $N = 7,406$.

This document provides definitive arithmetic derivations, explicit integer ceiling rules, and complete cross-scenario evaluations.

---

## 2. Issue 1 — Arm B Riley Calibration Slope Re-Derivation

### 2.1. Formula Derivation & Origin of Numerator $2.2295$
In the prospective validation protocol, Arm B evaluates the calibration slope ($\hat{\beta}_{\text{cal}}$) of the DiaBD risk prediction model in consecutive outpatient hospital walk-ins.

Riley et al. (2019, 2021) formulate the large-sample asymptotic variance of the calibration slope as:
$$\text{Var}(\hat{\beta}_{\text{cal}}) \approx \frac{1 + \frac{\text{Var}(\text{LP})}{2}}{N \cdot p \cdot (1 - p) \cdot \text{Var}(\text{LP})}$$

Expressing this in terms of the expected number of positive outcome events $E = N \cdot p$:
$$\text{Var}(\hat{\beta}_{\text{cal}}) \approx \frac{1 + \frac{\text{Var}(\text{LP})}{2}}{E \cdot (1 - p) \cdot \text{Var}(\text{LP})}$$

Under the planning parameters for Arm B:
- Clinic prevalence: $p = 12.0\% = 0.12$
- Linear predictor variance baseline: $\text{Var}(\text{LP}) = 0.684$

The numerator and denominator scaling constants evaluate to:
- Numerator factor: $1 + \frac{0.684}{2} = 1 + 0.342 = \mathbf{1.342}$
- Denominator variance-prevalence product: $(1 - 0.12) \cdot 0.684 = 0.88 \cdot 0.684 = \mathbf{0.60192}$
- Ratio of constants:
  $$\frac{1.342}{0.60192} = 2.229532... \approx \mathbf{2.2295}$$

Thus, for Arm B at $p = 12.0\%$ and $\text{Var}(\text{LP}) = 0.684$, the Riley variance and standard error equations simplify directly to:
$$\text{Var}(\hat{\beta}_{\text{cal}}) = \frac{2.2295}{E}$$
$$\text{SE}(\hat{\beta}_{\text{cal}}) = \sqrt{\frac{2.2295}{E}}$$

---

### 2.2. Independent Verification of Minimum Event Information $E$
To satisfy the international clinical prediction validation benchmark of $\text{SE}(\hat{\beta}_{\text{cal}}) \le 0.10$:
$$\text{SE}(\hat{\beta}_{\text{cal}}) \le 0.10 \iff \sqrt{\frac{2.2295}{E}} \le 0.10$$
$$\frac{2.2295}{E} \le (0.10)^2 = 0.0100$$
$$E \ge \frac{2.2295}{0.0100} = \mathbf{222.95 \text{ events}}$$

> [!IMPORTANT]
> **ARITHMETIC RESOLUTION ON REQUIRED EVENTS:**  
> The minimum expected event information required to mathematically guarantee $\text{SE} \le 0.10$ under the documented formula is **$E \ge 222.95$ events** (or $\lceil 222.95 \rceil = \mathbf{223 \text{ discrete events}}$).  
> The earlier reference to $E = 210$ events was a rough heuristic approximation derived without the $(1 + \text{Var}(\text{LP})/2)$ term or from a continuous numerical integral. Under the closed-form numerator $2.2295$, $E = 210$ yields $\text{SE} = \sqrt{2.2295 / 210} = \mathbf{0.1030} > 0.10$, failing the precision benchmark.

---

### 2.3. Participant and Recruitment Sizing at Prevalence 12% and Attrition 10%
Using the verified requirement $E \ge 222.95$:

1. **Expected Evaluable Participants ($n_{\text{eval}}$):**
   $$n_{\text{eval}} \ge \frac{E}{p} = \frac{222.95}{0.12} = \mathbf{1,857.9166... \approx 1,857.92 \text{ evaluable participants}}$$
   If intermediate integer ceiling is applied: $\lceil 1,857.9167 \rceil = \mathbf{1,858 \text{ participants}}$.

2. **Expected Positive Events ($E$):**
   - At continuous $n_{\text{eval}} = 1,857.9167$: $E = 1,857.9167 \cdot 0.12 = \mathbf{222.95 \text{ events}}$.
   - At integer $n_{\text{eval}} = 1,858$: $E = 1,858 \cdot 0.12 = \mathbf{222.96 \text{ events}}$.

3. **Recruitment Target ($N_{\text{rec}}$) Under Exact Attrition Conventions:**
   Assuming an anticipated operational attrition rate of $A = 10\%$ ($0.10$), where $n_{\text{eval}} = N_{\text{rec}} \cdot (1 - A)$:
   - **Convention A (Continuous Unrounded with Terminal Ceiling):**
     $$N_{\text{rec}} = \left\lceil \frac{1,857.91666...}{1 - 0.10} \right\rceil = \left\lceil \frac{1,857.91666...}{0.90} \right\rceil = \lceil 2,064.35185... \rceil = \mathbf{2,065 \text{ participants}}$$
   - **Convention B (Intermediate Ceiling on Evaluable Participants):**
     $$n_{\text{eval}} = \lceil 1,857.9167 \rceil = 1,858$$
     $$N_{\text{rec}} = \left\lceil \frac{1,858}{0.90} \right\rceil = \lceil 2,064.444... \rceil = \mathbf{2,065 \text{ participants}}$$
   - **Convention C (Discrete Event Ceiling Ceiled First, $E = 223$):**
     $$E = \lceil 222.95 \rceil = 223$$
     $$n_{\text{eval}} = \left\lceil \frac{223}{0.12} \right\rceil = \lceil 1,858.333... \rceil = 1,859$$
     $$N_{\text{rec}} = \left\lceil \frac{1,859}{0.90} \right\rceil = \lceil 2,065.555... \rceil = \mathbf{2,066 \text{ participants}}$$

*Conclusion on Arithmetic Ceiling:* Depending on whether discrete event information is ceiled prior to dividing by prevalence ($E = 223 \implies n_{\text{eval}} = 1,859 \implies N_{\text{rec}} = \mathbf{2,066}$) or whether continuous floats are preserved to the final terminal ceiling ($N_{\text{rec}} = \lceil 2,064.35 \rceil = \mathbf{2,065}$), the exact recruitment target is **$N = 2,065$ or $N = 2,066$**.

---

### 2.4. Independent Verification of Reported Arm B Scenarios
Every Arm B candidate sample size that has appeared across the audit history is independently evaluated below under the exact formula $\text{SE} = \sqrt{2.2295 / E}$ (with $10\%$ attrition $\implies n_{\text{eval}} = N \cdot 0.90$, and $p = 12.0\%$):

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   ARM B SCENARIO PRECISION RECALCULATION                                         │
├─────────┬──────────────┬──────────────┬──────────────┬──────────────────┬──────────────┬─────────────────────────┤
│ Target N│ Evaluable N  │ Expected E   │ Var(β_cal)   │ Exact Float SE   │ Reported SE  │ Benchmark Met (SE≤0.10) │
├─────────┼──────────────┼──────────────┼──────────────┼──────────────────┼──────────────┼─────────────────────────┤
│ N=1,200 │ 1,080.0      │ 129.600      │ 0.01720293   │ 0.13115995       │ 0.1312       │ FAILS (Exceeds by 31.2%)│
│ N=1,945 │ 1,750.5      │ 210.060      │ 0.01061363   │ 0.10302250       │ 0.1030       │ FAILS (Exceeds by 3.0%) │
│ N=2,065 │ 1,858.5      │ 223.020      │ 0.00999686   │ 0.09998430       │ 0.1000       │ MEETS TARGET (Exact)    │
│ N=2,066 │ 1,859.4      │ 223.128      │ 0.00999202   │ 0.09996010       │ 0.1000       │ MEETS TARGET (Exact)    │
│ N=2,400 │ 2,160.0      │ 259.200      │ 0.00860147   │ 0.09274409       │ 0.0927       │ MEETS TARGET (Surplus)  │
└─────────┴──────────────┴──────────────┴──────────────┴──────────────────┴──────────────┴─────────────────────────┘
```

### Explanatory Synthesis of Scenarios:
1. **$N = 1,200$:** Completely fails the precision benchmark ($\text{SE} \approx 0.1312$). Labeled strictly as an **unverified planning scenario**.
2. **$N = 1,945$:** Was derived assuming $E = 210$ events ($1,750 / 0.90 = 1,944.4 \implies 1,945$). Under the closed-form numerator $2.2295$, it yields $\text{SE} = 0.1030$, marginally failing the $\le 0.10$ threshold.
3. **$N = 2,065$ / $N = 2,066$:** Represents the exact mathematical threshold achieving $\text{SE} \le 0.1000$ under unclustered individual walk-in sampling.
4. **$N = 2,400$:** Represents the historical balanced allocation (50% of an initial 4,800 planning intake). It achieves $\text{SE} = 0.0927 \le 0.10$, providing a modest safety cushion against prevalence shortfalls (maintaining $\text{SE} \le 0.10$ down to $p = 10.3\%$).

---

### 2.5. Methodological Interpretation & Design Effect Proviso
> [!IMPORTANT]
> **CRITICAL METHODOLOGICAL TAKEAWAYS FOR BIOSTATISTICIAN REVIEW:**  
> 1. **Conditional Expected-Information Estimates:** The sample sizes derived at the exact precision boundary ($N = 2,065$ / $N = 2,066$) are **conditional expected-information estimates**. They do NOT represent high probability guarantees: sizing for an expected mean of $223$ events ($E = 223.02$) provides only an approximately $50.8\%$ chance of observing $\ge 223$ events in an empirical cohort under independent binomial sampling. In contrast, the balanced historical allocation $N = 2,400$ ($E = 259.2$ events) achieves a $> 98.9\%$ probability of observing $\ge 223$ events under independent binomial intake.  
> 2. **Prohibition on Mechanical DEFF:** These calculations assume individual, unclustered walk-in recruitment ($\text{DEFF} = 1.00$). The auditor must **NOT apply a design effect (e.g., $\text{DEFF} = 1.30$) to Arm B unless its sampling design assumptions are explicitly stated and justified**. If hospital-level clustering exists across $K = 4\text{--}8$ centers, variance must be modeled using hierarchical mixed models or small-sample corrected GEE (Mancl & DeRouen, 2001).  
> 3. **AI Non-Authorization:** The AI does NOT authorize $N = 2,065$, $N = 2,066$, or $N = 2,400$ as the final study sample size. Selection among these scenarios is reserved for the Lead Human Biostatistician.

---

## 3. Issue 3 — Exact Unrounded Arithmetic of Candidate Sizing $N = 7,406$

To ensure mathematical reproducibility, candidate sample size $N = 7,406$ is recalculated below using exact continuous expected values without rounding intermediate steps:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                           EXACT CONTINUOUS EXPECTED-VALUE DECOMPOSITION (N = 7,406)                              │
├────┬──────────────────────────────────────┬──────────────────────────────────┬───────────────────────────────────┤
│ Step│ Metric Description                  │ Exact Continuous Mathematical Form│ Value                             │
├────┼──────────────────────────────────────┼──────────────────────────────────┼───────────────────────────────────┤
│ 1  │ Total Recruited Participants (N)     │ Fixed Planning Target            │ 7,406 participants                │
│ 2  │ Operational Attrition Rate (A)       │ Fixed Planning Assumption        │ 10.0% (0.10)                      │
│ 3  │ Expected Evaluable Participants (n)  │ 7,406 · (1 - 0.10)               │ 6,665.4000 evaluable participants │
│ 4  │ Planning Prevalence (p)              │ Fixed Planning Assumption        │ 6.30% (0.063)                     │
│ 5  │ Expected Raw Positive Cases          │ 6,665.4 · 0.063                  │ 419.9202 raw positive cases       │
│ 6  │ Cluster Design Effect (DEFF)         │ Fixed Planning Assumption        │ 1.3000                            │
│ 7  │ DEFF-Adjusted Effective Participants │ 6,665.4 / 1.30                   │ 5,127.230769... participants      │
│ 8  │ Effective Positive Case Information  │ 5,127.230769... · 0.063          │ 323.015538... effective cases     │
│    │                                      │ (or 419.9202 / 1.30)             │ ≈ 323.02 effective cases          │
└────┴──────────────────────────────────────┴──────────────────────────────────┴───────────────────────────────────┘
```

### Critical Epistemological Distinctions:
1. **Expected Values vs. Integer Observations:** The figures $6,665.4$ evaluables, $419.92$ raw cases, and $323.02$ effective cases are mathematical expectations (the first moment of a probability distribution). In an actual trial, all patient counts and biological events are discrete positive integers.
2. **Effective Information vs. Patient Counts:** Effective positive information ($323.02$) is a variance-discounted statistical index. It must **NEVER be described as "observed positive patients"**. In a clustered survey, $420$ living positive patients provide only the statistical information equivalent of $323$ independent patients.
3. **No Guarantee Under Clustering:** Sizing for an expected effective count of $323.02$ cases does NOT guarantee observing $\ge 323$ cases in practice. If clustering exhibits high intracluster correlation ($\text{ICC}$) or cluster-size variation ($\text{CV}_m$), the realized effective information may fall below the precision target.

---

> [!CAUTION]
> **STATUTORY GOVERNANCE HALT**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2, Phase 06C.3, and Phase 06D remain strictly blocked. All figures are presented for human expert evaluation only.
