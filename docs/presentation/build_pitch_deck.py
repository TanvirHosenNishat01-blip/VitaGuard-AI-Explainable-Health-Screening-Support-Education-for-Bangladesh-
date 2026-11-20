"""Build the 5-Part Demo Video Plan PowerPoint (.pptx) with all 27 project screenshots."""

import struct
import zipfile
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[2]
SS_DIR = ROOT / "screenshots" / "Project SS"
OUT_PRIMARY = Path(__file__).resolve().parent / "TriNexus_VitaGuard_AIBC_2026.pptx"
OUT_ROOT = ROOT / "TriNexus_VitaGuard_5Part_Presentation.pptx"

# 16:9 Widescreen in EMUs (13.333 in x 7.5 in; 1 in = 914400 EMU)
SLIDE_W = 12192000
SLIDE_H = 6858000


def get_png_size(path: Path) -> tuple[int, int]:
    data = path.read_bytes()
    w, h = struct.unpack(">II", data[16:24])
    return w, h


def fit_rect(img_w: int, img_h: int, box_x: int, box_y: int, box_w: int, box_h: int) -> tuple[int, int, int, int]:
    """Scale (img_w, img_h) to fit inside (box_x, box_y, box_w, box_h) preserving aspect ratio."""
    scale = min(box_w / float(img_w), box_h / float(img_h))
    cx = int(round(img_w * scale))
    cy = int(round(img_h * scale))
    x = box_x + (box_w - cx) // 2
    y = box_y + (box_h - cy) // 2
    return x, y, cx, cy


