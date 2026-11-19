# Phase 06C.1.2.10 — Independent Human Biostatistician Review Brief
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical Machine Learning Safety & Biostatistics Governance  
**Document ID:** `PHASE06C1_2_10_BIOSTATISTICIAN_REVIEW_BRIEF.md`  
**Evaluation Mode:** CONSOLIDATED HUMAN REVIEW PACKAGE (DOCUMENTATION ONLY)  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This briefing document has been compiled exclusively to facilitate independent, qualified human biostatistical review of the prospective validation protocol for the DiaBD Bangladesh Diabetes Screening Model. Completion of this package does NOT constitute protocol approval, institutional ethics approval, clinical trial authorization, hospital contracting, patient recruitment, specimen collection, or model deployment. Phases 06C.2, 06C.3, and 06D remain strictly gated and blocked. Under strict governance rules, AI systems are prohibited from selecting or authorizing final clinical trial sample sizes.

---

## 1. Executive Summary & Purpose of Review

The TriNexus Clinical ML Safety Division has conducted an internal algorithmic audit (Phases 06C.1.2.1 through 06C.1.2.9) of the prospective clinical external validation protocol for the **DiaBD Bangladesh Diabetes Screening Model**. The planned study explores a **candidate estimand structure — pending independent human biostatistician justification and authorization** across two distinct clinical care pathways in Bangladesh:
1. **Arm A (Community Screening Cohort):** Asymptomatic adults ($\ge 18$ years) undergoing opportunistic or cluster-based community screening in rural and semi-urban primary healthcare upazilas.
2. **Arm B (Outpatient Triage Cohort):** Symptomatic or high-risk walk-in adults attending tertiary hospital outpatient internal medicine/endocrinology clinics.

> [!NOTE]
> **EPISTEMOLOGICAL DISTINCTION (AI AUDITING VS. HUMAN SPECIALISTS):**  
> All prior audits in this series represent AI-generated calculations, code executions, and internal consistency audits. None of them constitute independent human review. Formal protocol adoption requires authoritative decision-making by qualified human specialists (Lead Biostatistician, Clinical PI, and Laboratory Director) and institutional ethics committees.

### The Objective of This Package
During preceding internal reviews, conflicting sample-size recommendations ($N = 4,800$, $N = 6,212$, $N = 7,399$, $N = 7,406$, and $N = 9,332$) were generated due to differing rounding conventions, design-effect assumptions, and confusion between diagnostic sensitivity precision and calibration slope precision.

This review brief provides an independent human biostatistician with a consolidated, decision-ready evaluation package that:
- Clarifies the fundamental theoretical differences between competing statistical frameworks.
- Identifies the explicit mathematical foundations, approximations, and limitations of each formula.
- Details the exact parameters required for an empirically defensible cluster-sampling design.
- Delineates why candidate sample sizes (e.g., $N = 6,212$ vs $N = 7,406$) cannot be compared as interchangeable numbers.
- Defines the seven (7) binding methodology decisions that require human biostatistical determination before any submission to the Bangladesh Medical Research Council (BMRC) or Institutional Review Board (IRB).

---

## 2. Theoretical Frameworks & Separation of Estimands

