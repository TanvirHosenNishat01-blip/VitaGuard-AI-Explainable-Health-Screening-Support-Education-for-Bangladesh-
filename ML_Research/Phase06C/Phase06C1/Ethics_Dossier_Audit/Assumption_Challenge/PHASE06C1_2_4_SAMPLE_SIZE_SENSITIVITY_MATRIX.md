# Independent Statistical Assumption Challenge: Multi-Dimensional Sample Size Sensitivity Matrix

## Phase 06C.1.2.4 — Comprehensive Sensitivity Analysis Across 100 Parameter Scenarios

```
====================================================================================================
DOCUMENT CLASSIFICATION: INDEPENDENT STATISTICAL SENSITIVITY MATRIX REPORT
PROJECT INITIATIVE: TriNexus | VitaGuard AI — Clinical Machine Learning Division
DOCUMENT CODE: TNX-VG-CHALLENGE-MATRIX-06C24
DATE OF CREATION: November 10, 2026
AUDITORS: Senior Biostatistician & Clinical AI Validation Methodologist
EVALUATION SCOPE: Exhaustive Evaluation of Riley Calibration Slope Precision Across 5 Var(LP) Tiers,
                  5 Prevalence Tiers, and 4 DEFF Tiers under Fixed N = 4,800 and Scaled Recruitment
====================================================================================================
```

> [!CAUTION]
> **BIOSTATISTICAL GOVERNANCE NOTICE: STRICT INDEPENDENT AUDIT**  
> All calculations in this matrix represent mathematical sensitivity projections, NOT observed clinical trial outcomes.  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**

---

## 1. Purpose and Scope

The purpose of this audit is to stress-test the proposed sample size ($N = 4,800$) against a complete multidimensional grid of statistical assumptions, assessing sensitivity across:
- **Linear Predictor Spread:** $\text{Var}(\text{LP}) \in \{0.40, 0.50, 0.684, 0.80, 1.00\}$.
- **True Population Prevalence:** $p \in \{5.0\%, 6.3\%, 8.0\%, 10.0\%, 12.0\%\}$.
- **Clustering Design Effect:** $\text{DEFF} \in \{1.00 \text{ (i.i.d.)}, 1.15 \text{ (mild)}, 1.30 \text{ (moderate)}, 1.50 \text{ (severe)}\}$.
- **Pre-analytical & Attrition Rate:** $10\%$ ($\text{Inflation} = 1 / (1 - 0.10) = 1.111$).
- **Precision Target:** Calibration Slope $\text{SE}(\hat{\beta}_{\text{cal}}) \le 0.10$ ($95\%$ CI width $\le \pm 0.196 \approx \pm 0.20$ around $\beta = 1.00$).

---

## 2. Mathematical Methods and Methodological Caveats

### 2.1 The Riley Large-Sample Approximation
Calculations utilize Equation (4) from Riley RD, Debray TPA, Collins GS, et al. (*Stat Med* 2021;40:3778–3799):

$$\text{SE}(\hat{\beta}_{\text{cal}}) \approx \sqrt{ \frac{1 + \frac{\text{Var}(\text{LP})}{2}}{E_{\text{eff}} \cdot (1 - p) \cdot \text{Var}(\text{LP})} }$$

Solving for the required effective independent events ($E_{\text{eff}}$):

$$E_{\text{eff}} \ge \frac{1 + \frac{\text{Var}(\text{LP})}{2}}{[\text{SE}_{\text{target}}]^2 \cdot (1 - p) \cdot \text{Var}(\text{LP})}$$

### 2.2 Important Methodological Caveats
1. **The Riley Formulation is an Approximation:** The formula assumes asymptotic normality of the maximum likelihood estimator for logistic regression, moderate event proportions, and that $\text{LP}$ follows an approximately normal distribution.
2. **Cluster Information Approximation:** In this sensitivity matrix, conditional effective event information is approximated as $E_{\text{eff, cond}} \approx E_{\text{raw}} / \text{DEFF}$. As demonstrated in Report `PHASE06C1_2_4_DEFF_AND_CLUSTER_ASSUMPTION_AUDIT.md`, this is a heuristic borrowed from survey sampling of population means; in a multivariable clustered logistic model, the true information loss must be formally evaluated via mixed-effects simulation.
3. **Hypothetical Scenarios:** Outputs in this matrix represent planning bounds, not observed clinical trial results.

---

## 3. Part A: Required Independent-Equivalent Events ($E_{\text{eff}}$)

