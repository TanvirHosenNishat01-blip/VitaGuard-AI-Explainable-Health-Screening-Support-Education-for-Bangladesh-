"""Educational articles stored in code. They are not a clinical guideline library."""

CATEGORIES = [
    ("diabetes", "Diabetes", "ডায়াবেটিস"),
    ("cardiovascular", "Cardiovascular Health", "হৃদযন্ত্রের স্বাস্থ্য"),
    ("blood-pressure", "Blood Pressure", "রক্তচাপ"),
    ("heart-disease", "Heart Disease", "হৃদরোগ"),
    ("nutrition", "Nutrition and Diet", "পুষ্টি ও খাদ্যাভ্যাস"),
    ("activity", "Physical Activity", "শারীরিক কাজ"),
    ("prevention", "Preventive Healthcare", "প্রতিরোধমূলক স্বাস্থ্য"),
    ("screening", "Screening and Risk Assessment", "স্ক্রিনিং ও ঝুঁকি মূল্যায়ন"),
    ("womens-health", "Women's Health", "নারীর স্বাস্থ্য"),
    ("mens-health", "Men's Health", "পুরুষের স্বাস্থ্য"),
    ("elderly", "Elderly Health", "প্রবীণ স্বাস্থ্য"),
    ("medication", "Medication Safety", "ওষুধের নিরাপত্তা"),
    ("explainability", "Understanding AI and Explainability", "এআই ও ব্যাখ্যা"),
    ("bangladesh", "Healthcare Awareness in Bangladesh", "বাংলাদেশে স্বাস্থ্য সচেতনতা"),
]

_DISCLAIMER_EN = "Educational information. Not a diagnosis, prescription, dose, or substitute for a clinician."
_DISCLAIMER_BN = "শিক্ষামূলক তথ্য। রোগ নির্ণয়, প্রেসক্রিপশন, ডোজ বা চিকিৎসকের বিকল্প নয়।"


def _article(article_id, category, title_en, title_bn, summary_en, summary_bn, body_en, body_bn, popular=False, faq=False):
    return {
        "id": article_id,
        "category": category,
        "title_en": title_en,
        "title_bn": title_bn,
        "summary_en": summary_en,
        "summary_bn": summary_bn,
        "body_en": body_en,
        "body_bn": body_bn,
        "language": "en+bn",
        "source": "TriNexus educational note",
        "author": "TriNexus project documentation",
        "last_reviewed": "2026-11-19",
        "license": "Project documentation",
        "popular": popular,
        "faq": faq,
        "status": "published_in_code",
        "disclaimer_en": _DISCLAIMER_EN,
        "disclaimer_bn": _DISCLAIMER_BN,
    }


