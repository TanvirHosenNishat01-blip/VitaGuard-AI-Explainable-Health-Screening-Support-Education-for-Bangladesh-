# Phase 06C.1.2.9 — Positive-Case Attainment Probability & Event-Guarantee Correction Audit
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical ML Safety & Biostatistics Review  
**Document ID:** `PHASE06C1_2_9_POSITIVE_CASE_PROBABILITY_ANALYSIS.md`  
**Evaluation Mode:** STRICT READ-ONLY AUDIT + NEW REPORTS ONLY  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This document corrects statistical interpretation errors regarding event attainment guarantees. It does not authorize clinical trial recruitment, patient contact, specimen collection, ethics submission, or model deployment. All figures analyzed represent planning scenarios.

---

## 1. Purpose and Scope

In Phase 06C.1.2.8 Report 1 (`PHASE06C1_2_8_BUDERER_ROUNDING_CORRECTION.md`), it was asserted that:
> *"Convention 2 is the methodologically conservative standard because it strictly guarantees the observation of at least 323 discrete positive cases."*

This audit formally and unconditionally **refutes that statement as mathematically indefensible**.

Specifically, this report:
1. Re-establishes the fundamental distinction between expected event counts ($E[X]$) and realized empirical observations ($X_{\text{obs}}$).
2. Proves that recruiting for an expected mean of $323$ positive cases provides only an approximately **$50.8\%$ probability** of observing $\ge 323$ cases in an actual trial.
3. Conducts an independent probability-based sample size analysis under an independent binomial model to determine the sample sizes required to achieve $90\%$, $95\%$, and $97.5\%$ probabilities of observing at least $323$ positive cases.
4. Demonstrates why calculating attainment probabilities in a clustered multi-stage sampling design is currently **NOT EVALUABLE** due to missing design parameters.
5. Formally reclassifies previously cited recruitment figures ($N = 7,406$ and $N = 9,332$) as **conditional expected-information sample-size estimates**, strictly rejecting any claim of an event guarantee.

---

## 2. Sources Reviewed

1. **Buderer NMF.** *Statistical methodology: I. Incorporating the prevalence of disease into the sample size calculation for sensitivity and specificity.* **Academic Emergency Medicine.** 1996;3(9):895–900.
2. **Clopper CJ, Pearson ES.** *The use of confidence or fiducial limits illustrated in the case of the binomial.* **Biometrika.** 1934;26(4):404–413.
3. **Flahault A, Cadilhac M, Thomas G.** *Sample size calculation should be performed for design accuracy in diagnostic test studies.* **Journal of Clinical Epidemiology.** 2005;58(8):859–862.
4. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Final_Closure_Audit/Phase_06C1_2_8/PHASE06C1_2_8_BUDERER_ROUNDING_CORRECTION.md`
5. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Final_Closure_Audit/Phase_06C1_2_8/PHASE06C1_2_8_SAMPLE_SIZE_RECONCILIATION.md`

---

## 3. Mandatory Epistemological Correction: Why No Expected Target Guarantees Observed Cases

### 3.1 The Fundamental Error in the Guarantee Claim
In classical sample size calculations, when an investigator computes $N = \frac{k}{p}$, the product $N \cdot p = k$ represents the **mathematical expectation (mean)** of a random variable:

$$E[X] = N \cdot p = 323$$

In an actual prospective clinical trial, the observed number of positive cases ($X_{\text{obs}}$) is a **random variable** governed by a binomial (or compound clustered) distribution:

$$X_{\text{obs}} \sim \text{Binomial}(N, p)$$