SLIDES = [
    {
        "part_badge": "AIBC 2026 • PRELIMINARY SUBMISSION DEMO DECK",
        "part_color": "0D9488",
        "headline": "TriNexus | VitaGuard AI — 5-Part Demo Video Presentation",
        "subheadline": "Explainable Screening-Support & Health-Education Workspace (Bengali & English) • Track: HealthSphere AI → PredictRx",
        "narration": "Governance Status: NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED. A screening score is not a diagnosis or prescription.",
        "bullets": [
            ("0:00–0:30 | Part 1: The Problem", "Fragmented health portals, language barriers, and black-box screening scores that patients can easily misread as a clinical diagnosis."),
            ("0:30–1:00 | Part 2: Introduce Solution", "Four strictly separated screening pathways (DiaBD, WHO South Asia Chart, Cleveland, Pima) with bilingual BN/EN UX & explicit cohort limits."),
            ("1:00–2:00 | Part 3: Actual Prototype Flow", "Live input/output walkthroughs of all 4 pathways, Patient/Doctor/Admin portals, simulated Blood Network, and Hospital Directory."),
            ("2:00–2:30 | Part 4: AI Approach", "Local TreeSHAP (DiaBD), global logistic weights (Cleveland), leakage-free Pima benchmark, and locked SHA-256 artifact integrity."),
            ("2:30–3:00 | Part 5: Impact & Next Steps", "Bilingual health awareness, TOTP 2FA admin governance, and roadmap for ethically approved multi-center validation."),
        ],
        "images": [
            ("Homepage.png", "Homepage (/): Bilingual clinical screening modules & separated pathway entry"),
        ],
    },
    {
        "part_badge": "PART 01 (0:00–0:30) • THE PROBLEM",
        "part_color": "B91C1C",
        "headline": "0:00–0:30 | The Problem: Confusing Navigation & Black-Box Health Scores",
        "subheadline": "Why patients and caregivers in Bangladesh need transparent, bilingual, and non-diagnostic screening support",
        "narration": "Suggested Narration (0:00–0:30): \"Finding the right health screening context and hospital service can be confusing. When a screening tool shows a raw score without its dataset source, limits, or clinician review, patients can easily misread it as a diagnosis.\"",
        "bullets": [
            ("Misinterpreting Raw Screening Numbers", "A percentage on a screen is easy to treat as a clinical diagnosis when false-positive rates, cohort origin, and cutoff limits are hidden."),
            ("Language & Health Literacy Barriers", "Many digital health forms lack accurate Bengali clinical terminology, leaving patients unable to understand risk factors or next steps."),
            ("Inappropriate Dataset Mixing", "Combining Western historical cohorts (Pima or Cleveland) with Bangladesh non-invasive screening into a single leaderboard misleads users."),
            ("Unbounded Record Access", "Patients need clear consent gates, right-to-erasure controls, and assurance that doctors only view charts after a confirmed appointment."),
        ],
        "images": [
            ("Dual Language Login page.png", "Bangla Portal (/login): Explicit 'Screening support — score is not a diagnosis' notice"),
            ("Patient Registration.png", "English Portal (/login & /register): Accessible bilingual entry with clear boundaries"),
        ],
    },
    {
        "part_badge": "PART 02 (0:30–1:00) • INTRODUCE SOLUTION",
        "part_color": "0D9488",
        "headline": "0:30–1:00 | Introduce Solution: Four Strictly Separated Screening Pathways",
        "subheadline": "Assessment Hub (/assessment) — Every card states what it offers and its exact clinical & dataset limitations upfront",
        "narration": "Suggested Narration (0:30–1:00): \"Our solution combines bilingual Bangla-English interaction, four separated risk pathways with explicit cohort limits, explainable factor attribution, educational health hubs, and bounded appointment navigation.\"",
        "bullets": [
            ("1. Bangladesh DiaBD (Non-Invasive)", "Local screening index (0–100) + local TreeSHAP on 5,119 cleaned rows (cutoff 0.51). Precision 11.59% (290 FP, 27 FN on 1,024 locked test)."),
            ("2. Pima Research Table (Historical Cohort)", "8-measurement historical Phoenix-area female cohort (ages 21–81). Consented access open; 87.66% figure disclosed as invalid label leakage."),
            ("3. Cleveland Heart Estimate (Historical Cohort)", "13-feature 1984 catheterization cohort (297 rows; 91.67% on 60-row locked test). Global coefficients; not general-population screening."),
            ("4. WHO South Asia CVD Risk Chart", "Deterministic 10-year non-laboratory lookup for ages 40–74 (700/700 cells verified). Not a newly trained ML model."),
        ],
        "images": [
            ("Assesment 1 pic card .png", "Assessment Hub (Top): Bangladesh DiaBD & Pima Research Table pathway cards"),
            ("Assesment 2 pic card.png", "Assessment Hub (Bottom): Cleveland Heart Estimate & WHO South Asia Chart cards"),
        ],
    },
    {
        "part_badge": "PART 02 (0:30–1:00) • INTRODUCE SOLUTION",
        "part_color": "0D9488",
        "headline": "0:30–1:00 | Introduce Solution: Bangladesh Non-Invasive Screening Hub",
        "subheadline": "Dedicated Bangladesh Route (/bangladesh) — Side-by-side DiaBD & WHO South Asia screening without laboratory blood draws",
        "narration": "Key Safeguard: Estimates on /bangladesh stay on the screen and are not auto-saved as prediction rows. Mandatory consent logs time, language, and pathway.",
        "bullets": [
            ("Zero Lab Draw Requirement", "Neither DiaBD nor the WHO South Asia non-lab chart uses blood glucose or serum cholesterol as an input, enabling rapid preliminary triage."),
            ("On-Screen Ephemeral Privacy", "Prominent banner warns: 'Not a diagnosis. Not saved. This estimate stays on this screen.'"),
            ("Explicit Baseline Comparison", "States directly on the card that always answering 'No' on the DiaBD test would be right for 93.7% of rows vs. 69.0% model accuracy at cutoff 0.51."),
            ("Informed Consent Gate", "Users must check the screening consent agreement before running either calculator (missing consent returns HTTP 400)."),
        ],
        "images": [
            ("Bangladesh Assesment Card.png", "Full /bangladesh Workspace: Navigation bar, non-diagnostic banner & dual forms"),
            ("Bangladesh Screnning.png", "Close-Up: DiaBD (6 non-invasive inputs) & WHO 10-Year CVD Chart (ages 40–74)"),
        ],
    },
    {
        "part_badge": "PART 03 (1:00–2:00) • ACTUAL PROTOTYPE FLOW",
        "part_color": "0E7490",
        "headline": "1:00–2:00 | Prototype Flow (Pathway 1): Bangladesh DiaBD Input & TreeSHAP",
        "subheadline": "Bangla Non-Invasive Diabetes Screening (/bangladesh) — Individualized local TreeSHAP directional attribution",
        "narration": "Prototype Demo: Entering 6 non-invasive measurements in Bangla returns an uncalibrated screening index (12.8%, Low band) and per-person TreeSHAP impacts.",
        "bullets": [
            ("Bangla Input Form (6 Measurements)", "Age 25 yrs, Female, BMI 42 kg/m², Family Diabetes: Yes, Systolic BP 112 mmHg, Diastolic BP 68 mmHg + mandatory consent checkbox."),
            ("Server-Derived Clinical Features", "Automatically computes Pulse Pressure (SBP - DBP) and High BP flag (SBP >= 140 or DBP >= 90) inside bd_diabetes_service.py."),
            ("Screening Result & False-Negative Warning", "Model score 12.8% (below 51% cutoff). Clearly warns that the model missed 27 of 65 positive cases on the locked test, so low score != clearance."),
            ("Local TreeSHAP Attribution ('এই মানুষের SHAP')", "Protective (-Risk): Age (-1.4514), Diastolic BP (-0.5986), Systolic BP (-0.3104). Risk-increasing (+Risk): BMI (+0.2930), Pulse Pressure (+0.1413)."),
        ],
        "images": [
            ("DiaBD Screening Input.png", "DiaBD Input (Bangla): 6 non-invasive biometric fields & mandatory consent"),
            ("DiaBD Screening Output.png", "DiaBD Output (Bangla): 12.8% screening score, calibration alert & local TreeSHAP bars"),
        ],
    },
    {
        "part_badge": "PART 03 (1:00–2:00) • ACTUAL PROTOTYPE FLOW",
        "part_color": "0E7490",
        "headline": "1:00–2:00 | Prototype Flow (Pathway 2): WHO South Asia 10-Year CVD Chart",
        "subheadline": "Deterministic Non-Laboratory Cardiovascular Lookup (/bangladesh) — Strictly bounded to ages 40–74",
        "narration": "Prototype Demo: Entering age 47, male, smoker, no prior heart attack/stroke, SBP 73 mmHg, and BMI 45 resolves deterministically to the 7% WHO chart cell.",
        "bullets": [
            ("Deterministic Lookup Table", "Implements the published WHO South Asia non-laboratory chart cells in bd_cvd_chart.py (700 of 700 tested cells matched)."),
            ("Strict Age & Clinical Safety Refusals", "Accepts ages 40–74 only (ages 39 and 75 are refused). Any prior heart attack or stroke immediately stops the chart lookup."),
            ("Bangla Input & Output Clarity", "Displays the resolved chart cell (7%, Low / কম group band) with a 5-segment visual indicator."),
            ("No Fabricated Explainability", "Explicitly labels the result: 'প্রকাশিত ছক। এর SHAP মডেল নেই।' (Published chart; no SHAP model exists for deterministic lookup)."),
        ],
        "images": [
            ("WHO input .png", "WHO Chart Input (Bangla): Age 47, Male, Smoker, No prior event, SBP & BMI"),
            ("WHO Output.png", "WHO Chart Output (Bangla): 7% 10-year risk cell with explicit non-SHAP disclosure"),
        ],
    },
    {
        "part_badge": "PART 03 (1:00–2:00) • ACTUAL PROTOTYPE FLOW",
        "part_color": "0E7490",
        "headline": "1:00–2:00 | Prototype Flow (Pathway 3): Cleveland Heart 5-Step Wizard",
        "subheadline": "Guided 13-Feature Cardiovascular Research Form (/predict/cardio) — Step-by-step verification & global coefficients",
        "narration": "Prototype Demo: The 5-step wizard validates 13 cardiac referral measurements, requires screening consent, and displays standardized logistic regression weights.",
        "bullets": [
            ("5-Step Progressive Clinical Wizard", "1. Basic Info -> 2. Medical History -> 3. Clinical Measurements -> 4. Risk Indicators -> 5. Review & Consent ('ধাপ ৫: ১৩টি কার্ডিয়াক তথ্য যাচাই ও সম্মতি')."),
            ("Strict Code & Range Validation", "Validates all 13 Cleveland variables (Age, Sex, Chest Pain code, Resting BP, Cholesterol, FBS, Resting ECG, Max HR, Exang, Oldpeak, Slope, CA, Thal)."),
            ("High-Risk Screening Alert Output", "Shows 93.26% model score (High Risk band, LogisticRegression) with an amber banner: 'Screening estimate, not a diagnosis. Not saved.'"),
            ("Global Model Feature Coefficients", "Displays standardized logistic weights (Chest pain type 0.4664, Sex 0.3970, Resting BP 0.3022, Fasting blood sugar 0.2885) — never misrepresented as local SHAP."),
        ],
        "images": [
            ("Clinical Wizard input.png", "Cleveland Step 5 Review (Bangla): 13 cardiac measurements & consent check"),
            ("Clinical Wizard output.png", "Cleveland Output: 93.26% High Risk alert & Global Logistic Regression Coefficients"),
        ],
    },
    {
        "part_badge": "PART 03 (1:00–2:00) • ACTUAL PROTOTYPE FLOW",
        "part_color": "0E7490",
        "headline": "1:00–2:00 | Prototype Flow (Pathway 4): Pima Diabetes 5-Step Research Wizard",
        "subheadline": "Historical 8-Measurement Diabetes Form (/predict/diabetes) — Consented access with Phoenix-area cohort disclosure",
        "narration": "Prototype Demo: Guests and signed-in patients can explore the 8-feature Pima form with consent, receiving global feature weights and cohort boundary warnings.",
        "bullets": [
            ("5-Step Review & Consent Gate", "Reviews Age (33 yrs), BMI (22 kg/m²), Pregnancies (2), Pedigree (0.46), Glucose (115 mg/dL), BP (72 mmHg), Insulin (92 mu U/mL), Skin Thickness (21 mm)."),
            ("Biological Zero Imputation Pipeline", "Physiologically impossible zeros in Glucose, BP, Skin Thickness, Insulin, and BMI are replaced via median imputer (imputer.pkl) and scaled (scaler.pkl)."),
            ("Low-Band Output with Safety Caveat", "Model score 15.55% (Low Risk band, XGBoost). Explicitly states: 'Low Screening Band — Not a Medical Clearance' and not validated in Bangladesh."),
            ("Transparent Global Model Weights", "Labels feature bars clearly: 'GLOBAL MODEL WEIGHTS. THESE WEIGHTS ARE THE SAME FOR EVERY PERSON' (Insulin 0.4104, Glucose 0.1849, SkinThickness 0.1714)."),
        ],
        "images": [
            ("pima input.png", "Pima Step 5 Review (Bangla): 8 clinical/lab measurements & mandatory consent"),
            ("Pima Output.png", "Pima Output: 15.55% Low Risk estimate, cohort disclaimer & global model weights"),
        ],
    },
    {
        "part_badge": "PART 03 (1:00–2:00) • ACTUAL PROTOTYPE FLOW",
        "part_color": "0E7490",
        "headline": "1:00–2:00 | Prototype Flow: Bounded Patient & Doctor Role Workspaces",
        "subheadline": "Role-Based Access Control (/dashboard, /register, /doctor/dashboard) — Confirmed-appointment gate protects patient privacy",
        "narration": "Prototype Demo: Patients manage records, notifications, and appointments. Doctors remain locked until admin review and cannot open a chart from a pending request.",
        "bullets": [
            ("Patient Portal (/dashboard)", "Shows unread notifications, saved screening history, doctor guidelines, appointment booking, and one-click 'Delete my screening records' (Right to Erasure)."),
            ("Doctor Registration Gate (/register)", "Requires BMDC registration number, specialty, and hospital/chamber. Notice states: 'Account stays locked until an admin reviews the BMDC number.'"),
            ("Strict Chart Privacy (care_access.py)", "A doctor can view a patient's record ONLY after a confirmed appointment or that doctor's own guideline. Pending requests grant zero access; patient email is omitted."),
        ],
        "images": [
            ("Patient Dashboard.png", "Patient Dashboard: Notifications, quick actions & data erasure"),
            ("Doctor Registration.png", "Doctor Registration: BMDC input & admin-review lock notice"),
            ("Doctor Dashboard.png", "Doctor Portal: Admin-reviewed badge, appointments & clinical review tabs"),
        ],
    },
    {
        "part_badge": "PART 03 (1:00–2:00) • ACTUAL PROTOTYPE FLOW",
        "part_color": "0E7490",
        "headline": "1:00–2:00 | Prototype Flow: Simulated Blood Network & Hospital Directory",
        "subheadline": "Synthetic Community Coordination (/blood) & Honesty-Marked Facility Directory (/hospitals)",
        "narration": "Prototype Demo: Follows competition guidelines by using synthetic data for the blood network demonstration and explicitly marking unverified hospital directory fields.",
        "bullets": [
            ("Labeled Blood Network Simulation (/blood)", "Prominent banner: 'SIMULATED DEMONSTRATION — This is a simulated demonstration. No real blood donation or hospital coordination takes place.'"),
            ("Synthetic Donors & Private Preferences", "Public list displays only synthetic rows (Synthetic Donor A/B/D) with no phone/email exposed. A patient's saved preference is never added to the public synthetic list."),
            ("Curated 50-Hospital Directory (/hospitals)", "Includes a 'Verification pending' banner explaining that street address, phone, thana, and specialty lists stay marked 'Not verified' where unchecked."),
        ],
        "images": [
            ("Blood Network 1.png", "Blood Network (/blood): Synthetic donors list with SIMULATED DEMONSTRATION badge"),
            ("Blood N 2.png", "Simulated Blood Request Form: Routine/Urgent synthetic clinic request"),
            ("Hospital Searching.png", "Hospital Directory (/hospitals): 50 hospitals with 'Verification pending' notice"),
        ],
    },
    {
        "part_badge": "PART 04 (2:00–2:30) • AI APPROACH & SAFEGUARDS",
        "part_color": "4F46E5",
        "headline": "2:00–2:30 | AI Approach: Model Evaluation, Leakage Audit & Provenance",
        "subheadline": "Public Evaluation Dashboard (/evaluation) — Held-out confusion matrices, 95% confidence intervals & provenance disclosures",
        "narration": "Suggested Narration (2:00–2:30): \"Our AI architecture documents exact models, data sources, SHA-256 artifact hashes, and safeguards—disclosing historical Pima label leakage and unverified DiaBD site provenance rather than hiding limitations.\"",
        "bullets": [
            ("Latest Research Conclusion Disclosed", "No experimental candidate met the pre-registered bar for production replacement; all 9 production & research ML artifacts remain hash-locked (SHA-256 verified)."),
            ("Pima Leakage Rejection", "Explicitly states on screen that the older 87.66% accuracy is invalid due to target-conditional insulin fills; reports leakage-free 5-fold OOF PR-AUC 0.7166 & Brier 0.1627."),
            ("DiaBD Held-Out Confusion Matrix (1,024 rows)", "Cutoff 0.51: Sensitivity 58.5% (38 TP, 27 FN), Specificity 69.8% (669 TN, 290 FP), Precision 11.6%, Accuracy 69.0% (vs 93.7% majority-class baseline)."),
            ("Cleveland Held-Out Matrix (60 rows)", "Sensitivity 82.1% (23 TP, 5 FN), Specificity 100.0% (32 TN, 0 FP), ROC-AUC 0.9542, Accuracy 91.7% (1984 catheterization cohort, not Bangladesh validation)."),
        ],
        "images": [
            ("Model Evaluation Top.png", "Model Evaluation (/evaluation): Research conclusion, Pima leakage note & WHO consistency"),
            ("Model Evaluation.png", "Held-Out Confusion Matrices: DiaBD (1,024 test rows) & Cleveland (60 test rows)"),
        ],
    },
    {
        "part_badge": "PART 05 (2:30–3:00) • IMPACT AND NEXT STEPS",
        "part_color": "15803D",
        "headline": "2:30–3:00 | Impact & Next Steps: Education, TOTP Governance & Roadmap",
        "subheadline": "Admin 2FA Oversight (/admin/dashboard), Doctor Health Notices (/notices), Bilingual Awareness (/awareness) & Future Clinical Roadmap",
        "narration": "Suggested Narration (2:30–3:00): \"Next, we will evaluate user comprehension and task-completion times, expand Bangla accessibility, implement database encryption, and pursue BMRC/DGHS-approved hospital validation.\"",
        "bullets": [
            ("TOTP 2FA Admin Governance (/admin/dashboard)", "Enforces 6-digit authenticator login, monitors active/disabled patient accounts (19 active, 1 disabled, 47 records), reviews doctors, and logs every security event."),
            ("Verified Doctor Notices & Awareness Hub", "Approved doctors publish educational notices (/notices); Awareness Hub (/awareness) curates WHO, CDC, Mayo Clinic, BIRDEM, NHFB & DGHS resources with Bangla summaries."),
            ("Next Steps & Validation Roadmap", "1. BMRC/DGHS ethical submission & multi-center Bangladesh cohort acquisition. 2. Database encryption at rest & login rate limiting. 3. Authorized hospital pilot testing."),
        ],
        "images": [
            ("Admin Dashboard.png", "Admin Dashboard (2FA Verified): System metrics & security audit logs"),
            ("Doctors Health Notice .png", "Health Notices (/notices): Admin-reviewed doctor educational bulletins"),
            ("Awareness Hub.png", "Awareness Hub (/awareness): Curated WHO, CDC, Mayo Clinic & AHA videos"),
            ("Awareness 2.png", "Trusted Health Portals: BIRDEM, National Heart Foundation, DGHS & WHO links"),
        ],
    },
]