The table below calculates the required independent events ($E_{\text{eff}}$) needed to achieve $\text{SE}(\hat{\beta}_{\text{cal}}) \le 0.10$ under combinations of true prevalence $p$ and linear predictor variance $\text{Var}(\text{LP})$:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│             REQUIRED INDEPENDENT-EQUIVALENT EVENTS (E_eff) FOR SE <= 0.10                        │
├──────────────┬──────────────────┬──────────────────┬──────────────────┬──────────────────────────┤
│ Prev (p)     │ Var(LP) = 0.400  │ Var(LP) = 0.500  │ Var(LP) = 0.684  │ Var(LP) = 0.800 │ Var=1.000│
├──────────────┼──────────────────┼──────────────────┼──────────────────┼─────────────────┼────────┤
│ 5.0% (0.050) │ 315.79 events    │ 263.16 events    │ 206.53 events    │ 184.21 events   │ 157.89 │
│ 6.3% (0.063) │ 320.17 events    │ 266.81 events    │ 209.39 events    │ 186.77 events   │ 160.09 │
│ 8.0% (0.080) │ 326.09 events    │ 271.74 events    │ 213.26 events    │ 190.22 events   │ 163.04 │
│ 10.0% (0.100)│ 333.33 events    │ 277.78 events    │ 218.00 events    │ 194.44 events   │ 166.67 │
│ 12.0% (0.120)│ 340.91 events    │ 284.09 events    │ 222.95 events    │ 198.86 events   │ 170.45 │
└──────────────┴──────────────────┴──────────────────┴──────────────────┴─────────────────┴────────┘
```

- **Intermediate Formula Check (e.g., $p = 0.063, \text{Var} = 0.684$):**
  $$\text{Num} = 1 + \frac{0.684}{2} = 1.342, \quad \text{Denom} = (0.10)^2 \cdot (1 - 0.063) \cdot 0.684 = 0.00640908$$
  $$E_{\text{eff}} = \frac{1.342}{0.00640908} = \mathbf{209.3898} \approx \mathbf{209.39 \text{ events}}$$
- **Audit Status:** **`VERIFIED`**

---

## 4. Part B, C & E: Total Recruitment Requirements Across DEFF Scenarios

Assuming the baseline planning prior $\text{Var}(\text{LP}) = 0.684$ and $10\%$ pre-analytical attrition, total recruitment ($N_{\text{recr}}$) is calculated as:
$$N_{\text{recr}} = \frac{E_{\text{eff}} \cdot \text{DEFF}}{p \cdot (1 - 0.10)}$$

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   TOTAL RECRUITMENT REQUIREMENTS MATRIX (Var(LP) = 0.684)                        │
├──────────┬──────────┬──────────────┬──────────────┬──────────────┬──────────────┬────────────────┤
│ Scenario │ Prev (p) │ DEFF = 1.00  │ DEFF = 1.15  │ DEFF = 1.30  │ DEFF = 1.50  │ Target Status  │
│          │          │ (i.i.d.)     │ (Mild Clust.)│ (Base Clust.)│ (High Clust.)│ at N = 4,800   │
├──────────┼──────────┼──────────────┼──────────────┼──────────────┼──────────────┼────────────────┤
│ 1        │ 5.0%     │ 4,589 partic.│ 5,278 partic.│ 5,966 partic.│ 6,884 partic.│ DEFICIT (D>=1.15)│
│ 2 (Ref)  │ 6.3%     │ 3,693 partic.│ 4,247 partic.│ 4,801 partic.│ 5,539 partic.│ BALANCED (D=1.3)│
│ 3        │ 8.0%     │ 2,962 partic.│ 3,406 partic.│ 3,851 partic.│ 4,443 partic.│ SURPLUS (All D)│
│ 4        │ 10.0%    │ 2,422 partic.│ 2,786 partic.│ 3,149 partic.│ 3,633 partic.│ SURPLUS (All D)│
│ 5        │ 12.0%    │ 2,064 partic.│ 2,374 partic.│ 2,684 partic.│ 3,097 partic.│ SURPLUS (All D)│
└──────────┴──────────┴──────────────┴──────────────┴──────────────┴──────────────┴────────────────┘
```

- **Audit Status:** **`VERIFIED`**

---

## 5. Part D & F: Exact Performance Profile of Fixed Cohort ($N = 4,800$)