Because the binomial distribution for large $N$ is approximately symmetric around its mean ($E[X]$):
$$P(X_{\text{obs}} \ge 323 \mid E[X] = 323) \approx \mathbf{50.8\%}$$

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   REALIZATION PROBABILITY UNDER EXPECTED INFORMATION SIZING                      │
├───────┬──────────────────────────┬──────────────┬──────────────┬─────────────────────────────────┤
│ Prev  │ Evaluable Sample Size    │ Expected E   │ P(X >= 323)  │ P(X <= 322)                     │
│ (p)   │ Sized for E[X] = 323     │ E[X] = n * p │ (Target Met) │ (TARGET FAILS / MARGIN WIDENS)  │
├───────┼──────────────────────────┼──────────────┼──────────────┼─────────────────────────────────┤
│ 6.3%  │ n_eval = 5,127           │ 323.00       │ 50.81%       │ 49.19% (Nearly 1 in 2 failure)  │
│ 5.0%  │ n_eval = 6,460           │ 323.00       │ 50.80%       │ 49.20% (Nearly 1 in 2 failure)  │
└───────┴──────────────────────────┴──────────────┴──────────────┴─────────────────────────────────┘
```

> [!CAUTION]
> **Audit Finding: Rejection of the Guarantee Statement:**  
> The statement that Convention 2 "strictly guarantees" observing at least 323 cases is **statistically false**. Sizing a study so that expected cases equal $323$ leaves a **$49.2\%$ probability that the trial will observe $322$ or fewer cases**, in which case the observed $95\%$ confidence interval half-width will strictly exceed $\pm 5.0\%$.

### 3.2 Formal Categorical Taxonomy
To prevent confusion among ethics committees and biostatisticians, the following terms are formally distinguished:

1. **Expected Positive Cases ($E[X]$):** The theoretical mean number of cases across infinite hypothetical trial replications ($E[X] = N \cdot p$).
2. **Observed Positive Cases ($X_{\text{obs}}$):** The single empirical count of diseased individuals realized in the executed trial.
3. **Effective Sample Size ($N_{\text{eff}}$):** The equivalent sample size under simple random sampling that yields identical estimator variance ($N_{\text{eff}} = N / \text{DEFF}$).
4. **Effective Positive Information:** The Fisher information or precision weight contributed by event cases to the likelihood function.
5. **Probability of Positive-Case Attainment ($P(X \ge k)$):** The statistical probability that the random variable $X_{\text{obs}}$ will equal or exceed the discrete threshold $k$.

---

## 4. Probability-Based Sample-Size Analysis (Unclustered Independent Binomial)

If clinical leadership or regulatory authorities mandate a **true high-probability assurance** of capturing at least $323$ positive cases, the sample size must be sized using binomial tail probabilities rather than expectation alone:

$$\min n_{\text{eval}} \quad \text{such that} \quad P(X \ge 323 \mid n_{\text{eval}}, p) \ge 1 - \beta$$

Using exact binomial cumulative distribution functions across target attainment probabilities ($90\%$, $95\%$, $97.5\%$) and accounting for $10\%$ attrition:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   PROBABILITY-BASED SAMPLE SIZE REQUIREMENTS (UNCLUSTERED BINOMIAL)              │
├───────┬──────────────┬──────────────────┬──────────────────────────────┬─────────────────────────┤
│ Prev  │ Target Assur.│ Minimum Evaluable│ Minimum Recruited Sample     │ Exact Realized          │
│ (p)   │ P(X >= 323)  │ Sample (n_eval)  │ (N_recruited, 10% Attrition) │ Attainment Probability  │
├───────┼──────────────┼──────────────────┼──────────────────────────────┼─────────────────────────┤
│ 6.3%  │ 50.8% (Exp.) │ 5,127            │ 5,697 (Ceil)                 │ 50.8105% (Baseline Exp.)│
│ 6.3%  │ 90.0% Assur. │ 5,484            │ 6,094 (Ceil)                 │ 90.0302%                │
│ 6.3%  │ 95.0% Assur. │ 5,590            │ 6,212 (Ceil)                 │ 95.0258%                │
│ 6.3%  │ 97.5% Assur. │ 5,683            │ 6,315 (Ceil)                 │ 97.5173%                │
├───────┼──────────────┼──────────────────┼──────────────────────────────┼─────────────────────────┤
│ 5.0%  │ 50.8% (Exp.) │ 6,460            │ 7,178 (Ceil)                 │ 50.8012% (Baseline Exp.)│
│ 5.0%  │ 90.0% Assur. │ 6,913            │ 7,682 (Ceil)                 │ 90.0263%                │
│ 5.0%  │ 95.0% Assur. │ 7,047            │ 7,830 (Ceil)                 │ 95.0102%                │
│ 5.0%  │ 97.5% Assur. │ 7,165            │ 7,962 (Ceil)                 │ 97.5087%                │
└───────┴──────────────┴──────────────────┴──────────────────────────────┴─────────────────────────┘
```