def rect_shape(shape_id: int, name: str, x: int, y: int, cx: int, cy: int, fill_hex: str, line_hex: str = None, radius: int = None) -> str:
    geom = f'<a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val {radius}"/></a:avLst></a:prstGeom>' if radius else '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>'
    line_xml = f'<a:ln w="12700"><a:solidFill><a:srgbClr val="{line_hex}"/></a:solidFill></a:ln>' if line_hex else '<a:ln><a:noFill/></a:ln>'
    return f'''<p:sp>
  <p:nvSpPr><p:cNvPr id="{shape_id}" name="{escape(name)}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
  <p:spPr>
    <a:xfrm><a:off x="{x}" y="{y}"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm>
    {geom}
    <a:solidFill><a:srgbClr val="{fill_hex}"/></a:solidFill>
    {line_xml}
  </p:spPr>
  <p:txBody><a:bodyPr/><a:lstStyle/><a:p/></p:txBody>
</p:sp>'''


def text_shape(shape_id: int, name: str, x: int, y: int, cx: int, cy: int, paragraphs_xml: str, fill_hex: str = None, line_hex: str = None, radius: int = None, inset: tuple[int, int, int, int] = (91440, 54864, 91440, 54864)) -> str:
    geom = f'<a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val {radius}"/></a:avLst></a:prstGeom>' if radius else '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>'
    fill_xml = f'<a:solidFill><a:srgbClr val="{fill_hex}"/></a:solidFill>' if fill_hex else '<a:noFill/>'
    line_xml = f'<a:ln w="12700"><a:solidFill><a:srgbClr val="{line_hex}"/></a:solidFill></a:ln>' if line_hex else '<a:ln><a:noFill/></a:ln>'
    l_ins, t_ins, r_ins, b_ins = inset
    return f'''<p:sp>
  <p:nvSpPr><p:cNvPr id="{shape_id}" name="{escape(name)}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
  <p:spPr>
    <a:xfrm><a:off x="{x}" y="{y}"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm>
    {geom}
    {fill_xml}
    {line_xml}
  </p:spPr>
  <p:txBody>
    <a:bodyPr wrap="square" lIns="{l_ins}" tIns="{t_ins}" rIns="{r_ins}" bIns="{b_ins}"/>
    <a:lstStyle/>
    {paragraphs_xml}
  </p:txBody>
</p:sp>'''