For a fixed enrolled sample of $N = 4,800$ with $10\%$ attrition, the expected **evaluable sample is $N_{\text{eval}} = 4,320$**.  
The table below computes expected raw events ($E_{\text{raw}} = 4,320 \times p$) and resulting calibration slope $\text{SE}(\hat{\beta}_{\text{cal}})$ across all DEFF tiers under $\text{Var}(\text{LP}) = 0.684$:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   CALIBRATION SLOPE SE AT FIXED N = 4,800 (Var(LP) = 0.684)                      │
├──────────┬──────────┬──────────────┬──────────────┬──────────────┬──────────────┬────────────────┤
│ Prev (p) │ Raw Ev.  │ SE (DEFF=1.0)│ SE (DEFF=1.15│ SE (DEFF=1.3)│ SE (DEFF=1.5)│ Meets SE<=0.10 │
│          │ (E_raw)  │ [i.i.d.]     │ [Mild Clust.]│ [Base Clust.]│ [High Clust.]│ Target? (D=1.3)│
├──────────┼──────────┼──────────────┼──────────────┼──────────────┼──────────────┼────────────────┤
│ 5.0%     │ 216.0    │ 0.0978 (±0.19│ 0.1049 (±0.21│ 0.1115 (±0.22│ 0.1198 (±0.23│ NO (DEFICIT)   │
│ 6.3%     │ 272.2    │ 0.0877 (±0.17│ 0.0941 (±0.18│ 0.1000 (±0.20│ 0.1074 (±0.21│ MEETS TARGET   │
│ 8.0%     │ 345.6    │ 0.0786 (±0.15│ 0.0842 (±0.17│ 0.0896 (±0.18│ 0.0962 (±0.19│ MEETS TARGET   │
│ 10.0%    │ 432.0    │ 0.0710 (±0.14│ 0.0762 (±0.15│ 0.0810 (±0.16│ 0.0870 (±0.17│ MEETS TARGET   │
│ 12.0%    │ 518.4    │ 0.0656 (±0.13│ 0.0703 (±0.14│ 0.0748 (±0.15│ 0.0803 (±0.16│ MEETS TARGET   │
└──────────┴──────────┴──────────────┴──────────────┴──────────────┴──────────────┴────────────────┘
*Values in parentheses indicate 95% Confidence Interval half-width: Margin = ±(1.95996 * SE).
```

- **Critical Audit Confirmation:** Under $\text{DEFF} = 1.30$, $N = 4,800$ achieves $\text{SE} \le 0.10$ for prevalence $\ge 6.3\%$. At $5.0\%$ prevalence, $N = 4,800$ yields $\text{SE} = 0.1115$, failing the precision benchmark by $0.0115$ ($11.5\%$).
- **Audit Status:** **`VERIFIED`**

---

## 6. Part G: Sensitivity of Fixed Cohort ($N = 4,800$) to Case-Mix Variance ($\text{Var}(\text{LP})$)

Evaluating the impact of case-mix spread at baseline prevalence $p = 0.063$ ($N_{\text{eval}} = 4,320, E_{\text{raw}} = 272.2$):

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│             SENSITIVITY TO LINEAR PREDICTOR VARIANCE AT p = 0.063 (N = 4,800)                    │
├──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬───────────────────────┤
│ Var(LP)      │ SE (DEFF=1.0)│ SE (DEFF=1.15│ SE (DEFF=1.3)│ SE (DEFF=1.5)│ Meets SE<=0.10 Target │
│ Prior        │              │              │              │              │ at DEFF = 1.30?       │
├──────────────┼──────────────┼──────────────┼──────────────┼──────────────┼───────────────────────┤
│ 0.400 (Low)  │ 0.1085 (±0.21│ 0.1163 (±0.23│ 0.1237 (±0.24│ 0.1328 (±0.26│ NO (Severe Deficit)   │
│ 0.500 (Mod.) │ 0.0990 (±0.19│ 0.1062 (±0.21│ 0.1129 (±0.22│ 0.1213 (±0.24│ NO (Moderate Deficit) │
│ 0.684 (Base) │ 0.0877 (±0.17│ 0.0941 (±0.18│ 0.1000 (±0.20│ 0.1074 (±0.21│ MEETS TARGET (Exact)  │
│ 0.800 (High) │ 0.0828 (±0.16│ 0.0888 (±0.17│ 0.0945 (±0.19│ 0.1015 (±0.20│ MEETS TARGET          │
│ 1.000 (Broad)│ 0.0767 (±0.15│ 0.0822 (±0.16│ 0.0874 (±0.17│ 0.0939 (±0.18│ MEETS TARGET          │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴───────────────────────┘
```

- **Auditor Interpretation:** If the prospective community screening population exhibits narrower risk heterogeneity ($\text{Var}(\text{LP}) \le 0.50$), $N = 4,800$ will yield slope standard errors between $0.113$ and $0.124$ (margin of error $\pm 0.22\text{--}0.24$).
- **Audit Status:** **`VERIFIED`**

---

## 7. Limitations & Required Human Expert Review

1. **Formal Acceptance of the $5\%$ Precision Trade-off:** The Lead Biostatistician must formally decide whether an $\text{SE} \approx 0.111$ at $5.0\%$ prevalence is clinically acceptable, or whether recruitment must be expanded to $N = 6,000$ to maintain $\text{SE} \le 0.10$ across all possible community scenarios.
2. **Empirical Variance Tracking:** The biostatistical protocol must enforce an unblinded interim check of $\text{Var}(\text{LP})$ at $N = 500$ to ensure variance has not collapsed below $0.50$.

---

```
====================================================================================================
                        SENSITIVITY MATRIX AUDIT END
                  NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED
====================================================================================================
```
