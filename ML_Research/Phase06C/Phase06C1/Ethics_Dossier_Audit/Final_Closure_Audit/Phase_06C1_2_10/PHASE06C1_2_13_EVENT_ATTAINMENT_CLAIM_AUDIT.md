# Phase 06C.1.2.13 — Event-Attainment Probability Claim & Effective Information Audit
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical Machine Learning Safety & Biostatistics Governance  
**Document ID:** `PHASE06C1_2_13_EVENT_ATTAINMENT_CLAIM_AUDIT.md`  
**Evaluation Mode:** TARGETED STATISTICAL CORRECTION & AUDIT (DOCUMENTATION ONLY)  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This document audits and corrects the statistical claim that candidate sample size $N = 7,406$ yields an approximately $50.8\%$ probability of observing $\ge 323$ positive cases. It resolves the confusion between raw observed events and cluster-discounted effective information. Completion of this audit does NOT authorize patient recruitment, clinical trial initiation, specimen collection, hospital contracting, model recalibration, production source code modification, or institutional ethics submission. Phases 06C.2, 06C.3, and 06D remain strictly gated and blocked. Under binding governance covenants, AI systems are prohibited from selecting or authorizing clinical trial sample sizes.

---

## 1. Executive Audit Mandate

In Phases 06C.1.2.10 through 06C.1.2.12, multiple review summaries stated:
> *"Expected-information sizing ($N = 7,406$) provides only an approximately $50.8\%$ probability of observing at least $323$ positive cases in an actual trial."*

This audit formally investigates the mathematical validity of that assertion by decoupling:
1. Expected raw positive cases ($E[X_{\text{raw}}]$);
2. Observed raw positive cases ($X_{\text{raw}}$);
3. Design-effect adjusted effective positive information ($n_{\text{eff}} \cdot p$); and
4. True cumulative binomial tail probability ($P(X_{\text{raw}} \ge 323)$).

---

## 2. Origin & Mathematical Deconstruction of the 50.8% Claim

### 2.1. The Legitimate Origin of 50.8% (Unadjusted Expected Sizing)
In Phase 06C.1.2.9, an audit was conducted to challenge the claim that sizing for an expected mean guarantees observing that number of events.

Under independent binomial sampling without clustering ($\text{DEFF} = 1.00$), if an investigator sizes the trial to achieve an expected mean of exactly $323$ positive cases at prevalence $p = 6.3\% = 0.063$:
$$n_{\text{eval}} = \frac{323}{0.063} = \mathbf{5,126.98 \implies 5,127 \text{ evaluable participants}}$$
- Expected cases: $E[X] = 5,127 \cdot 0.063 = \mathbf{323.001 \text{ cases}}$
- Variance: $\text{Var}(X) = 5,127 \cdot 0.063 \cdot (1 - 0.063) = \mathbf{302.652}$
- Standard deviation: $\sigma = \sqrt{302.652} \approx \mathbf{17.397 \text{ cases}}$

Calculating the exact binomial cumulative tail probability:
$$P(X \ge 323 \mid n = 5,127, p = 0.063) = \sum_{x=323}^{5,127} \binom{5,127}{x} (0.063)^x (0.937)^{5,127-x} = \mathbf{0.508148 \quad (50.81\%)}$$

*Conclusion on Origin:* The figure **$50.8\%$ is mathematically valid exclusively for $n_{\text{eval}} = 5,127$** (the unadjusted expected-information sample size without design effect inflation), where the expected mean happens to equal the target threshold ($E[X] = 323$).

---

### 2.2. The Conflation Error in Subsequent Reports
In Phases 06C.1.2.10, 06C.1.2.11, and 06C.1.2.12, this $50.8\%$ statement was carelessly copied and attached to **candidate sample size $N = 7,406$**.

This was a major statistical conflation. At $N = 7,406$, the study does **NOT** enroll $5,127$ participants; it enrolls $7,406$ participants to yield approximately **$6,665.4$ evaluable participants**!

---

## 3. Independent Binomial Probability Audit of $N = 7,406$

### 3.1. Conversion of Expected Evaluables to Realizable Sample Counts
At recruitment target $N = 7,406$ with $10\%$ operational attrition ($A = 0.10$):
$$\text{Expected evaluable participants } n_{\text{eval}} = 7,406 \cdot (1 - 0.10) = \mathbf{6,665.4 \text{ participants}}$$

In an actual empirical trial, the number of evaluable participants completing blood testing must be an integer. The two adjacent realizable integer sample sizes are:
- Floor integer: $n = \mathbf{6,665 \text{ participants}}$
- Ceiling integer: $n = \mathbf{6,666 \text{ participants}}$

### 3.2. Expected Raw Cases and Distribution
At community planning prevalence $p = 0.063$:
- At $n = 6,665$: Expected raw positive cases $E[X_{\text{raw}}] = 6,665 \cdot 0.063 = \mathbf{419.895 \text{ cases}}$
- At $n = 6,666$: Expected raw positive cases $E[X_{\text{raw}}] = 6,666 \cdot 0.063 = \mathbf{419.958 \text{ cases}}$
- Variance: $\text{Var}(X_{\text{raw}}) = 6,665.4 \cdot 0.063 \cdot (1 - 0.063) = \mathbf{393.465}$
- Standard deviation: $\sigma = \sqrt{393.465} \approx \mathbf{19.836 \text{ cases}}$