def para(runs: list[tuple[str, int, str, bool]], align: str = "l", spc_before: int = 0, spc_after: int = 400) -> str:
    p_pr = f'<a:pPr algn="{align}">'
    if spc_before > 0:
        p_pr += f'<a:spcBef><a:spcPts val="{spc_before}"/></a:spcBef>'
    if spc_after > 0:
        p_pr += f'<a:spcAft><a:spcPts val="{spc_after}"/></a:spcAft>'
    p_pr += "</a:pPr>"
    runs_xml = ""
    for text, sz, color, bold in runs:
        b_attr = ' b="1"' if bold else ""
        runs_xml += f'''<a:r>
  <a:rPr lang="en-US" sz="{sz}"{b_attr} dirty="0">
    <a:solidFill><a:srgbClr val="{color}"/></a:solidFill>
    <a:latin typeface="Calibri"/>
    <a:cs typeface="Nirmala UI"/>
    <a:ea typeface="Nirmala UI"/>
  </a:rPr>
  <a:t>{escape(text)}</a:t>
</a:r>'''
    return f"<a:p>{p_pr}{runs_xml}</a:p>"


def pic_shape(shape_id: int, r_id: str, name: str, x: int, y: int, cx: int, cy: int) -> str:
    return f'''<p:pic>
  <p:nvPicPr>
    <p:cNvPr id="{shape_id}" name="{escape(name)}"/>
    <p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr>
    <p:nvPr/>
  </p:nvPicPr>
  <p:blipFill>
    <a:blip r:embed="{r_id}"/>
    <a:stretch><a:fillRect/></a:stretch>
  </p:blipFill>
  <p:spPr>
    <a:xfrm><a:off x="{x}" y="{y}"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm>
    <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
    <a:ln w="12700"><a:solidFill><a:srgbClr val="CBD5E1"/></a:solidFill></a:ln>
  </p:spPr>
</p:pic>'''


