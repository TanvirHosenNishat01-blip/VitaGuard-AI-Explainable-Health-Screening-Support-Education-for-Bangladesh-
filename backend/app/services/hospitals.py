"""Read-only hospital directory. No production table is created."""

from app.data.bd_private_hospitals import hospital_records

SPECIALTIES = [
    "Cardiology",
    "Diabetology / Endocrinology",
    "Neurology",
    "Nephrology",
    "Oncology",
    "Gynecology",
    "Pediatrics",
    "Orthopedics",
    "Medicine",
    "Surgery",
    "Dermatology",
    "Emergency services",
]


def _match(value, selected):
    if not selected or selected == "ALL":
        return True
    return (value or "") == selected


def list_hospitals(
    q: str = "",
    division: str = "",
    district: str = "",
    thana: str = "",
    area: str = "",
    hospital: str = "",
    branch: str = "",
    specialty: str = "",
):
    rows = hospital_records()
    query = (q or "").strip().lower()
    selected = []
    for row in rows:
        if not _match(row["division"], division):
            continue
        if not _match(row["district"], district):
            continue
        if thana and thana != "ALL" and row["thana"] != thana:
            continue
        if area and area != "ALL" and row["area"] != area:
            continue
        if hospital and hospital != "ALL" and row["hospital_name"] != hospital:
            continue
        if branch and branch != "ALL" and row["branch_name"] != branch:
            continue
        if specialty and specialty != "ALL" and specialty not in row["specialties"]:
            continue
        if query and query not in row["hospital_name"].lower() and query not in row["branch_name"].lower():
            continue
        selected.append(row)
    any_specialty = any(row["specialties"] for row in hospital_records())
    return {
        "count": len(selected),
        "total_curated": len(rows),
        "ranking": False,
        "specialty_requested": bool(specialty and specialty != "ALL"),
        "specialty_data_available": any_specialty,
        "description": "A curated directory of prominent private hospitals. Not a top-50 ranking.",
        "hospitals": selected,
        "specialties": SPECIALTIES,
        "specialty_note": "No specialty list has been verified for these branches. A specialty filter returns no rows until a source is checked.",
        "address_note": "Street addresses, phone numbers, and thana names are unavailable until checked against an official page.",
        "governance": "NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED",
    }


def hospital_detail(hospital_id: str):
    for row in hospital_records():
        if row["id"] == hospital_id:
            return row
    return None


def filter_options(division: str = "", district: str = "", thana: str = "", hospital: str = ""):
    rows = hospital_records()
    if division:
        rows = [row for row in rows if row["division"] == division]
    districts = sorted({row["district"] for row in rows})
    if district:
        rows = [row for row in rows if row["district"] == district]
    thanas = sorted({row["thana"] for row in rows if row["thana"]})
    if thana:
        rows = [row for row in rows if row["thana"] == thana]
    areas = sorted({row["area"] for row in rows if row["area"]})
    names = sorted({row["hospital_name"] for row in rows})
    if hospital:
        rows = [row for row in rows if row["hospital_name"] == hospital]
    branches = sorted({row["branch_name"] for row in rows})
    divisions = sorted({row["division"] for row in hospital_records()})
    return {
        "divisions": divisions,
        "districts": districts,
        "thanas": thanas,
        "areas": areas,
        "hospitals": names,
        "branches": branches,
        "thana_note": "No thana or area has been verified, so those lists stay empty.",
    }
