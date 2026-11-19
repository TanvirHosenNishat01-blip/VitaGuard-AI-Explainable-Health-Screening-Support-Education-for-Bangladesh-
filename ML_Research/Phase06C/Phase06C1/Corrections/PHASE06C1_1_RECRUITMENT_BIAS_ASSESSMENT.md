# Phase 06C.1.1 — Recruitment & Spectrum Bias Assessment
**TriNexus | VitaGuard AI — Clinical Machine Learning Division**  
**Document Date:** November 10, 2026  
**Auditor:** Clinical Epidemiologist, Healthcare AI Safety Reviewer & Biostatistician  
**Focus:** Critical Evaluation of Ambulatory Outpatient vs. Community Screening Populations  
**Status:** **FROZEN RECRUITMENT BIAS & SAFEGUARDS REPORT**

---

## 1. Executive Summary & Core Methodological Principle

In Phase 06C.1, document `PHASE06C1_EXTERNAL_COHORT_ACQUISITION_PROTOCOL.md` proposed recruiting participants from outpatient waiting rooms of Upazila Health Complexes (UHCs) and District Sadar Hospitals across six administrative divisions.

A critical biostatistical principle must be enforced before ethical submission:

> [!CAUTION]
> **GOVERNANCE AXIOM ON POPULATION REPRESENTATIVENESS:**  
> **Geographic diversity alone DOES NOT establish population representativeness.**  
> Recruiting participants from hospital outpatient waiting rooms in six different divisions still produces a **hospital-referred cohort**, not a general community screening cohort.  
> If an AI screening model is validated exclusively on hospital clinic visitors, its performance estimates will suffer from **Spectrum Bias** and will not reflect performance in true community screening.

---

## 2. Spectrum Bias & Referral Distortion Analysis

### 2.1 The Spectrum Effect in Primary Care Machine Learning
A diagnostic screening model's sensitivity, specificity, and positive predictive value are not intrinsic mathematical constants; they vary with the **spectrum of patient illness** (Ransohoff & Feinstein, NEJM 1978).

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│              COMMUNITY SCREENING vs. HOSPITAL OUTPATIENT RECRUITMENT             │
├──────────────────────────────────────────────────────────────────────────────────┤
│ TRUE INTENDED TARGET: RURAL COMMUNITY SCREENING (Door-to-Door / Union Clinics)   │
│ • Population: Asymptomatic adults living in rural villages.                      │
│ • Health Seeking: Not currently seeking acute or chronic medical care.           │
│ • Disease Spectrum: Mild, early-stage, asymptomatic hyperglycemia (HbA1c 6.5-7.5)│
│ • Baseline Prevalence: 5.0% to 7.0%.                                             │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                      vs.                                         │
├──────────────────────────────────────────────────────────────────────────────────┤
│ PROPOSED PROTOCOL: UPAZILA HEALTH COMPLEX OUTPATIENT WAITING ROOMS               │
│ • Population: Individuals who traveled to a hospital for healthcare services.    │
│ • Health Seeking: Presenting for minor complaints, family illness, or symptoms.  │
│ • Disease Spectrum: Enriched with advanced hyperglycemia, symptomatic diabetes,   │
│   co-morbid hypertension, obesity, and higher chronic disease awareness.         │
│ • Baseline Prevalence: 10.0% to 15.0%.                                           │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Mechanism of Performance Distortion
1. **Inflated Sensitivity (Case-Mix Distortion):**  
   Patients in hospital outpatient departments often have more pronounced metabolic abnormalities (higher BMI, higher SBP, advanced microvascular changes) than asymptomatic community residents. Models tested on more severe cases exhibit artificially elevated sensitivity ("the easy cases to detect").
2. **Degraded Specificity in Primary Care:**  
   When the model is subsequently rolled out in rural villages, patients have subtle, borderline physiological deviations. The false-positive rate rises, and real-world specificity drops below validation estimates.
3. **Pre-Test Probability Inversion (PPV/NPV):**  
   Positive Predictive Value is directly proportional to disease prevalence (Bayes' Theorem). A positive result in a $12\%$ hospital outpatient clinic carries far higher predictive certainty than in a $5\%$ rural community village.

---

## 3. Methodological Safeguards Against Recruitment Bias

To mitigate spectrum bias and ensure the external validation cohort reflects real-world screening populations, the recruitment protocol must incorporate five operational safeguards:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   MANDATORY RECRUITMENT BIAS SAFEGUARDS                          │
├──────────────────────────────────────────────────────────────────────────────────┤
│ SAFEGUARD 1: DUAL-ARM RECRUITMENT (50% Community Outreach / 50% Outpatient)      │
│ • At least 50% of the cohort must be recruited from Union Parishad Community     │
│   Clinics and mobile outreach health camps in rural villages, completely         │
│   detached from hospital waiting rooms.                                          │
├──────────────────────────────────────────────────────────────────────────────────┤
│ SAFEGUARD 2: CONSECUTIVE INTAKE PROTOCOL                                         │
│ • Recruit every consecutive presenting eligible adult during designated          │
│   screening hours, prohibiting staff from cherry-picking "obviously healthy"    │
│   or "obviously diabetic" individuals (convenience sampling ban).                │
├──────────────────────────────────────────────────────────────────────────────────┤
│ SAFEGUARD 3: EXPLICIT REASON-FOR-ATTENDANCE LOGGING                              │
│ • Categorize each participant's primary presentation reason:                      │
│   (a) Healthy routine wellness check,                                            │
│   (b) Accompanying a family member,                                              │
│   (c) Minor non-metabolic complaint (e.g. skin rash, minor trauma, dental),      │
│   (d) Suspected metabolic or cardiovascular symptom.                             │
├──────────────────────────────────────────────────────────────────────────────────┤
│ SAFEGUARD 4: INDEPENDENT STRATIFIED ANALYSIS (Hospital vs. Community Camps)      │
│ • Pre-register a stratified statistical analysis evaluating model AUROC, Brier,  │
│   and calibration separately within the hospital arm and the community arm.     │
├──────────────────────────────────────────────────────────────────────────────────┤
│ SAFEGUARD 5: HEALTHY VOLUNTEER BIAS AUDIT                                        │
│ • Capture demographic profiles of individuals who decline consent to evaluate    │
│   whether non-participants differ in age, sex, or socioeconomic status.          │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Formal Protocol Limitations to Disclose in Ethics Submissions

The formal protocol submitted to the BMRC National Ethics Review Committee must explicitly disclose the following epidemiological limitations:
1. **Residual Hospital Referral Bias:** Despite recruiting at primary-level UHCs, participants attending government health complexes represent individuals with access to transportation and health-seeking behavior. Ultra-remote, marginalized indigenous, or bedridden populations may remain under-represented.
2. **Exclusion of Non-Fasting Ambulatory Subjects:** Participants unwilling or unable to return for an 8-hour fasting blood draw will be excluded, which may induce healthy volunteer selection bias.
3. **Geographic Coverage Limitation:** While covering 4–6 administrative divisions improves regional heterogeneity, it does not constitute a nationally representative probability sample (such as the Bangladesh Demographic and Health Survey [BDHS] or national WHO STEPS survey).

---

## 5. Auditor Pre-Submission Sign-Off

The recruitment methodology has been critically audited. The protocol is updated to enforce a **50% community outreach recruitment arm** to prevent hospital spectrum bias from distorting external validation results.