def build_slide_xml(slide_idx: int, total_slides: int, slide_data: dict, img_entries: list[tuple[str, str, int, int]]) -> str:
    shapes = []
    sid = 2

    # 1. Background canvas (#F4F7FA)
    shapes.append(rect_shape(sid, "Background", 0, 0, SLIDE_W, SLIDE_H, "F4F7FA"))
    sid += 1

    # 2. Top dark-navy header bar (#12304A)
    header_h = 1140000
    shapes.append(rect_shape(sid, "HeaderBar", 0, 0, SLIDE_W, header_h, "12304A"))
    sid += 1

    # 3. Part badge pill inside header
    shapes.append(
        text_shape(
            sid,
            "PartBadge",
            365760,
            130000,
            4200000,
            270000,
            para([(slide_data["part_badge"], 1050, "FFFFFF", True)], align="c", spc_after=0),
            fill_hex=slide_data["part_color"],
            radius=15000,
            inset=(45720, 22860, 45720, 22860),
        )
    )
    sid += 1

    # 4. Governance status pill top-right
    shapes.append(
        text_shape(
            sid,
            "GovernanceBadge",
            7550000,
            130000,
            4276000,
            270000,
            para([("GOVERNANCE: NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT", 900, "FEF2F2", True)], align="c", spc_after=0),
            fill_hex="7F1D1D",
            radius=15000,
            inset=(36576, 22860, 36576, 22860),
        )
    )
    sid += 1

    # 5. Headline & Subheadline in Header
    header_paras = (
        para([(slide_data["headline"], 2100, "FFFFFF", True)], spc_after=150)
        + para([(slide_data["subheadline"], 1150, "99F6E4", False)], spc_after=0)
    )
    shapes.append(
        text_shape(
            sid,
            "HeaderTitle",
            365760,
            420000,
            11460000,
            680000,
            header_paras,
            inset=(0, 10000, 0, 10000),
        )
    )
    sid += 1

    # 6. Left Column: Bullet Cards + Narration Callout
    left_x = 365760
    left_w = 4550000
    content_top = 1280000
    content_bottom = 6380000
    avail_h = content_bottom - content_top

    narration_h = 840000
    bullets_area_h = avail_h - narration_h - 110000
    bullets = slide_data["bullets"]
    n_bullets = len(bullets)
    gap_y = 85000
    card_h = (bullets_area_h - gap_y * (n_bullets - 1)) // n_bullets

    for b_idx, (b_title, b_body) in enumerate(bullets):
        cy_pos = content_top + b_idx * (card_h + gap_y)
        card_paras = (
            para([(f"▸  {b_title}", 1200, "0F172A", True)], spc_after=150)
            + para([(b_body, 1020, "334155", False)], spc_after=0)
        )
        shapes.append(
            text_shape(
                sid,
                f"BulletCard_{b_idx+1}",
                left_x,
                cy_pos,
                left_w,
                card_h,
                card_paras,
                fill_hex="FFFFFF",
                line_hex="CBD5E1",
                radius=6000,
                inset=(105000, 55000, 105000, 55000),
            )
        )
        sid += 1

    # Left accent bar + Narration box at bottom of Left Column
    narr_y = content_bottom - narration_h
    shapes.append(
        text_shape(
            sid,
            "NarrationBox",
            left_x,
            narr_y,
            left_w,
            narration_h,
            para([(slide_data["narration"], 980, "134E4A", True)], spc_after=0),
            fill_hex="CCFBF1",
            line_hex="0D9488",
            radius=6000,
            inset=(105000, 60000, 105000, 60000),
        )
    )
    sid += 1

    # 7. Right Column: Screenshot Showcase Cards
    right_x = 5080000
    right_w = 6746000
    right_h = avail_h
    n_imgs = len(img_entries)

    # Calculate grid boxes for 1, 2, 3, or 4 screenshots
    boxes = []
    if n_imgs == 1:
        boxes.append((right_x, content_top, right_w, right_h))
    elif n_imgs == 2:
        # Check aspect ratios: if both are portrait/tall (w < h * 1.1), place side-by-side;
        # if both are very wide (w > h * 1.45), stack top-and-bottom; otherwise side-by-side
        ar0 = img_entries[0][2] / float(img_entries[0][3])
        ar1 = img_entries[1][2] / float(img_entries[1][3])
        if ar0 > 1.42 and ar1 > 1.42:
            gap = 120000
            bh = (right_h - gap) // 2
            boxes.append((right_x, content_top, right_w, bh))
            boxes.append((right_x, content_top + bh + gap, right_w, bh))
        else:
            gap = 130000
            bw = (right_w - gap) // 2
            boxes.append((right_x, content_top, bw, right_h))
            boxes.append((right_x + bw + gap, content_top, bw, right_h))
    elif n_imgs == 3:
        gap = 110000
        top_h = (right_h - gap) // 2
        bot_w = (right_w - gap) // 2
        boxes.append((right_x, content_top, right_w, top_h))
        boxes.append((right_x, content_top + top_h + gap, bot_w, top_h))
        boxes.append((right_x + bot_w + gap, content_top + top_h + gap, bot_w, top_h))
    else:  # 4 images -> 2x2 grid
        gap_x = 120000
        gap_y_grid = 110000
        bw = (right_w - gap_x) // 2
        bh = (right_h - gap_y_grid) // 2
        boxes.append((right_x, content_top, bw, bh))
        boxes.append((right_x + bw + gap_x, content_top, bw, bh))
        boxes.append((right_x, content_top + bh + gap_y_grid, bw, bh))
        boxes.append((right_x + bw + gap_x, content_top + bh + gap_y_grid, bw, bh))

    for idx_img, ((r_id, caption, img_w, img_h), (bx, by, bw, bh)) in enumerate(zip(img_entries, boxes)):
        # Card container behind screenshot
        shapes.append(rect_shape(sid, f"ImgCard_{idx_img+1}", bx, by, bw, bh, "FFFFFF", line_hex="CBD5E1", radius=5000))
        sid += 1

        # Top caption banner inside card
        cap_h = 310000
        shapes.append(
            text_shape(
                sid,
                f"ImgCaption_{idx_img+1}",
                bx + 20000,
                by + 15000,
                bw - 40000,
                cap_h,
                para([(f"📸  {caption}", 920, "12304A", True)], align="c", spc_after=0),
                fill_hex="E2E8F0",
                radius=4000,
                inset=(45720, 20000, 45720, 20000),
            )
        )
        sid += 1

        # Fit screenshot inside remaining area of the card
        pad = 55000
        inner_x = bx + pad
        inner_y = by + cap_h + 35000
        inner_w = bw - 2 * pad
        inner_h = bh - cap_h - pad - 35000
        px, py, pcx, pcy = fit_rect(img_w, img_h, inner_x, inner_y, inner_w, inner_h)
        shapes.append(pic_shape(sid, r_id, f"Screenshot_{idx_img+1}", px, py, pcx, pcy))
        sid += 1

    # 8. Bottom Footer Bar
    footer_y = 6480000
    footer_h = SLIDE_H - footer_y
    shapes.append(rect_shape(sid, "FooterBar", 0, footer_y, SLIDE_W, footer_h, "12304A"))
    sid += 1

    footer_text = f"TriNexus | VitaGuard AI  •  AIBC 2026 Three-Minute Demo Video Plan (5 Headline Sections)  •  Slide {slide_idx} of {total_slides}"
    shapes.append(
        text_shape(
            sid,
            "FooterText",
            365760,
            footer_y + 35000,
            11460000,
            footer_h - 70000,
            para([(footer_text, 950, "CBD5E1", False)], align="c", spc_after=0),
            inset=(0, 10000, 0, 10000),
        )
    )

    shapes_str = "\n".join(shapes)
    return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      {shapes_str}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>'''


def build_deck(out_paths: list[Path]):
    count = len(SLIDES)
    media_files: dict[str, bytes] = {}
    img_counter = 0

    overrides = "".join(
        f'<Override PartName="/ppt/slides/slide{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>'
        for i in range(1, count + 1)
    )
    content_types = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Default Extension="png" ContentType="image/png"/>
<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
{overrides}
</Types>'''

    sld_ids = "".join(
        f'<p:sldId id="{255 + i}" r:id="rId{i}"/>'
        for i in range(1, count + 1)
    )
    presentation = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rIdMaster"/></p:sldMasterIdLst>
  <p:sldIdLst>{sld_ids}</p:sldIdLst>
  <p:sldSz cx="{SLIDE_W}" cy="{SLIDE_H}" type="screen16x9"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>'''

    pres_rels = "".join(
        f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide{i}.xml"/>'
        for i in range(1, count + 1)
    )
    pres_rels += '<Relationship Id="rIdMaster" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>'

    master = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
</p:sldMaster>'''

    layout = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank">
  <p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld>