### 3.3. Exact Binomial Tail Probability Calculations
The probability of observing at least $k = 323$ raw positive cases in an independent sample is:
$$P(X_{\text{raw}} \ge 323) = \sum_{x=323}^{n} \binom{n}{x} (0.063)^x (0.937)^{n-x}$$

Evaluating this exact sum using exact binomial distributions:
- **For $n = 6,665$:**  
  $$P(X_{\text{raw}} \ge 323 \mid n = 6,665, p = 0.063) = \mathbf{0.99999983 \quad (> 99.9999\%)}$$
- **For $n = 6,666$:**  
  $$P(X_{\text{raw}} \ge 323 \mid n = 6,666, p = 0.063) = \mathbf{0.99999983 \quad (> 99.9999\%)}$$

### 3.4. Gaussian Z-Score Perspective
The distance from the expected mean ($419.92$ cases) down to the threshold ($323$ cases) is:
$$\text{Difference} = 323 - 419.92 = -96.92 \text{ cases}$$
$$z = \frac{323 - 419.92}{\sigma} = \frac{-96.92}{19.836} = \mathbf{-4.886 \text{ standard deviations}}$$
In a normal distribution, the probability of falling within $4.88$ standard deviations above the threshold is:
$$\Phi(4.886) \approx \mathbf{0.9999995}$$

> [!CAUTION]
> **DEFINITIVE RULING ON THE 50.8% CLAIM:**  
> The statement that $N = 7,406$ yields approximately $50.8\%$ probability of attaining $323$ positive cases has **ZERO valid mathematical basis**.  
> Under independent binomial sampling, recruiting $N = 7,406$ ($n_{\text{eval}} \approx 6,665$) yields an expected raw case count of $\approx \mathbf{420 \text{ cases}}$, and the probability of observing at least $323$ raw positive cases is **virtually $1.0$ ($> 99.9999\%$)**.

---

## 4. The Fallacy of Treating Effective Information as an Observed Binomial Count

Why did previous narratives associate $N = 7,406$ with $323$ cases?
Because $N = 7,406$ was inflated by a design effect of $\text{DEFF} = 1.30$:
$$\text{Expected Raw Cases } E[X_{\text{raw}}] = 6,665.4 \cdot 0.063 = 419.9202$$
$$\text{DEFF-Adjusted Effective Cases} = \frac{419.9202}{1.30} = \mathbf{323.0155 \approx 323.02 \text{ effective cases}}$$

### The Conceptual Error:
Previous authors took the number $323.02$, saw that it was the expected effective information, and mistakenly concluded that because it was near $323$, the probability of attainment must be $50.8\%$!

This reasoning commits two fundamental statistical fallacies:
1. **Effective Information Is Not an Observable Random Variable:**  
   In an actual trial, clinicians observe discrete human patients ($X_{\text{raw}}$). No one ever observes "effective cases". Effective information is a variance ratio ($\mathcal{I}_{\text{eff}} = \mathcal{I}_{\text{clustered}} / \text{DEFF}$) calculated during statistical modeling.
2. **Dividing a Binomial Random Variable by a Constant Does Not Yield a Binomial Distribution:**  
   If $X_{\text{raw}} \sim \text{Binomial}(n, p)$, the quantity $X_{\text{raw}} / 1.30$ does NOT follow a binomial distribution. One cannot evaluate $\text{BinomialCDF}(323 / 1.30)$.

---

## 5. Clustered Sampling Governance Ruling: Why Clustered Probability Is NOT EVALUABLE

In multi-stage clustered sampling (e.g., villages, wards, or community health clinics), participant outcomes are correlated within clusters ($\text{ICC} > 0$).

### 5.1. Overdispersed Compound Distribution
In clustered data, the number of observed cases $X$ follows an overdispersed compound distribution (e.g., beta-binomial or mixed logistic model):
$$\text{Var}_{\text{clustered}}(X) = \text{DEFF} \cdot \text{Var}_{\text{binomial}}(X)$$
While Kish's $\text{DEFF} = 1.30$ scales the variance of the sample mean, **it cannot be mechanically applied to non-linear cumulative distribution functions or tail probabilities**.

### 5.2. Mandatory Governance Classification
To calculate true event-attainment probability under clustering, a statistician requires:
1. Number of clusters ($K$);
2. Average cluster size ($\bar{m}$);
3. Coefficient of variation of cluster size ($\text{CV}_m$);
4. Intraclass correlation coefficient ($\text{ICC}$ / $\rho$); and
5. Cluster-level probability distribution (e.g., shape parameters of the beta-binomial).

Because these five parameters are entirely absent from project records:
> **`Clustered Event-Attainment Probability is officially classified as NOT EVALUABLE.`**  
> **Rule:** Do NOT mechanically convert $\text{DEFF} = 1.30$ into a binomial probability. Sizing for $N = 7,406$ is strictly a **conditional expected-information estimate** ($E[\mathcal{I}_{\text{eff}}] = 323.02$), not an attainment probability guarantee.

---

> [!CAUTION]
> **STATUTORY GOVERNANCE HALT**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2, Phase 06C.3, and Phase 06D remain strictly blocked. All figures represent technical planning benchmarks for human biostatistical evaluation only.