ARTICLES = [
    _article(
        "screening-not-diagnosis",
        "screening",
        "A screening score is not a diagnosis",
        "স্ক্রিনিং স্কোর রোগ নির্ণয় নয়",
        "This project separates a screening estimate from a clinician's diagnosis.",
        "এই প্রকল্প স্ক্রিনিং অনুমানকে চিকিৎসকের রোগ নির্ণয় থেকে আলাদা রাখে।",
        "DiaBD is an uncalibrated screening index. Pima is a research-table estimate for a stated cohort. Cleveland is a historical catheterization cohort. The WHO South Asia tool is a chart lookup. None of these is a diagnosis or a dose.",
        "ডায়াবিডি একটি আনক্যালিব্রেটেড স্ক্রিনিং সূচক। পিমা একটি গবেষণা টেবিলের অনুমান, যার কোহর্ট সীমা লেখা আছে। ক্লিভল্যান্ড একটি পুরোনো ক্যাথেটারাইজেশন দল। ডব্লিউএইচও দক্ষিণ এশিয়া টুল একটি চার্ট খোঁজ। কোনোটিই রোগ নির্ণয় বা ডোজ নয়।",
        popular=True,
    ),
    _article(
        "diabetes-education",
        "diabetes",
        "Diabetes education on this site",
        "এই সাইটে ডায়াবেটিস শিক্ষা",
        "High blood glucose over time is the subject of diabetes care. This page does not diagnose it.",
        "দীর্ঘ সময় ধরে উচ্চ রক্তের গ্লুকোজ ডায়াবেটিস সেবার বিষয়। এই পাতা তা নির্ণয় করে না।",
        "A laboratory test ordered by a clinician is the way diabetes is diagnosed. The Bangladesh page on this site returns a screening score, not a personal probability and not a treatment plan.",
        "চিকিৎসকের নির্দেশিত ল্যাব পরীক্ষাই ডায়াবেটিস নির্ণয়ের পথ। এই সাইটের বাংলাদেশ পাতা একটি স্ক্রিনিং স্কোর দেয়, ব্যক্তিগত সম্ভাবনা বা চিকিৎসা পরিকল্পনা নয়।",
        popular=True,
    ),
    _article(
        "bp-reading",
        "blood-pressure",
        "How to read the two blood pressure numbers",
        "রক্তচাপের দুটি সংখ্যা কীভাবে পড়বেন",
        "Systolic is the higher number and diastolic is the lower number.",
        "সিস্টোলিক উপরের সংখ্যা এবং ডায়াস্টোলিক নিচের সংখ্যা।",
        "This site will not run a diabetes estimate when diastolic pressure is not lower than systolic. It does not diagnose hypertension and it does not recommend a medicine.",
        "ডায়াস্টোলিক চাপ সিস্টোলিকের চেয়ে কম না হলে এই সাইট ডায়াবেটিস অনুমান চালায় না। এটি উচ্চ রক্তচাপ নির্ণয় করে না এবং ওষুধের পরামর্শ দেয় না।",
        popular=True,
    ),
    _article(
        "heart-pathways",
        "heart-disease",
        "Two different heart tools",
        "দুটি আলাদা হৃদযন্ত্রের টুল",
        "Cleveland and the WHO chart are not the same kind of result.",
        "ক্লিভল্যান্ড এবং ডব্লিউএইচও চার্ট এক ধরনের ফল নয়।",
        "The Cleveland tool comes from a 1984 referral cohort and shows global coefficients. The WHO South Asia chart is a published lookup for ages 40 to 74 with no previous heart attack or stroke. A chart cell is not a personal diagnosis.",
        "ক্লিভল্যান্ড টুল ১৯৮৪ সালের একটি রেফারাল দল থেকে এবং গ্লোবাল সহগ দেখায়। ডব্লিউএইচও দক্ষিণ এশিয়া চার্ট ৪০ থেকে ৭৪ বছর এবং আগের হার্ট অ্যাটাক বা স্ট্রোক না থাকলে একটি প্রকাশিত খোঁজ। চার্টের ঘর ব্যক্তিগত রোগ নির্ণয় নয়।",
        popular=True,
    ),
    _article(
        "cardio-health",
        "cardiovascular",
        "Cardiovascular results on this site",
        "এই সাইটে হৃদযন্ত্রের ফল",
        "A heart screening on this site is an estimate from a historical table or a chart cell.",
        "এই সাইটের হৃদযন্ত্র স্ক্রিনিং একটি পুরোনো টেবিলের অনুমান বা চার্টের ঘর।",
        "Global coefficients are the same for every person who uses that model. They are not an individual explanation. Symptoms still need a clinician.",
        "গ্লোবাল সহগ সেই মডেল ব্যবহার করা প্রতিটি মানুষের জন্য একই। সেগুলো ব্যক্তিগত ব্যাখ্যা নয়। উপসর্গ থাকলে চিকিৎসক লাগে।",
    ),
    _article(
        "nutrition-note",
        "nutrition",
        "Food advice is not given here",
        "এখানে খাবারের পরামর্শ দেওয়া হয় না",
        "This catalog does not prescribe a diet.",
        "এই তালিকা কোনো খাদ্যতালিকা নির্দেশ করে না।",
        "Meal planning depends on a person's conditions, medicines, and a clinician or dietitian. This site will not invent a calorie target or a forbidden food list.",
        "খাবারের পরিকল্পনা নির্ভর করে মানুষের অবস্থা, ওষুধ এবং চিকিৎসক বা পুষ্টিবিদের ওপর। এই সাইট ক্যালোরি লক্ষ্য বা নিষিদ্ধ খাবারের তালিকা বানায় না।",
    ),
    _article(
        "activity-note",
        "activity",
        "Movement is not a prescription on this site",
        "এই সাইটে শারীরিক কাজ একটি প্রেসক্রিপশন নয়",
        "Activity advice has to fit the person.",
        "কাজের পরামর্শ মানুষের সাথে মিলতে হয়।",
        "This site does not assign an exercise dose. Chest pain, severe breathlessness, or a sudden neurological symptom is a reason to seek urgent clinical care, not to continue a workout plan from a website.",
        "এই সাইট ব্যায়ামের ডোজ দেয় না। বুকের ব্যথা, তীব্র শ্বাসকষ্ট বা হঠাৎ স্নায়ুর উপসর্গ জরুরি চিকিৎসার কারণ, ওয়েবসাইটের ব্যায়াম পরিকল্পনা চালিয়ে যাওয়ার নয়।",
    ),
    _article(
        "prevention-note",
        "prevention",
        "Prevention still needs a clinician",
        "প্রতিরোধের জন্যও চিকিৎসক লাগে",
        "Screening can start a conversation. It does not finish care.",
        "স্ক্রিনিং একটি কথোপকথন শুরু করতে পারে। সেবা শেষ করে না।",
        "No BMRC or DGHS approval is claimed for this project. A low score does not prove the absence of disease.",
        "এই প্রকল্পের জন্য বিএমআরসি বা ডিজিএইচএস অনুমোদনের দাবি নেই। কম স্কোর রোগ নেই বলে প্রমাণ করে না।",
        popular=True,
    ),
    _article(
        "womens-note",
        "womens-health",
        "The Pima table is not a women's health service",
        "পিমা টেবিল নারীর স্বাস্থ্যসেবা নয়",
        "One research table recorded pregnancies. That does not make this site an obstetrics service.",
        "একটি গবেষণা টেবিলে গর্ভধারণের সংখ্যা আছে। এতে এই সাইট প্রসূতি সেবা হয় না।",
        "The Pima cohort is 768 women aged 21 to 81 in a Native American community near Phoenix, Arizona. It is not a model for pregnancy care in Bangladesh. Do not enter a number you do not have.",
        "পিমা কোহর্ট যুক্তরাষ্ট্রের অ্যারিজোনার ফিনিক্সের কাছে একটি নেটিভ আমেরিকান কমিউনিটির ৭৬৮ জন নারী, বয়স ২১ থেকে ৮১। এটি বাংলাদেশের গর্ভকালীন সেবার মডেল নয়। যে সংখ্যা আপনার কাছে নেই, সেটি লিখবেন না।",
    ),
    _article(
        "mens-note",
        "mens-health",
        "These models are not a men's health checkup",
        "এই মডেলগুলো পুরুষের স্বাস্থ্য পরীক্ষা নয়",
        "A sex code in a research table is not a men's clinic.",
        "গবেষণা টেবিলের লিঙ্গ কোড পুরুষের ক্লিনিক নয়।",
        "Cleveland recorded sex as part of a historical cohort. DiaBD records sex as it was coded in that table. Neither result is a certificate of men's health.",
        "ক্লিভল্যান্ড একটি পুরোনো দলের অংশ হিসেবে লিঙ্গ রেকর্ড করেছে। ডায়াবিডি সেই টেবিলের কোড অনুযায়ী লিঙ্গ রাখে। কোনো ফলই পুরুষের স্বাস্থ্যের সনদ নয়।",
    ),
    _article(
        "elderly-note",
        "elderly",
        "Age limits are table limits",
        "বয়সের সীমা টেবিলের সীমা",
        "Each pathway refuses ages outside its research table or chart.",
        "প্রতিটি পথ নিজের গবেষণা টেবিল বা চার্টের বাইরের বয়স নিতে অস্বীকার করে।",
        "DiaBD uses ages 21 to 80 from the cleaned table. The WHO chart uses 40 to 74. Being outside a range means the tool will not guess. It does not mean the person has no health needs.",
        "ডায়াবিডি পরিষ্কার টেবিলের ২১ থেকে ৮০ বছর ব্যবহার করে। ডব্লিউএইচও চার্ট ৪০ থেকে ৭৪ ব্যবহার করে। সীমার বাইরে মানে টুল অনুমান করবে না। তার মানে এই নয় যে মানুষের স্বাস্থ্য প্রয়োজন নেই।",
    ),
    _article(
        "medication-note",
        "medication",
        "This site does not name a medicine or a dose",
        "এই সাইট ওষুধের নাম বা ডোজ দেয় না",
        "Medication changes belong to the prescriber.",
        "ওষুধ বদলানো প্রেসক্রাইবারের কাজ।",
        "No page in this catalog recommends starting, stopping, or changing a medicine. A screening number is not an instruction to change treatment.",
        "এই তালিকার কোনো পাতা ওষুধ শুরু, বন্ধ বা বদলানোর পরামর্শ দেয় না। স্ক্রিনিং সংখ্যা চিকিৎসা বদলানোর নির্দেশ নয়।",
        popular=True,
        faq=True,
    ),
    _article(
        "explainability-note",
        "explainability",
        "What an explanation is on this site",
        "এই সাইটে ব্যাখ্যা কী",
        "DiaBD can show local TreeSHAP. Cleveland shows global coefficients. The chart has no SHAP model.",
        "ডায়াবিডি লোকাল TreeSHAP দেখাতে পারে। ক্লিভল্যান্ড গ্লোবাল সহগ দেখায়। চার্টের কোনো SHAP মডেল নেই।",
        "A feature contribution is not a cause. Search on this hub is word overlap over project notes and these articles. Embeddings are not installed. If the notes do not overlap the question, the answer stays empty.",
        "একটি ফিচারের অবদান কারণ নয়। এই হাবের খোঁজ প্রকল্পের নথি ও এই নিবন্ধের শব্দ মিল। এমবেডিং ইনস্টল করা নেই। নথিতে মিল না থাকলে উত্তর খালি থাকে।",
        faq=True,
    ),
    _article(
        "bangladesh-awareness",
        "bangladesh",
        "What this site does and does not do in Bangladesh",
        "বাংলাদেশে এই সাইট কী করে এবং কী করে না",
        "The hospital list and the blood page are not a live care network.",
        "হাসপাতালের তালিকা এবং ব্লাড পাতা লাইভ সেবা নেটওয়ার্ক নয়।",
        "Hospital street addresses and specialty lists in the directory are unverified until an official page is checked. The blood page is a simulation. No recruitment is authorized. Governance status is not submitted and not approved.",
        "ডিরেক্টরিতে হাসপাতালের ঠিকানা ও বিভাগের তালিকা ততক্ষণ অযাচাইকৃত যতক্ষণ অফিসিয়াল পাতা মিলিয়ে দেখা না হয়। ব্লাড পাতা একটি সিমুলেশন। নিয়োগের অনুমতি নেই। গভর্নেন্স অবস্থা জমা হয়নি এবং অনুমোদন হয়নি।",
        faq=True,
    ),
    _article(
        "faq-empty-search",
        "screening",
        "Why a search can come back empty",
        "খোঁজ খালি কেন আসতে পারে",
        "The assistant does not invent an answer when the catalog has no overlap.",
        "তালিকায় মিল না থাকলে সহকারী উত্তর বানায় না।",
        "Ask with words that appear in these notes, such as screening, DiaBD, consent, or blood simulation. A question about an unrelated drug or a dose has no supported passage, so the answer stays empty.",
        "স্ক্রিনিং, ডায়াবিডি, সম্মতি বা ব্লাড সিমুলেশনের মতো শব্দ ব্যবহার করুন। সম্পর্কহীন ওষুধ বা ডোজের প্রশ্নে সমর্থিত অনুচ্ছেদ নেই, তাই উত্তর খালি থাকে।",
        faq=True,
    ),
]


def categories():
    return [{"id": item[0], "label_en": item[1], "label_bn": item[2]} for item in CATEGORIES]


def articles():
    return ARTICLES


def article_by_id(article_id: str):
    for item in ARTICLES:
        if item["id"] == article_id:
            related = [
                {"id": other["id"], "title_en": other["title_en"], "title_bn": other["title_bn"]}
                for other in ARTICLES
                if other["category"] == item["category"] and other["id"] != item["id"]
            ]
            return {**item, "related": related[:4]}
    return None


def suggestions(query: str, limit: int = 6):
    text = (query or "").strip().lower()
    if len(text) < 2:
        return [item["title_en"] for item in ARTICLES if item["popular"]][:limit]
    found = []
    for item in ARTICLES:
        hay = f"{item['title_en']} {item['title_bn']} {item['summary_en']} {item['summary_bn']}".lower()
        if text in hay:
            found.append(item["title_en"])
    return found[:limit]