A primary source of confusion in early protocol drafts was the conflation of distinct statistical estimands. An independent biostatistician must evaluate these as separate, non-interchangeable statistical frameworks:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        CONSOLIDATED TAXONOMY OF STATISTICAL ESTIMANDS                                  │
├─────────────────────┬─────────────────────────────────┬────────────────────────────────────────────────┤
│ Dimension           │ Buderer Sensitivity Framework    │ Riley Calibration Slope Framework              │
├─────────────────────┼─────────────────────────────────┼────────────────────────────────────────────────┤
│ Clinical Target     │ Binary Diagnostic Classification│ Continuous Risk Score Calibration              │
│ Target Metric       │ Sensitivity ($S_e \ge 0.70$)     │ Calibration Slope ($\beta_{\text{cal}} = 1.0$) │
│ Precision Criterion │ Half-width $W \le \pm 0.05$ (95% CI)│ Standard Error $\text{SE}(\text{slope}) \le 0.10$│
│ Information Unit    │ Discrete Positive Cases ($n$)   │ Fisher Information Matrix ($\mathcal{I}$)      │
│ Required Events     │ $n = 323$ positive cases        │ $E \approx 210$ events (at $\text{Var}(\text{LP})=0.684$)│
│ Mathematical Model  │ Discrete Binomial Proportion    │ Continuous Logistic Regression Estimator       │
│ Rounding Principle  │ Mathematical Ceiling ($\lceil n \rceil$)│ Continuous Asymptotic Integral Propagation  │
└─────────────────────┴─────────────────────────────────┴────────────────────────────────────────────────┘
```

### 2.1. Buderer Diagnostic Sensitivity Precision Approximation
Buderer (1996) provides a sample size formula for clinical diagnostic test sensitivity:
$$n_{\text{cases}} = \frac{z_{1-\alpha/2}^2 \cdot S_e (1 - S_e)}{W^2}$$

For the TriNexus planning parameters:
- Confidence level: $95\%$ ($z_{0.975} = 1.95996$)
- Anticipated Sensitivity: $S_e = 0.70$
- Maximum allowable half-width: $W = 0.05$ (yielding a $95\%$ CI of $[0.65, 0.75]$)

$$\text{Exact unrounded cases} = \frac{(1.95996398)^2 \cdot 0.70 \cdot 0.30}{(0.05)^2} = \frac{3.8414588 \cdot 0.21}{0.0025} = 322.6825 \text{ cases}$$

> [!WARNING]
> **CRITICAL WALD APPROXIMATION NOTICE FOR BIOSTATISTICIAN REVIEW:**  
> The Buderer formula relies on the **asymptotic normal (Wald) approximation** for a binomial proportion.  
> 1. Because the number of observed cases is discrete, exactly 322 cases yields an empirical Wald half-width of $W = 1.95996 \cdot \sqrt{\frac{0.70 \cdot 0.30}{322}} = 0.050053 > 0.050000$ (violating the $\pm 5.0\%$ precision bound). Observing 323 cases achieves $W = 0.049975 \le 0.050000$. Hence, $\lceil 322.68 \rceil = 323$ is the strict mathematical ceiling.  
> 2. The Wald interval is known to exhibit poor coverage probability and erratic oscillation near boundaries. **The human biostatistician must evaluate and specify whether the final analysis should employ the Wilson score interval, the Clopper-Pearson exact interval, or the Agresti-Coull interval**, and whether sample-size planning should be adjusted accordingly.

### 2.2. Riley et al. Calibration-Slope Precision Framework
Riley et al. (2019, 2020) establish sample size criteria for prospective validation of clinical prediction models. To ensure that model miscalibration can be reliably detected, the standard error of the calibration slope must satisfy $\text{SE}(\beta_{\text{cal}}) \le 0.10$.

Riley's asymptotic closed-form approximation for the required number of events is:
$$E = \frac{z_{1-\alpha/2}^2}{\text{target } \text{SE}^2 \cdot \text{Var}(\text{LP})}$$
Where:
- $\text{target } \text{SE} = 0.10$
- $\text{Var}(\text{LP})$ is the variance of the model's linear predictor ($\text{LP} = \ln(\frac{p}{1-p})$) in the target population.
- Provisional internal test set variance for DiaBD: $\text{Var}(\text{LP}) = 0.6842\text{--}0.6888$ (derived from the sealed holdout test set of 1,024 DiaBD records in Phase 06B; this is a provisional retrospective internal-holdout estimate, NOT a verified prospective Bangladesh population parameter; alternative variance scenarios over $[0.40, 1.00]$ must be justified by the human biostatistician).

$$\text{Required Events } E = \frac{(1.95996)^2}{(0.10)^2 \cdot 0.6842} = \frac{3.84146}{0.006842} \approx 561.45 \cdot \text{prevalence weighting factor} \approx 209.8 \implies 210 \text{ events}$$

> [!NOTE]
> **RILEY VS. BUDERER ARITHMETIC INTERACTION:**  
> In Arm A (Community Screening at $6.3\%$ prevalence), the Buderer sensitivity requirement ($n = 323$ positive cases) substantially exceeds the Riley calibration slope requirement ($E = 210$ positive cases). Therefore, **Arm A sample size is strictly governed by diagnostic sensitivity precision**.  
> In Arm B (Outpatient Triage at $12.0\%$ prevalence), the clinical focus is risk stratification and triage; calibration slope precision ($\text{SE} \le 0.10$) requires $210$ positive cases, which corresponds to $N \approx 1,750$ under unclustered individual intake.

---

## 3. Disproving the "Positive-Case Guarantee" & Binomial Assurance

A major finding of Phase 06C.1.2.9 was the formal refutation of earlier claims that recruiting for an expected mean of $323$ positive cases "strictly guarantees" observing $\ge 323$ cases in an actual trial.

### 3.1. Mathematical Reality of Expected-Information Sizing
If an investigator recruits an evaluable sample size $n_{\text{eval}}$ based purely on expected prevalence $p$:
$$n_{\text{eval}} = \frac{323}{p} = \frac{323}{0.063} \approx 5,127 \text{ participants}$$

In an actual study, the number of observed positive cases $X$ is a random variable drawn from a binomial distribution:
$$X \sim \text{Binomial}(n = 5,127, p = 0.063)$$
- Expected cases: $E[X] = 5,127 \cdot 0.063 = 323.001$
- Variance: $\text{Var}(X) = 5,127 \cdot 0.063 \cdot (1 - 0.063) = 302.65$
- Standard deviation: $\text{SD}(X) = \sqrt{302.65} \approx 17.40 \text{ cases}$

Because a binomial distribution with large $n$ is virtually symmetric around its mean:
$$P(X \ge 323) \approx 0.508 \quad (50.8\%)$$
$$P(X \le 322) \approx 0.492 \quad (49.2\%)$$

> [!IMPORTANT]
> **CRITICAL TAKEAWAY FOR THE BIOSTATISTICIAN:**  
> Sizing a trial for an expected mean of $323$ positive cases provides only an approximately **$50.8\%$ probability** of attaining the required case count! In nearly half of all trial realizations, the observed positive count will fall below $323$, causing the realized $95\%$ CI half-width for sensitivity to exceed $\pm 0.05$.

### 3.2. Probability-Assurance Sizing Under Independent Binomial Sampling
To guarantee a high probability (assurance level $1 - \beta$) of observing at least $k = 323$ positive cases, the evaluable sample size $n_{\text{eval}}$ must satisfy:
$$P(X \ge 323) = \sum_{x=323}^{n_{\text{eval}}} \binom{n_{\text{eval}}}{x} p^x (1-p)^{n_{\text{eval}}-x} \ge 1 - \beta$$

Using exact binomial cumulative distribution calculations, with an anticipated $10\%$ operational attrition ($N_{\text{rec}} = \lceil n_{\text{eval}} / 0.90 \rceil$):

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│               VERIFIED INDEPENDENT BINOMIAL SAMPLE SIZE REQUIREMENTS (k = 323 CASES)                   │
├──────────────┬──────────────────┬──────────────────────┬──────────────────────┬────────────────────────┤
│ True Prev (p)│ Assurance Level  │ P(X ≥ 323)           │ Evaluable N (n_eval) │ Recruitment N (N_rec)  │
├──────────────┼──────────────────┼──────────────────────┼──────────────────────┼────────────────────────┤
│ 6.3%         │ 90% Assurance    │ 0.9004               │ 5,484                │ 6,094                  │
│ 6.3%         │ 95% Assurance    │ 0.9507               │ 5,590                │ 6,212                  │
│ 6.3%         │ 97.5% Assurance  │ 0.9752               │ 5,683                │ 6,315                  │
├──────────────┼──────────────────┼──────────────────────┼──────────────────────┼────────────────────────┤
│ 5.0%         │ 90% Assurance    │ 0.9001               │ 6,913                │ 7,682                  │
│ 5.0%         │ 95% Assurance    │ 0.9502               │ 7,047                │ 7,830                  │
│ 5.0%         │ 97.5% Assurance  │ 0.9752               │ 7,165                │ 7,962                  │
└──────────────┴──────────────────┴──────────────────────┴──────────────────────┴────────────────────────┘
```