</p:sldLayout>'''

    theme = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="VitaGuard">
  <a:themeElements>
    <a:clrScheme name="VitaGuard"><a:dk1><a:srgbClr val="12304A"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="334155"/></a:dk2><a:lt2><a:srgbClr val="F6F9FC"/></a:lt2><a:accent1><a:srgbClr val="0D9488"/></a:accent1><a:accent2><a:srgbClr val="0E7490"/></a:accent2><a:accent3><a:srgbClr val="D97706"/></a:accent3><a:accent4><a:srgbClr val="15803D"/></a:accent4><a:accent5><a:srgbClr val="12304A"/></a:accent5><a:accent6><a:srgbClr val="64748B"/></a:accent6><a:hlink><a:srgbClr val="0E7490"/></a:hlink><a:folHlink><a:srgbClr val="64748B"/></a:folHlink></a:clrScheme>
    <a:fontScheme name="VitaGuard"><a:majorFont><a:latin typeface="Calibri"/></a:majorFont><a:minorFont><a:latin typeface="Calibri"/></a:minorFont></a:fontScheme>
    <a:fmtScheme name="VitaGuard"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="6350"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme>
  </a:themeElements>
</a:theme>'''

    xml_files = {
        "[Content_Types].xml": content_types,
        "_rels/.rels": '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>''',
        "ppt/presentation.xml": presentation,
        "ppt/_rels/presentation.xml.rels": f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">{pres_rels}</Relationships>''',
        "ppt/slideMasters/slideMaster1.xml": master,
        "ppt/slideMasters/_rels/slideMaster1.xml.rels": '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/></Relationships>''',
        "ppt/slideLayouts/slideLayout1.xml": layout,
        "ppt/slideLayouts/_rels/slideLayout1.xml.rels": '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>''',
        "ppt/theme/theme1.xml": theme,
    }

    for slide_idx, slide_data in enumerate(SLIDES, start=1):
        rels_items = [
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>'
        ]
        img_entries = []
        for local_idx, (filename, caption) in enumerate(slide_data["images"], start=1):
            img_path = SS_DIR / filename
            if not img_path.exists():
                raise FileNotFoundError(f"Missing screenshot: {img_path}")
            img_counter += 1
            media_name = f"image{img_counter}.png"
            media_files[f"ppt/media/{media_name}"] = img_path.read_bytes()
            w, h = get_png_size(img_path)
            r_id = f"rIdImg{local_idx}"
            rels_items.append(
                f'<Relationship Id="{r_id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/{media_name}"/>'
            )
            img_entries.append((r_id, caption, w, h))

        xml_files[f"ppt/slides/slide{slide_idx}.xml"] = build_slide_xml(slide_idx, count, slide_data, img_entries)
        xml_files[f"ppt/slides/_rels/slide{slide_idx}.xml.rels"] = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
            f'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">{"".join(rels_items)}</Relationships>'
        )

    for out_path in out_paths:
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(out_path, "w", compression=zipfile.ZIP_DEFLATED) as package:
            for name, text in xml_files.items():
                package.writestr(name, text.encode("utf-8"))
            for name, raw_bytes in media_files.items():
                package.writestr(name, raw_bytes)
        print(f"Created: {out_path} ({out_path.stat().st_size:,} bytes, {img_counter} embedded screenshots)")


if __name__ == "__main__":
    build_deck([OUT_PRIMARY, OUT_ROOT])
