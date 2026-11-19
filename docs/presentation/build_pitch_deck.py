"""Build a small PowerPoint file without adding a package."""

import zipfile
from pathlib import Path
from xml.sax.saxutils import escape

SLIDES = [
    ("Title", "TriNexus | VitaGuard AI", "A local screening-support and health-education workspace. Not a diagnostic or prescription system."),
    ("Problem", "A score is easy to misread", "People need the source, the limit, and a human review before a screening number is treated as a decision."),
    ("Solution", "PredictRx", "The existing four pathways stay in place. Explanation, project-note retrieval, and governance labels sit beside them."),
    ("Architecture", "Local system", "React 18 and Vite 5 in the browser. FastAPI, SQLAlchemy, and SQLite on the machine. Knowledge search does not call the prediction engine."),
    ("Roles", "Three bounded workspaces", "Patient, doctor, and admin. A doctor sees a chart after a confirmed appointment or an existing guideline from that doctor."),
    ("Pathways", "Four different tools", "DiaBD is an uncalibrated screening index. Pima is a research-table screening with a stated cohort limit. Cleveland is a historical cohort. The WHO chart is a lookup, not a trained model."),
    ("Explainability", "Say what the number is", "Local TreeSHAP only for DiaBD. Cleveland uses global coefficients. The WHO pathway explains the lookup. A contribution is not a cause."),
    ("Knowledge", "Cited project notes", "Retrieval is lexical overlap. Missing sources produce no answer. The graph records documented limits and has no causal medical edges."),
    ("Responsible AI", "Do not mix evidence", "The historical DiaBD file stays labeled as historical. Subgroup fairness is not calculated without approved ground truth. Dataset redistribution remains NOT VERIFIED."),
    ("Business pathway", "Proposed, not operating", "Possible later customers are clinics or educators who want a bounded screening-support workspace. No revenue, customer, or savings figure is claimed. Clinical use depends on approval that does not exist."),
    ("Scale roadmap", "Local today", "Bangla and English are in the interface. Larger deployment needs a different database, operations, and legal review. Millions of users are not an achievement of this build."),
    ("Privacy and security", "Controls that exist", "Consent, username-confirmed deletion, bcrypt, checked JWT, admin authenticator, and API response headers. Encryption is not implemented. No NRB or international partnership is on record."),
    ("Demonstration", "No production sign-in", "The briefing uses public educational pages and narrated role stories. It does not publish a demo password."),
    ("Limits", "Governance", "Not submitted. Not approved. No recruitment authorized. No hospital integration and no claim of clinical effectiveness."),
    ("Future research", "Needs a later approval", "Encryption, embedding retrieval, and external medical text wait for approval and a verified license."),
    ("Score band", "Not the production band", "The 16 to 20 band means production-grade and globally competitive. This build is a tested local prototype. It does not have measured revenue, millions of users, or a clinical outcome."),
    ("Close", "What to judge", "Judge the tested local system and the limits written on the screen. Do not treat plans as results."),
]

OUT = Path(__file__).resolve().parent / "TriNexus_VitaGuard_AIBC_2026.pptx"


def slide_xml(index, title, body):
    return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="Title"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr><a:xfrm><a:off x="457200" y="365760"/><a:ext cx="8229600" cy="685800"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>
        <p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="en-US" sz="2800" b="1"/><a:t>{escape(title)}</a:t></a:r></a:p></p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="3" name="Body"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr><a:xfrm><a:off x="457200" y="1280160"/><a:ext cx="8229600" cy="4114800"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>
        <p:txBody><a:bodyPr wrap="square"/><a:lstStyle/><a:p><a:r><a:rPr lang="en-US" sz="2000"/><a:t>{escape(body)}</a:t></a:r></a:p></p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>
'''


def main():
    count = len(SLIDES)
    overrides = "".join(
        f'<Override PartName="/ppt/slides/slide{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>'
        for i in range(1, count + 1)
    )
    content_types = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
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
  <p:sldIdLst>{sld_ids}</p:sldIdLst>
  <p:sldSz cx="9144000" cy="5143500" type="screen4x3"/>
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
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="titleOnly">
  <p:cSld name="Title"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld>
</p:sldLayout>'''
    theme = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="VitaGuard">
  <a:themeElements>
    <a:clrScheme name="VitaGuard"><a:dk1><a:srgbClr val="12304A"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="334155"/></a:dk2><a:lt2><a:srgbClr val="F6F9FC"/></a:lt2><a:accent1><a:srgbClr val="0D9488"/></a:accent1><a:accent2><a:srgbClr val="0E7490"/></a:accent2><a:accent3><a:srgbClr val="D97706"/></a:accent3><a:accent4><a:srgbClr val="15803D"/></a:accent4><a:accent5><a:srgbClr val="12304A"/></a:accent5><a:accent6><a:srgbClr val="64748B"/></a:accent6><a:hlink><a:srgbClr val="0E7490"/></a:hlink><a:folHlink><a:srgbClr val="64748B"/></a:folHlink></a:clrScheme>
    <a:fontScheme name="VitaGuard"><a:majorFont><a:latin typeface="Calibri"/></a:majorFont><a:minorFont><a:latin typeface="Calibri"/></a:minorFont></a:fontScheme>
    <a:fmtScheme name="VitaGuard"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="6350"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme>
  </a:themeElements>
</a:theme>'''
    files = {
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
    for index, (label, title, body) in enumerate(SLIDES, start=1):
        files[f"ppt/slides/slide{index}.xml"] = slide_xml(index, f"{label}. {title}", body)
        files[f"ppt/slides/_rels/slide{index}.xml.rels"] = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/></Relationships>'''
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(OUT, "w", compression=zipfile.ZIP_DEFLATED) as package:
        for name, text in files.items():
            package.writestr(name, text.encode("utf-8"))
    print(OUT)


if __name__ == "__main__":
    main()