---

## 5. Methodological Limitations of Clustered Probability Calculations

While the independent binomial table above provides exact numbers for unclustered walk-in sampling, **it cannot be applied directly to a multi-stage community cluster survey**.

### 5.1 Why Kish's DEFF Cannot Be Applied Mechanically to Tail Probabilities
In previous reports, design effects were treated as linear multipliers on sample size ($N_{\text{clustered}} = N_{\text{SRS}} \cdot \text{DEFF}$). 

This linear multiplication is **mathematically invalid for tail probabilities**:
1. **Overdispersion:** In cluster sampling, the number of cases $X$ follows an overdispersed compound distribution (such as a beta-binomial or Dirichlet-multinomial).
2. **Tail Distortion:** Kish's $\text{DEFF}$ is defined strictly for the **variance of the mean** ($\text{Var}(\bar{X})$). In an overdispersed distribution, the probability mass in the tails expands non-linearly. Applying a linear factor of $1.30$ to a binomial CDF severely underestimates the probability of falling into the lower tail ($X < 323$).

### 5.2 Mandatory Parameters for Clustered Probability Modeling
To calculate a valid probability of attaining at least $323$ positive cases in a multi-stage clustered design, an institutional statistician requires five empirical parameters:
1. Exact number of primary sampling clusters ($K$).
2. Average cluster size ($\bar{m}$).
3. Coefficient of variation of cluster sizes ($\text{CV}(m)$).
4. Stratum-specific intra-cluster correlation coefficient ($\text{ICC}$ or $\rho$).
5. Cluster sampling mechanism (probability proportional to size vs equal quota).

> [!CAUTION]
> **Audit Classification on Clustered Probability:**  
> Because these five parameters are completely absent from current project archives, **clustered probability-based sample size calculation is formally classified as NOT EVALUABLE**.

---

## 6. Reassessment of the Buderer Interpretation: $N = 7,406$ and $N = 9,332$

What, then, is the true mathematical meaning of the previously calculated figures ($N = 7,406$ at $6.3\%$ and $N = 9,332$ at $5.0\%$)?

1. **They are Conditional Expected-Information Sizing Estimates:**  
   They represent the sample size required so that the **expected effective case count** equals the discrete integer threshold ($E[X_{\text{eff}}] = 323$) under the provisional assumption that $\text{DEFF} = 1.30$ applies linearly to the sample denominator.
2. **They are NOT Case-Attainment Guarantees:**  
   If an actual trial recruits $7,406$ participants under true clustering, random cluster-level realization variance means there is still a substantial probability that observed effective cases fall below $323$.
3. **Audit Directive:** The Statistical Analysis Plan must explicitly describe $N = 7,406$ and $N = 9,332$ as **expected-information planning bounds**, strictly excising the word "guarantee."

---

## 7. Audit Findings & Formal Classifications

| Dimension Audited | Finding Summary | Finding Classification |
| :--- | :--- | :--- |
| **Claim of Event Guarantee** | Refuted; expected-value sizing yields only ~50.8% attainment probability. | `FAILED` |
| **Unclustered Probability Sizing** | Exact binomial sample sizes for 90%, 95%, 97.5% assurance verified. | `MATHEMATICALLY VERIFIED` |
| **Clustered Probability Sizing** | Missing K, m, ICC, and CV(m); Kish DEFF cannot be applied to CDF tails. | `NOT EVALUABLE` |
| **Status of 7,406 and 9,332** | Reclassified as conditional expected-information estimates, not guarantees. | `METHODOLOGICALLY SUPPORTED` |

---

## 8. Required Human Expert Review

1. **Lead Biostatistician:** Determine whether study sizing will be governed by:
   - **Approach A (Expected-Information Sizing):** Target $E[X] = 323$ cases ($N = 7,406$), accepting an approximate $50\%$ probability of realizing $\ge 323$ cases.
   - **Approach B (Probability-Assurance Sizing):** Target $P(X \ge 323) \ge 0.90\text{ or }0.95$, specifying a compound beta-binomial simulation model once cluster parameters ($K, \bar{m}, \text{ICC}$) are established.

---

> [!CAUTION]
> **FINAL GOVERNANCE STATUS**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2, Phase 06C.3, and Phase 06D remain strictly blocked.
