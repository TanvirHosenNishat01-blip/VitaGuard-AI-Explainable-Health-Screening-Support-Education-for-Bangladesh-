"""Build the One-Page Project Summary (.docx) following Page 3 of the AIBC 2026 Preliminary Submission Demo PDF."""

import zipfile
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[2]
OUT_ROOT = ROOT / "TriNexus_VitaGuard_One_Page_Project_Summary.docx"
OUT_SUBMISSION = ROOT / "submission" / "TriNexus_VitaGuard_One_Page_Project_Summary.docx"

SECTIONS = [
    (
        "Project Overview",
        "TriNexus | VitaGuard AI is a local, bilingual (Bangla and English) screening-support and health-education workspace built for the AIBC 2026 HealthSphere AI (PredictRx) track. It keeps four screening pathways strictly separate, explains how every score is produced, offers source-cited educational search and hospital directory navigation, and enforces bounded patient, doctor, and admin workflows. No output is a diagnosis, prescription, or substitute for a clinician.",
    ),
    (
        "Problem Statement",
        "Patients and caregivers in Bangladesh face fragmented health information, language barriers in clinical forms, and unexplained risk percentages. A raw screening score is easily misinterpreted as a medical diagnosis when its dataset origin, cohort limits, false-positive rate, and requirement for physician review are hidden or blended across incompatible cohorts.",
    ),
    (
        "Proposed AI Solution",
        "VitaGuard AI separates four pathways on /assessment so users see scope and limits upfront: (1) Bangladesh DiaBD non-invasive diabetes screening index (0–100, glucose excluded) with local TreeSHAP attribution; (2) WHO South Asia 10-year non-lab CVD chart lookup (ages 40–74); (3) Cleveland 13-feature historical cardiovascular research form; and (4) Pima 8-measurement historical diabetes research form. Alongside these sit a lexical project-note search (/knowledge), concept graph (/knowledge/graph), 50-hospital directory (/hospitals), labeled synthetic blood network (/blood), and role-gated appointments.",
    ),
    (
        "Technical Approach",
        "Built as a decoupled local stack: React 18, Vite 5, React Router 6, and Tailwind CSS (http://127.0.0.1:5173) paired with a FastAPI, SQLAlchemy 2.0, and SQLite backend (http://127.0.0.1:8000). Inference uses locked scikit-learn, XGBoost, Joblib, and SHAP artifacts verified by SHA-256 hashes. Knowledge search uses deterministic lexical overlap without invoking the prediction engine or fabricating answers.",
    ),
    (
        "Prototype Demonstration",
        "The local prototype and demo video show: guest checks on /assessment and /bangladesh (DiaBD and WHO South Asia in Bangla/English with mandatory consent gates); 5-step guided wizards for Cleveland and Pima; a Patient Portal (/dashboard) with screening history, 30-minute appointment booking, and data deletion; a Doctor Portal (/doctor/dashboard) for appointment confirmation and case review; a TOTP 2FA Admin Portal (/admin/dashboard); and a simulated Blood Network (/blood).",
    ),
    (
        "Bangla Localization and Accessibility",
        "Supports one-click switching between Bangla and English via 266 matched Bangla and 266 English translation keys (i18n.js), plain-language clinical summaries, directional SHAP bars (+Risk / -Risk), keyboard-accessible navigation, and progressive 5-step wizards.",
    ),
    (
        "Expected Impact and Evaluation",
        "Reduces score misinterpretation by reporting held-out and research-fold metrics on /evaluation: DiaBD (5,119 rows; 1,024-row locked test at cutoff 0.51: 69.04% accuracy, 11.59% precision, 58.46% recall; ages 21–40 OOF recall ~32.08%); Cleveland (297 rows; 60-row locked test: 91.67% accuracy); WHO South Asia chart (700/700 cells matched); and Pima (legacy 87.66% figure rejected due to insulin imputation leakage; leakage-free logistic C=0.3 OOF PR-AUC 0.7166, Brier 0.1627). Passes all 6 backend verification suites and production frontend build.",
    ),
    (
        "Development Roadmap",
        "Completed (Local Prototype): Four separated pathways, local TreeSHAP, BN/EN UI, RBAC + Admin TOTP 2FA, confirmed-appointment chart gate, lexical knowledge graph, and SHA-256 integrity checks. Planned (Requires Approval): BMRC/DGHS ethics approval and multi-center Bangladesh validation cohort; database encryption at rest, login rate limiting, and verified dataset licenses; usability studies and hospital pilots.",
    ),
    (
        "Responsible AI and Data Protection",
        "Enforces mandatory per-run screening consent (HTTP 400 if missing) and keeps guest /bangladesh estimates ephemeral on screen. Doctors view patient records only after a confirmed appointment or their own clinical guideline (patient email omitted). Uses bcrypt passwords, HS256 JWT issuer/audience checks, RFC 6238 TOTP 2FA for admins, a labeled synthetic blood network, and suppresses unverified subgroup fairness metrics on /fairness.",
    ),
    (
        "Team and AI Provenance",
        "Team TriNexus: Tanvir Hosen Nishat (Model, data review & explainability), Zayed (Healthcare research notes), Farhan (Backend & API), Siam (Frontend), Monima (Documentation, UI writing & presentation), and Fardin (Data support)—contributor roles only, not clinical credentials. Data Sources: DiaBD (Mendeley DOI 10.17632/m8cgwxs9s6; site-level sampling frame unverified), UCI Pima, 1984 Cleveland cohort, and WHO South Asia chart (redistribution licenses NOT VERIFIED).",
    ),
]


