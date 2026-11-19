"""Curated names of prominent private hospitals in Bangladesh.

Addresses, phone numbers, thana, and specialty lists are not filled.
They were not checked against an official page in this session, so those
fields stay unavailable instead of being guessed. This is not a ranking.
"""

VERIFIED_ON = None
STATUS = "verification_pending"

# id, hospital_name, branch_label, division, district, website
_ROWS = [
    ("square-hospitals", "Square Hospitals Ltd.", "Panthapath campus", "Dhaka", "Dhaka", "https://www.squarehospital.com/"),
    ("united-hospital", "United Hospital Limited", "Gulshan campus", "Dhaka", "Dhaka", "https://www.uhlbd.com/"),
    ("evercare-dhaka", "Evercare Hospital Dhaka", "Bashundhara campus", "Dhaka", "Dhaka", "https://www.evercarebd.com/"),
    ("labaid-specialized", "Labaid Specialized Hospital", "Dhanmondi campus", "Dhaka", "Dhaka", "https://www.labaidgroup.com/"),
    ("labaid-cancer", "Labaid Cancer Hospital and Super Speciality Centre", "Dhanmondi campus", "Dhaka", "Dhaka", "https://www.labaidgroup.com/"),
    ("ibn-sina-dhanmondi", "Ibn Sina Specialized Hospital", "Dhanmondi campus", "Dhaka", "Dhaka", "https://www.ibnsinatrust.com/"),
    ("ibn-sina-kallyanpur", "Ibn Sina Medical College Hospital", "Kallyanpur campus", "Dhaka", "Dhaka", "https://www.ibnsinatrust.com/"),
    ("popular-medical-college", "Popular Medical College Hospital", "Dhanmondi campus", "Dhaka", "Dhaka", "https://www.popular-hospital.com/"),
    ("bangladesh-specialized", "Bangladesh Specialized Hospital", "Shyamoli campus", "Dhaka", "Dhaka", "https://www.bdspecializedhospital.com/"),
    ("asgar-ali", "Asgar Ali Hospital", "Gandaria campus", "Dhaka", "Dhaka", "https://www.asgaralihospital.com/"),
    ("green-life", "Green Life Medical College Hospital", "Green Road campus", "Dhaka", "Dhaka", "https://www.greenlife.edu.bd/"),
    ("impulse", "Impulse Hospital", "Tejgaon campus", "Dhaka", "Dhaka", ""),
    ("central-hospital-dhaka", "Central Hospital Limited", "Dhanmondi campus", "Dhaka", "Dhaka", ""),
    ("samorita", "Samorita Hospital Limited", "Panthapath campus", "Dhaka", "Dhaka", ""),
    ("brb-hospitals", "BRB Hospitals Limited", "Panthapath campus", "Dhaka", "Dhaka", "https://www.brbhospital.com/"),
    ("anwer-khan-modern", "Anwer Khan Modern Medical College Hospital", "Dhanmondi campus", "Dhaka", "Dhaka", "https://www.akmmch.com/"),
    ("japan-east-west", "Japan East West Medical College Hospital", "Turag campus", "Dhaka", "Dhaka", ""),
    ("universal-mohakhali", "Universal Medical College and Hospital", "Mohakhali campus", "Dhaka", "Dhaka", ""),
    ("delta-mirpur", "Delta Medical College and Hospital", "Mirpur campus", "Dhaka", "Dhaka", ""),
    ("ayesha-memorial", "Ayesha Memorial Specialised Hospital", "Mohakhali campus", "Dhaka", "Dhaka", ""),
    ("al-helal-mirpur", "Al-Helal Specialized Hospital", "Mirpur campus", "Dhaka", "Dhaka", ""),
    ("farazy", "Farazy Hospital", "Banasree campus", "Dhaka", "Dhaka", ""),
    ("amz-uttara", "AMZ Hospital Limited", "Uttara campus", "Dhaka", "Dhaka", ""),
    ("praava", "Praava Health", "Banani centre", "Dhaka", "Dhaka", "https://www.praavahealth.com/"),
    ("addin-moghbazar", "Ad-din Medical College Hospital", "Moghbazar campus", "Dhaka", "Dhaka", "https://www.addinmedical.org/"),
    ("addin-womens", "Ad-din Women's Medical College Hospital", "Moghbazar campus", "Dhaka", "Dhaka", "https://www.addinmedical.org/"),
    ("enam-savar", "Enam Medical College and Hospital", "Savar campus", "Dhaka", "Dhaka", "https://www.emcbd.com/"),
    ("shahabuddin", "Shahabuddin Medical College Hospital", "Gulshan campus", "Dhaka", "Dhaka", ""),
    ("dhaka-community", "Dhaka Community Medical College Hospital", "Moghbazar campus", "Dhaka", "Dhaka", ""),
    ("islami-bank-central", "Islami Bank Central Hospital", "Kakrail campus", "Dhaka", "Dhaka", ""),
    ("kpj-gazipur", "Sheikh Fazilatunnesa Mujib Memorial KPJ Specialized Hospital", "Gazipur campus", "Dhaka", "Gazipur", "https://www.kpjhealthcare.com/"),
    ("tairunnessa", "Tairunnessa Memorial Medical College and Hospital", "Gazipur campus", "Dhaka", "Gazipur", ""),
    ("imc-gazipur", "International Medical College and Hospital", "Gazipur campus", "Dhaka", "Gazipur", ""),
    ("evercare-ctg", "Evercare Hospital Chattogram", "Chattogram campus", "Chattogram", "Chattogram", "https://www.evercarebd.com/"),
    ("imperial-ctg", "Imperial Hospital Limited", "Chattogram campus", "Chattogram", "Chattogram", "https://www.imperialhospitalbd.com/"),
    ("max-ctg", "Max Hospital Limited", "Chattogram campus", "Chattogram", "Chattogram", ""),
    ("cscr", "Centre for Specialized Care and Research", "Chattogram campus", "Chattogram", "Chattogram", ""),
    ("mount-adora", "Mount Adora Hospital", "Sylhet campus", "Sylhet", "Sylhet", ""),
    ("oasis-sylhet", "Oasis Hospital", "Sylhet campus", "Sylhet", "Sylhet", ""),
    ("northeast-sylhet", "North East Medical College and Hospital", "Sylhet campus", "Sylhet", "Sylhet", ""),
    ("jalalabad-sylhet", "Jalalabad Ragib-Rabeya Medical College Hospital", "Sylhet campus", "Sylhet", "Sylhet", ""),
    ("ibn-sina-sylhet", "Ibn Sina Hospital Sylhet", "Sylhet campus", "Sylhet", "Sylhet", "https://www.ibnsinatrust.com/"),
    ("islami-bank-rajshahi", "Islami Bank Medical College Hospital", "Rajshahi campus", "Rajshahi", "Rajshahi", ""),
    ("barind-rajshahi", "Barind Medical College Hospital", "Rajshahi campus", "Rajshahi", "Rajshahi", ""),
    ("tmss-bogura", "TMSS Medical College and Rafatullah Community Hospital", "Bogura campus", "Rajshahi", "Bogura", "https://www.tmss-bd.org/"),
    ("gazi-khulna", "Gazi Medical College Hospital", "Khulna campus", "Khulna", "Khulna", ""),
    ("khulna-city", "Khulna City Medical College Hospital", "Khulna campus", "Khulna", "Khulna", ""),
    ("prime-rangpur", "Prime Medical College Hospital", "Rangpur campus", "Rangpur", "Rangpur", ""),
    ("rangpur-community", "Rangpur Community Medical College Hospital", "Rangpur campus", "Rangpur", "Rangpur", ""),
    ("cbmc-mymensingh", "Community Based Medical College Hospital", "Mymensingh campus", "Mymensingh", "Mymensingh", ""),
]


def hospital_records():
    rows = []
    for item in _ROWS:
        website = item[5] or None
        rows.append({
            "id": item[0],
            "hospital_name": item[1],
            "branch_name": item[2],
            "branch_name_status": "pending_verification",
            "division": item[3],
            "district": item[4],
            "thana": None,
            "area": None,
            "address": None,
            "phone": None,
            "website": website,
            "website_status": "recorded_not_fetched_this_session" if website else "unavailable",
            "specialties": [],
            "specialties_status": "not_verified",
            "source_url": website,
            "last_verified": VERIFIED_ON,
            "verification_status": STATUS,
            "map_url": None,
            "opening_hours": None,
            "rating": None,
            "emergency_verified": False,
            "doctor_affiliations": [],
            "affiliation_note": "No independently verified doctor affiliation is stored for this branch.",
        })
    return rows