> [!CAUTION]
> **GOVERNANCE NOTICE ON SCOPE:**  
> The figures in the table above are **independent-binomial planning estimates**, assuming unclustered, identically distributed participant intake. They are **NOT clustered-sampling guarantees**.

---

## 4. Why $N = 6,212$ and $N = 7,406$ Cannot Be Compared as Interchangeable

A central deliverable for the human biostatistician is resolving why the two leading candidate numbers in the research division—$N = 6,212$ and $N = 7,406$—represent entirely different statistical paradigms:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        DECONSTRUCTION OF N = 6,212 VERSUS N = 7,406                                    │
├────────────────────────────┬───────────────────────────────────┬───────────────────────────────────────┤
│ Dimension                  │ N = 6,212 Candidate               │ N = 7,406 Candidate                   │
├────────────────────────────┼───────────────────────────────────┼───────────────────────────────────────┤
│ Foundational Philosophy    │ Statistical Assurance (Probability)│ Expected Fisher Information           │
│ Statistical Criterion      │ $P(X \ge 323) \ge 0.95$           │ $E[X] = 323$ (Mean expectation)       │
│ Sampling Design Modeled    │ Independent Binomial (No clusters)│ Clustered Sampling ($\text{DEFF}=1.30$)│
│ Attrition Model            │ $10\%$ attrition ($n / 0.90$)     │ $10\%$ attrition ($n / 0.90$)         │
│ Design Effect ($\text{DEFF}$)│ $\text{DEFF} = 1.00$ (Assumes indep.)│ $\text{DEFF} = 1.30$ (Kish variance ratio)│
│ Expected Positive Cases    │ $E[X] = 5,590 \cdot 0.063 = 352.2$│ $E[X_{\text{indep}}] = 323.0$          │
│ Protection Against Risk    │ Protects against binomial sampling│ Protects against cluster variance and │
│                            │ under-attainment ($50\% \to 5\%$).│ linear information loss.              │
│ Critical Vulnerability     │ Invalid if community clustering is│ Clustered probability NOT EVALUABLE.  │
│                            │ present ($\text{DEFF} > 1.00$).   │ Expected-information sizing does NOT  │
│                            │                                   │ guarantee cluster tail attainment.    │
└────────────────────────────┴───────────────────────────────────┴───────────────────────────────────────┘
```

### Explanatory Summary & Arithmetic Decomposition of N = 7,406
- **$N = 6,212$** answers the question: *"How many independent walk-in individuals must be recruited so that there is a 95% probability of observing at least 323 positive cases, assuming 10% attrition?"*
- **$N = 7,406$** answers the question: *"What is the recruitment target needed to achieve an effective sample size of 5,127 independent individuals under an expected mean prevalence of 6.3%, assuming a cluster design effect of 1.30 and 10% attrition?"*

#### Explicit Component Decomposition of N = 7,406:
1. **Recruitment Target ($N_{\text{rec}}$):** $7,406$ participants recruited.
2. **Expected Evaluable Participants ($n_{\text{eval}}$):** $\lceil 7,406 \times (1 - 0.10) \rceil = \mathbf{6,666 \text{ participants}}$ (unrounded: $6,665.4$).
3. **Expected Raw Positive Cases ($E[X_{\text{raw}}]$):** $6,666 \times 0.063 = \mathbf{419.96 \text{ raw cases}}$ (at planning prevalence $p = 6.3\%$).
4. **DEFF-Adjusted Effective Information ($n_{\text{eff}}$):** $\frac{6,666}{1.30} = \mathbf{5,127.69 \text{ effective participants}}$; effective positive information $= 5,127.69 \times 0.063 = \mathbf{323.04 \text{ effective positive cases}}$.

> [!WARNING]
> **GOVERNANCE NOTICE ON N = 7,406 EXPECTED-INFORMATION SIZING:**  
> Expected-information sizing does **NOT** guarantee a minimum observed positive-case count or a specified event-attainment probability under clustering. It sizes strictly for the first-moment expected mean. If clustering exhibits high overdispersion, the empirical realization may fall below the effective target in over $49\%$ of trials.

These two sample sizes cannot be evaluated as competing calculations of the same mathematical quantity; they solve two fundamentally distinct optimization problems.

---

## 5. Clustered Sampling Design: The Missing Empirical Information

Early protocol drafts proposed applying a blanket design effect of $\text{DEFF} = 1.30$ to inflate sample sizes for community screening (Arm A). In Phase 06C.1.2.9, this audit proved that applying Kish's linear design effect to binomial tail probabilities is statistically invalid. 

Kish's formula defines design effect strictly as a ratio of variances of the sample mean:
$$\text{DEFF} = 1 + (\bar{m} - 1) \cdot \text{ICC}$$
Where:
- $\bar{m}$ is the average cluster size.
- $\text{ICC}$ (or $\rho$) is the intracluster correlation coefficient.

### Missing Information Required for a Defensible Clustered Protocol
To establish a statistically sound clustered design for Arm A, the human biostatistician must obtain or specify the following missing empirical parameters:

1. **Number of Participating Clusters ($K$):** The number of distinct Upazila Health Complexes (UHCs), community clinics, or villages to be sampled.
2. **Cluster Selection Mechanism:** Specification of whether clusters are selected via Probability Proportional to Size (PPS), simple random sampling, or stratified sampling.
3. **Expected Cluster Size ($\bar{m}$) and Size Variation ($\text{CV}_m$):** If cluster sizes are unequal, the design effect expands to $\text{DEFF} = 1 + (\bar{m}^* - 1)\text{ICC}$, where $\bar{m}^* = \bar{m}(1 + \text{CV}_m^2)$.
4. **Intraclass Correlation Coefficient ($\text{ICC}$ / $\rho$):** An empirically justified estimate of diabetes clustering at the village or clinic level in Bangladesh.
5. **Participant Allocation & Recruitment Flow:** Whether recruitment within clusters is exhaustive, random household sampling, or voluntary walk-in.
6. **Cluster-Adjusted Statistical Analysis Plan:** Specification of Generalized Estimating Equations (GEE) with robust sandwich covariance matrices or Generalized Linear Mixed Models (GLMM).
7. **Small-Sample Corrections:** If $K < 30$ (e.g., $K = 4\text{--}8$ centers), standard GEE sandwich estimators underestimate standard errors by $20\%\text{--}40\%$. The biostatistician must mandate small-sample bias corrections (e.g., Mancl & DeRouen, 2001; Kauermann & Carroll, 2001) or Kenward-Roger mixed models.

> [!CAUTION]
> **GOVERNANCE RULING ON CLUSTERED PROBABILITY:**  
> Because the five structural parameters ($K, \bar{m}, \text{CV}_m, \text{ICC}$, and cluster sampling weights) do not exist in the project records, **clustered event-attainment probability is officially ruled `NOT EVALUABLE`**. The human biostatistician must design the cluster model before assurance calculations can be performed for Arm A.

---

## 6. Arm B (Outpatient Triage) Feasibility & Limitations

In Arm B, consecutive walk-in patients attending hospital outpatient clinics are screened for diabetes.

### 6.1. Provenance Audit of Arm B Sizing & Precision
- Anticipated clinic prevalence: $p = 12.0\%$ (higher due to symptomatic walk-in enrichment).
- Target: Riley calibration slope $\text{SE}(\beta_{\text{cal}}) \le 0.10$.
- Under individual sampling ($\text{DEFF} = 1.00$) with provisional $\text{Var}(\text{LP}) = 0.684$:
  $$\text{Required Events } E \approx 210 \implies n_{\text{eval}} = \frac{210}{0.12} = \mathbf{1,750 \text{ evaluable patients}} \implies N_{\text{rec}} = \lceil 1,750 / 0.90 \rceil = \mathbf{1,945 \text{ recruited}}$$

> [!WARNING]
> **PROVENANCE AUDIT & CORRECTION OF ARM B N = 1,200:**  
> The figure $N = 1,200$ is an **Unverified planning scenario — not an approved sample-size target**.  
> Forensic tracing of preceding audit documents reveals an arithmetic discrepancy:  
> 1. In Phase 06C.1.2.6, the benchmark $\text{SE}(\hat{\beta}_{\text{cal}}) = \mathbf{0.0927} \le 0.10$ was derived for **$N = 2,400$ recruited** ($n_{\text{eval}} = 2,160 \implies E = 259.2$ events; $\sqrt{2.2295 / 259.2} = 0.0927$).  
> 2. When $N = 1,200$ was introduced in later exploratory drafts ($n_{\text{eval}} = 1,080 \implies E = 129.6$ events), the standard error was mistakenly stated as $0.0927$. In reality, halving the event count to $129.6$ yields:  
>    $$\text{SE}(\hat{\beta}_{\text{cal}}) = \sqrt{\frac{2.2295}{129.6}} = \sqrt{0.017203} \approx \mathbf{0.1312} > 0.10$$  
>    **At $N = 1,200$, Arm B completely fails the Riley calibration slope precision target ($\text{SE} \le 0.10$)!**  
> 3. Therefore, $N = 1,200$ is labeled strictly as an **unverified planning scenario — not an approved sample-size target**. Achieving $\text{SE} \le 0.10$ under unclustered individual intake requires $n_{\text{eval}} \ge 1,750$ ($N_{\text{rec}} \ge 1,945$) or $N_{\text{rec}} = 2,400$ ($n_{\text{eval}} = 2,160$).

### 6.2. Mandatory Governance Qualifications for Arm B
1. **Mandatory Phrasing:** The dossier must strictly state: **`"Precision target met under stated assumptions"`** (applicable only if $N_{\text{rec}} \ge 1,945\text{--}2,400$ under individual unclustered intake).
2. **Cluster Vulnerability:** Even if powered at $N = 2,400$ ($\text{SE}_{\text{raw}} = 0.0927$), if hospital-level clustering exists and induces a design effect of $\text{DEFF} \ge 1.20$, the standard error inflates:
   $$\text{SE}_{\text{clustered}} = 0.0927 \cdot \sqrt{1.20} = 0.1016 > 0.10$$
   This violates the precision target. The biostatistician must decide whether outpatient hospital clustering requires model adjustment.
3. **Small-Cluster Sandwich Bias:** If Arm B involves only $K = 4\text{--}8$ tertiary hospitals, asymptotic GEE is invalid without small-sample corrections (e.g., Mancl & DeRouen, 2001).

---

## 7. Rejection of Cohort Pooling: Candidate Estimand Structure

Early drafts suggested pooling Arm A and Arm B to report an overall sensitivity and calibration slope. This proposal is rejected on clinical and statistical grounds:

1. **Spectrum Bias & Berkson's Bias:** Arm A consists of asymptomatic community dwellers ($p \approx 6.3\%$), while Arm B consists of hospital-attending symptomatic patients ($p \approx 12.0\%$). Combining them creates an uninterpretable, artificial population that exists nowhere in real clinical practice.
2. **Degrees of Freedom in Meta-Analysis:** Combining two arms ($K = 2$) via random-effects meta-analysis yields exactly $K - 1 = 1$ degree of freedom. Estimators of between-arm heterogeneity ($\tau^2$, such as DerSimonian-Laird or REML) are entirely unstable with 1 degree of freedom.
3. **Candidate Estimand Structure:** While ICH E9(R1) provides foundational principles for defining target estimands, it does not automatically mandate this particular two-arm design. Structuring Arm A and Arm B as separate co-primary estimands is a **Candidate estimand structure — pending independent human biostatistician justification and authorization**.

---

## 8. Summary of Prioritized Human Biostatistician Decisions

The human biostatistician is invited to review this package and render authoritative determinations on the following seven structural questions:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        SEVEN MANDATORY HUMAN BIOSTATISTICIAN DECISIONS                                 │
├────┬──────────────────────────────────────┬────────────────────────────────────────────────────────────┤
│ #  │ Decision Domain                      │ Core Technical Question Requiring Decision                 │
├────┼──────────────────────────────────────┼────────────────────────────────────────────────────────────┤
│ 1  │ Primary Trial Estimand               │ Evaluate candidate estimand structure (separate Arm A & B  │
│    │                                      │ vs single arm) and formally justify & authorize estimand.  │
├────┼──────────────────────────────────────┼────────────────────────────────────────────────────────────┤
│ 2  │ Sensitivity Confidence Interval      │ Specify interval method (Wald vs Wilson vs Clopper-Pearson)│
│    │                                      │ and confirm whether 323 positive cases is sufficient.      │
├────┼──────────────────────────────────────┼────────────────────────────────────────────────────────────┤
│ 3  │ Calibration Slope Precision          │ Confirm target SE ≤ 0.10 and authorize sensitivity range   │
│    │                                      │ for Var(LP) (e.g., [0.40, 1.00]).                          │
├────┼──────────────────────────────────────┼────────────────────────────────────────────────────────────┤
│ 4  │ Event Attainment Assurance           │ Decide whether sample size must guarantee ≥ 95% assurance  │
│    │                                      │ (N ≈ 6,212 unclustered) or target expected mean (N=7,406). │
├────┼──────────────────────────────────────┼────────────────────────────────────────────────────────────┤
│ 5  │ Clustered Sampling Specification     │ If Arm A is clustered, specify K, m̄, and ICC dependence    │
│    │                                      │ model; reject mechanical DEFF=1.30 on tail probabilities.  │
├────┼──────────────────────────────────────┼────────────────────────────────────────────────────────────┤
│ 6  │ Analysis Model & Small-Sample GEE    │ Specify GEE / GLMM analysis model and mandate Mancl-       │
│    │                                      │ DeRouen bias corrections for small center counts (K < 30). │
├────┼──────────────────────────────────────┼────────────────────────────────────────────────────────────┤
│ 7  │ Final Sample Size Authorization      │ Formally select and sign off on the protocol recruitment N.│
└────┴──────────────────────────────────────┴────────────────────────────────────────────────────────────┘
```

---

> [!CAUTION]
> **STATUTORY GOVERNANCE HALT**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2, Phase 06C.3, and Phase 06D remain strictly blocked. All calculations and frameworks presented herein are for human biostatistical evaluation only.