def w_para(runs: list[tuple[str, int, str, bool]], space_before: int = 0, space_after: int = 55, line: int = 230, align: str = "both", bottom_border: str = None, shading: str = None) -> str:
    p_pr = f'<w:pPr><w:spacing w:before="{space_before}" w:after="{space_after}" w:line="{line}" w:lineRule="auto"/><w:jc w:val="{align}"/>'
    if bottom_border:
        p_pr += f'<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="2" w:color="{bottom_border}"/></w:pBdr>'
    if shading:
        p_pr += f'<w:shd w:val="clear" w:color="auto" w:fill="{shading}"/>'
    p_pr += "</w:pPr>"

    runs_xml = ""
    for text, sz_half_pt, color_hex, is_bold in runs:
        b_tag = "<w:b/><w:bCs/>" if is_bold else ""
        runs_xml += (
            f'<w:r><w:rPr>'
            f'<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Nirmala UI"/>'
            f'{b_tag}<w:color w:val="{color_hex}"/><w:sz w:val="{sz_half_pt}"/><w:szCs w:val="{sz_half_pt}"/>'
            f'</w:rPr><w:t xml:space="preserve">{escape(text)}</w:t></w:r>'
        )
    return f"<w:p>{p_pr}{runs_xml}</w:p>"


def build_document_xml() -> str:
    paras = []

    # Top Competition Kicker
    paras.append(
        w_para(
            [("AI BUILDERS CONGRESS 2026  |  HEALTHSPHERE AI → PREDICTRX TRACK  |  ONE-PAGE PROJECT SUMMARY", 17, "0D9488", True)],
            space_before=0,
            space_after=25,
            line=210,
            align="left",
        )
    )

    # Main Title
    paras.append(
        w_para(
            [("TriNexus | VitaGuard AI: Explainable Health Screening-Support & Education for Bangladesh", 25, "12304A", True)],
            space_before=0,
            space_after=35,
            line=235,
            align="left",
        )
    )

    # Governance Banner
    paras.append(
        w_para(
            [
                ("GOVERNANCE STATUS: ", 16, "991B1B", True),
                (
                    "NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED. Local prototype only; does not claim BMRC/DGHS approval, hospital partnership, or clinical diagnosis.",
                    16,
                    "7F1D1D",
                    False,
                ),
            ],
            space_before=0,
            space_after=75,
            line=215,
            align="left",
            bottom_border="CBD5E1",
            shading="FEF2F2",
        )
    )

    # 10 Structured Sections matching Page 3 of the PDF
    for heading, body in SECTIONS:
        paras.append(
            w_para(
                [(heading, 19, "12304A", True)],
                space_before=40,
                space_after=15,
                line=220,
                align="left",
            )
        )
        paras.append(
            w_para(
                [(body, 18, "1E293B", False)],
                space_before=0,
                space_after=50,
                line=225,
                align="both",
            )
        )

    # Footer line at bottom of single page
    paras.append(
        w_para(
            [
                (
                    "AI Builders Congress 2026 | Preliminary Submission — One-Page Project Summary (TriNexus | VitaGuard AI) | Page 1 of 1",
                    15,
                    "64748B",
                    False,
                )
            ],
            space_before=45,
            space_after=0,
            line=200,
            align="center",
        )
    )

    body_xml = "".join(paras)

    return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    {body_xml}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="540" w:right="720" w:bottom="540" w:left="720" w:header="360" w:footer="360" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>'''


def build_docx(out_paths: list[Path]):
    content_types = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>'''

    root_rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>'''

    doc_rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>'''

    styles = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Nirmala UI"/>
        <w:sz w:val="18"/>
        <w:szCs w:val="18"/>
        <w:lang w:val="en-US"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="45" w:line="220" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
  </w:style>
</w:styles>'''

    core = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
                   xmlns:dc="http://purl.org/dc/elements/1.1/"
                   xmlns:dcterms="http://purl.org/dc/terms/"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>TriNexus | VitaGuard AI — One-Page Project Summary</dc:title>
  <dc:creator>Team TriNexus</dc:creator>
  <dc:description>AIBC 2026 Preliminary Submission One-Page Project Summary</dc:description>
</cp:coreProperties>'''

    app = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>TriNexus VitaGuard AI</Application>
  <Pages>1</Pages>
</Properties>'''

    files = {
        "[Content_Types].xml": content_types,
        "_rels/.rels": root_rels,
        "word/_rels/document.xml.rels": doc_rels,
        "word/styles.xml": styles,
        "word/document.xml": build_document_xml(),
        "docProps/core.xml": core,
        "docProps/app.xml": app,
    }

    for out_path in out_paths:
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(out_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
            for name, content in files.items():
                zf.writestr(name, content.encode("utf-8"))
        print(f"Created: {out_path} ({out_path.stat().st_size:,} bytes)")


if __name__ == "__main__":
    build_docx([OUT_ROOT, OUT_SUBMISSION])
