import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  HeartPulse,
  Utensils,
  Footprints,
  AlertTriangle,
  Stethoscope,
  ExternalLink,
  ChevronDown,
  PlayCircle,
  Globe,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import PageContainer from './ui/PageContainer';
import SectionHeader from './ui/SectionHeader';
import ClinicalCard from './ui/ClinicalCard';
import StatusBadge from './ui/StatusBadge';
import AlertBanner from './ui/AlertBanner';
import MedicalButton from './ui/MedicalButton';

const BD_EDUCATION_CARDS = {
  en: [
    {
      topic: 'diabetes',
      badge: 'Diabetes Prevention',
      title: 'Preventing & Managing Type 2 Diabetes in Bangladesh',
      points: [
        'Balance refined white rice portions with high-fiber vegetables (shak-shobji), dal, and fish.',
        'Avoid sugary tea, sweetened condensed milk, and packaged soft drinks.',
        'Check fasting blood glucose or HbA1c periodically if a parent or sibling has diabetes.',
      ],
    },
    {
      topic: 'cardio',
      badge: 'Cardiovascular Health',
      title: 'Protecting Heart & Blood Vessels',
      points: [
        'Stop all forms of tobacco—including cigarettes, bidi, zarda, and gul—which strongly elevate heart attack and stroke risk.',
        'Reduce deep-fried snacks and trans-fat bakery items; use moderate cooking oil.',
        'Recognize warning symptoms: chest pressure, pain radiating to the arm/jaw, or sudden shortness of breath.',
      ],
    },
    {
      topic: 'cardio',
      badge: 'Blood Pressure Awareness',
      title: 'Understanding Silent Hypertension',
      points: [
        'High blood pressure (≥ 140/90 mmHg) often causes no symptoms until complications arise.',
        'Avoid adding extra raw table salt (kancha lobon) to meals and limit salted dried fish.',
        'Never stop prescribed blood pressure medicine suddenly without consulting your physician.',
      ],
    },
    {
      topic: 'diabetes',
      badge: 'Healthy Bangladeshi Diet',
      title: 'Practical Everyday Plate Guide',
      points: [
        'Fill half your plate with seasonal leafy greens and non-starchy vegetables.',
        'Choose whole grains, lentils, eggs, and local fish for steady energy without sharp glucose spikes.',
        'Drink plenty of safe water instead of sweetened beverages.',
      ],
    },
    {
      topic: 'all',
      badge: 'Physical Activity',
      title: 'Daily Movement for Metabolic & Heart Health',
      points: [
        'Aim for at least 30 minutes of brisk walking 5 days a week (150 minutes/week).',
        'Break up long hours of sitting with 5-minute light walking stretches.',
        'Elderly patients or those with joint or heart conditions should consult a doctor before intense exercise.',
      ],
    },
    {
      topic: 'all',
      badge: 'When to Seek Medical Care',
      title: 'Red-Flag Symptoms Requiring Prompt Physician Care',
      points: [
        'Seek immediate emergency medical care for chest tightness, severe shortness of breath, sudden weakness on one side, or slurred speech.',
        'Visit a qualified MBBS doctor promptly for persistent excessive thirst, unexplained weight loss, blurred vision, or slow-healing foot sores.',
        'Use national helpline 16263 or visit your nearest Upazila Health Complex or medical college hospital.',
      ],
    },
  ],
  bn: [
    {
      topic: 'diabetes',
      badge: 'ডায়াবেটিস প্রতিরোধ',
      title: 'টাইপ-২ ডায়াবেটিস প্রতিরোধ ও নিয়ন্ত্রণের উপায়',
      points: [
        'খাবারের প্লেটে সাদা ভাতের পরিমাণ পরিমিত রেখে শাকসবজি, ডাল ও মাছের পরিমাণ বাড়ান।',
        'অতিরিক্ত চিনিযুক্ত চা, কনডেন্সড মিল্ক এবং বোতলজাত কোমল পানীয় পরিহার করুন।',
        'বাবা-মা বা ভাইবোনের ডায়াবেটিস থাকলে নিয়মিত রক্তের সুগার বা HbA1c পরীক্ষা করান।',
      ],
    },
    {
      topic: 'cardio',
      badge: 'হৃদস্বাস্থ্য সুরক্ষা',
      title: 'হৃদরোগ ও রক্তনালীর ঝুঁকি কমানোর অভ্যাস',
      points: [
        'সিগারেট, বিড়ি, জর্দা ও গুলসহ সব ধরনের তামাক সম্পূর্ণ বর্জন করুন—এগুলো হার্ট অ্যাটাক ও স্ট্রোকের ঝুঁকি বহুগুণ বাড়ায়।',
        'অতিরিক্ত তেলে ভাজা খাবার ও বেকারি ট্রান্স-ফ্যাট কমিয়ে পরিমিত তেল ব্যবহার করুন।',
        'বুকে চাপ বা ব্যথা, বাম হাতে বা চোয়ালে ব্যথা ছড়িয়ে পড়া কিংবা হঠাৎ শ্বাসকষ্টের লক্ষণ সম্পর্কে সচেতন থাকুন।',
      ],
    },
    {
      topic: 'cardio',
      badge: 'রক্তচাপ সচেতনতা',
      title: 'উচ্চ রক্তচাপ (Hypertension) কেন নীরব ঘাতক',
      points: [
        'উচ্চ রক্তচাপ (১৪০/৯০ mmHg বা তার বেশি) অনেক সময় কোনো মাথাব্যথা বা উপসর্গ ছাড়াই শরীরের ক্ষতি করে।',
        'পাতে বাড়তি কাঁচা লবণ খাওয়া সম্পূর্ণ বন্ধ করুন এবং অতিরিক্ত লবণাক্ত খাবার কমান।',
        'চিকিৎসকের পরামর্শ ছাড়া রক্তচাপের ওষুধ নিজে থেকে হঠাৎ বন্ধ করবেন না।',
      ],
    },
    {
      topic: 'diabetes',
      badge: 'সুষম বাংলাদেশি খাদ্যাভ্যাস',
      title: 'প্রতিদিনের স্বাস্থ্যকর খাবারের সহজ নিয়ম',
      points: [
        'প্রতিবেলার প্লেটের অর্ধেক অংশ মৌসুমি শাকসবজি ও সালাদ দিয়ে পূর্ণ করুন।',
        'পরিমিত ভাত বা লাল আটার রুটির সাথে ডাল, ডিম বা দেশি মাছ রাখুন।',
        'তৃষ্ণা মেটাতে চিনিযুক্ত পানীয়ের বদলে পর্যাপ্ত নিরাপদ পানি পান করুন।',
      ],
    },
    {
      topic: 'all',
      badge: 'শারীরিক পরিশ্রম',
      title: 'নিয়মিত হাঁটাচলা ও সক্রিয় জীবনযাপন',
      points: [
        'সপ্তাহে অন্তত ৫ দিন প্রতিদিন ৩০ মিনিট দ্রুত হাঁটার অভ্যাস গড়ে তুলুন।',
        'টানা দীর্ঘ সময় বসে কাজ না করে প্রতি ঘণ্টায় কয়েক মিনিট হাঁটাচলা করুন।',
        'বয়স্ক ব্যক্তি বা যাঁদের হৃদরোগের সমস্যা আছে, তাঁরা ভারী ব্যায়ামের আগে চিকিৎসকের পরামর্শ নিন।',
      ],
    },
    {
      topic: 'all',
      badge: 'কখন চিকিৎসকের কাছে যাবেন',
      title: 'জরুরি সতর্কতা লক্ষণসমূহ',
      points: [
        'বুকে তীব্র চাপ বা ব্যথা, শ্বাসকষ্ট, শরীরের এক পাশ অবশ হয়ে যাওয়া বা কথা জড়িয়ে গেলে তাৎক্ষণিক নিকটস্থ হাসপাতালে যান।',
        'অতিরিক্ত পিপাসা, ঘন ঘন প্রস্রাব, হঠাৎ ওজন কমে যাওয়া, চোখে ঝাপসা দেখা বা পায়ের ক্ষত না শুকালে দ্রুত এমবিবিএস চিকিৎসকের পরামর্শ নিন।',
        'সরকারি স্বাস্থ্য পরামর্শের জন্য জাতীয় হেল্পলাইন ১৬২৬৩-এ কল করুন অথবা নিকটস্থ উপজেলা স্বাস্থ্য কমপ্লেক্সে যোগাযোগ করুন।',
      ],
    },
  ],
};

function AwarenessSection() {
  const [filter, setFilter] = useState('all');
  const [openFaq, setOpenFaq] = useState(null);
  const { lang } = useLanguage();
  const isBn = lang === 'bn';
  const navigate = useNavigate();

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const allVideos = [
    {
      id: 'mRVZ9lkubag',
      title: 'CDC – Preventing Type 2 Diabetes',
      category: 'CDC Prevention',
      topic: 'diabetes',
      desc: 'স্বাস্থ্যকর খাবার, ব্যায়াম, ওজন নিয়ন্ত্রণ ও জীবনযাত্রার পরিবর্তনের মাধ্যমে ডায়াবেটিসের ঝুঁকি কমানোর উপায় দেখায়।',
    },
    {
      id: 'V-1bOCr2XK8',
      title: 'Mayo Clinic – Type 2 Diabetes Prevention',
      category: 'Mayo Clinic',
      topic: 'diabetes',
      desc: 'স্বাস্থ্যকর অভ্যাস, ওজন নিয়ন্ত্রণ এবং টাইপ ২ ডায়াবেটিস প্রতিরোধ বা বিলম্বিত করার উপায় জানায়।',
    },
    {
      id: 'Kp6Jk9vsqkM',
      title: 'WHO – Diabetes Awareness & Prevention',
      category: 'World Health Organization',
      topic: 'diabetes',
      desc: 'ডায়াবেটিসের ঝুঁকি, জটিলতা, প্রতিরোধ ও দ্রুত রোগ শনাক্তকরণের গুরুত্ব বোঝায়।',
    },
    {
      id: '7KRUfWqa0k8',
      title: 'Diabetes Services: Preventing Diabetes',
      category: 'Clinical Assessment',
      topic: 'diabetes',
      desc: 'রক্তে গ্লুকোজ ও HbA1c কী এবং ডায়াবেটিস মূল্যায়নে এসব পরীক্ষার ভূমিকা কী তা ব্যাখ্যা করে।',
    },
    {
      id: '609od4UAdF4',
      title: 'American Heart Association – PREVENT Risk Calculator',
      category: 'AHA Cardiology',
      topic: 'cardio',
      desc: 'বিভিন্ন স্বাস্থ্যতথ্য ব্যবহার করে ভবিষ্যতে হৃদরোগ, স্ট্রোক ও হার্ট ফেইলিউরের ঝুঁকি অনুমান করার ধারণা দেয়।',
    },
    {
      id: 'VYViolo48_0',
      title: 'Stanford Health – Cardiovascular Risk Prevention',
      category: 'Stanford Health',
      topic: 'cardio',
      desc: 'হৃদরোগ কীভাবে তৈরি হয়, বংশগত ও জীবনযাপনজনিত ঝুঁকি এবং প্রতিরোধের উপায় ব্যাখ্যা করে।',
    },
    {
      id: '8WkumWFJ3FM',
      title: 'Heart Disease Prevention & Screening',
      category: 'Narayana Health',
      topic: 'cardio',
      desc: 'উচ্চ রক্তচাপ, কোলেস্টেরল, ধূমপান, ডায়াবেটিস ও স্থূলতার কারণে হৃদরোগের ঝুঁকি এবং প্রতিরোধের উপায় জানায়।',
    },
  ];

  const webLinks = [
    {
      title: 'BIRDEM General Hospital',
      subtitle: 'Diabetic Association of Bangladesh',
      desc: 'ডায়াবেটিস, হরমোনজনিত রোগ, রোগ নির্ণয়, চিকিৎসা ও সংশ্লিষ্ট গবেষণার তথ্য পাওয়া যায়।',
      url: 'http://www.birdembd.org/',
      topic: 'diabetes',
    },
    {
      title: 'BIRDEM / BADAS – Animations',
      subtitle: 'Diabetes Awareness Videos',
      desc: 'ডায়াবেটিস সচেতনতা, প্রতিরোধ ও অ্যানিমেশনের মাধ্যমে স্বাস্থ্যশিক্ষা দেওয়া হয়।',
      url: 'https://cghr-badas.org/animations/',
      topic: 'diabetes',
    },
    {
      title: 'RSSDI – Diabetes Education',
      subtitle: 'Bengali Patient Area',
      desc: 'ডায়াবেটিস প্রতিরোধ, জটিলতা ও স্বাস্থ্যসচেতনতা সম্পর্কে ধারণা দেয়।',
      url: 'https://rssdi.in/newwebsite/patient-area.php/patient-area.php',
      topic: 'diabetes',
    },
    {
      title: 'American Diabetes Association',
      subtitle: 'Diabetes Risk Test',
      desc: 'প্রশ্নের উত্তর দিয়ে টাইপ ২ ডায়াবেটিস হওয়ার সম্ভাব্য ঝুঁকি সম্পর্কে ধারণা পাওয়া যায়।',
      url: 'https://diabetes.org',
      topic: 'diabetes',
    },
    {
      title: 'WHO – Diabetes Fact Sheet',
      subtitle: 'Global Health Organization',
      desc: 'ডায়াবেটিসের লক্ষণ, ঝুঁকির কারণ, জটিলতা, শনাক্তকরণ ও প্রতিরোধ সম্পর্কে তথ্য দেয়।',
      url: 'https://www.who.int/news-room/fact-sheets/detail/diabetes',
      topic: 'diabetes',
    },
    {
      title: 'National Heart Foundation of Bangladesh',
      subtitle: 'Cardiovascular Treatment & Prevention',
      desc: 'হৃদরোগের চিকিৎসা, সচেতনতা ও প্রতিরোধসংক্রান্ত তথ্যের জন্য এই প্রতিষ্ঠানটি দেখতে পারেন।',
      url: 'https://www.nhf.org.bd/',
      topic: 'cardio',
    },
    {
      title: 'Ibrahim Cardiac Hospital',
      subtitle: 'Affiliated with BADAS',
      desc: 'BADAS-এর অধিভুক্ত হৃদরোগ চিকিৎসা ও গবেষণা প্রতিষ্ঠানের তথ্য পাওয়া যায়।',
      url: 'https://www.ibrahimcardiac.org.bd/',
      topic: 'cardio',
    },
    {
      title: 'American Heart Association',
      subtitle: 'PREVENT Calculator & Guidelines',
      desc: 'উপযুক্ত প্রাপ্তবয়স্কদের স্বাস্থ্যসংক্রান্ত তথ্য ব্যবহার করে ১০ ও ৩০ বছরের হৃদরোগের ঝুঁকি অনুমান করে।',
      url: 'https://www.heart.org',
      topic: 'cardio',
    },
    {
      title: 'Framingham Heart Study',
      subtitle: 'NHLBI / Boston University',
      desc: 'হৃদরোগের ঝুঁকির কারণ ও দীর্ঘমেয়াদি ঝুঁকি নিরূপণ নিয়ে গবেষণার তথ্য দেয়।',
      url: 'https://framinghamheartstudy.org/',
      topic: 'cardio',
    },
    {
      title: 'DGHS Bangladesh',
      subtitle: 'Directorate General of Health Services',
      desc: 'সরকারি স্বাস্থ্য নির্দেশিকা, প্রকাশনা ও অসংক্রামক রোগ নিয়ন্ত্রণ কর্মসূচির তথ্য পাওয়া যায়।',
      url: 'https://dghs.gov.bd/',
      topic: 'all',
    },
    {
      title: 'IPHN Bangladesh',
      subtitle: 'Institute of Public Health Nutrition',
      desc: 'স্থূলতা, ডায়াবেটিস, উচ্চ রক্তচাপ ও করোনারি হৃদরোগ প্রতিরোধে পুষ্টির ভূমিকা সম্পর্কে তথ্য দেয়।',
      url: 'https://iphn.gov.bd/',
      topic: 'all',
    },
    {
      title: 'UNICEF South Asia',
      subtitle: 'NCDs Awareness',
      desc: 'অসংক্রামক রোগের ক্রমবর্ধমান ঝুঁকি এবং স্বাস্থ্যকর পরিবেশ ও প্রতিরোধের গুরুত্ব তুলে ধরে।',
      url: 'https://www.unicef.org/india/time-lead-protecting-indias-children-silent-rise-ncds',
      topic: 'all',
    },
  ];

  const eduCards = (BD_EDUCATION_CARDS[lang] || BD_EDUCATION_CARDS.en).filter(
    (c) => filter === 'all' || c.topic === filter || c.topic === 'all'
  );
  const filteredVideos =
    filter === 'all' ? allVideos : allVideos.filter((v) => v.topic === filter);
  const filteredWebLinks =
    filter === 'all'
      ? webLinks
      : webLinks.filter((o) => o.topic === filter || o.topic === 'all');

  return (
    <PageContainer className="space-y-10 py-8 sm:py-12">
      {/* Header & Topic Filter */}
      <SectionHeader
        badge={isBn ? 'জনস্বাস্থ্য শিক্ষা ও সচেতনতা' : 'Bangladesh Health Education Hub'}
        title={
          isBn
            ? 'সঠিক স্বাস্থ্য জ্ঞানই প্রতিরোধের প্রথম ধাপ'
            : 'Evidence-Based Health Education for Patients & Families'
        }
        subtitle={
          isBn
            ? 'বাংলাদেশের প্রেক্ষাপটে ডায়াবেটিস প্রতিরোধ, উচ্চ রক্তচাপ নিয়ন্ত্রণ, হৃদস্বাস্থ্য, খাদ্যাভ্যাস এবং কখন চিকিৎসকের শরণাপন্ন হবেন সে সম্পর্কে জানুন।'
            : 'Explore practical Bangladesh-relevant guidance on diabetes prevention, blood pressure control, nutrition, physical activity, and verified health resources.'
        }
        actions={
          <MedicalButton
            variant="primary"
            size="sm"
            onClick={() => navigate('/assessment')}
          >
            {isBn ? 'স্বাস্থ্য মূল্যায়ন শুরু করুন →' : 'Start Health Assessment →'}
          </MedicalButton>
        }
      />

      {/* Explicit Separation Between Educational Information & Personalized Clinical Advice */}
      <AlertBanner
        tone="info"
        title={
          isBn
            ? 'সাধারণ স্বাস্থ্য শিক্ষা বনাম ব্যক্তিগত চিকিৎসা পরামর্শ'
            : 'General Health Education vs. Personalized Clinical Advice'
        }
      >
        <p>
          {isBn
            ? 'এই পাতার সকল তথ্য শুধুমাত্র সাধারণ জনস্বাস্থ্য সচেতনতা ও শিক্ষার উদ্দেশ্যে প্রদান করা হয়েছে। এটি কোনো ব্যক্তির একক রোগ নির্ণয়, চিকিৎসা বা প্রেসক্রিপশনের বিকল্প নয়। ব্যক্তিগত চিকিৎসা সিদ্ধান্তের জন্য একজন রেজিস্টার্ড চিকিৎসকের পরামর্শ নিন।'
            : 'The resources on this page provide general public-health education and prevention guidance. They do not constitute personalized medical advice, diagnosis, or treatment instructions for an individual patient.'}
        </p>
      </AlertBanner>

      {/* Topic Filter Chips */}
      <div className="flex flex-wrap items-center gap-2.5">
        {[
          { id: 'all', label: isBn ? 'সব বিষয় (All Topics)' : 'All Topics' },
          { id: 'diabetes', label: isBn ? 'ডায়াবেটিস ও খাদ্যাভ্যাস' : 'Diabetes & Nutrition' },
          { id: 'cardio', label: isBn ? 'হৃদরোগ ও রক্তচাপ' : 'Heart & Blood Pressure' },
        ].map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setFilter(type.id)}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              filter === type.id
                ? 'bg-[#12304A] text-white shadow-clinical-xs'
                : 'bg-white text-[#475569] hover:bg-[#F0F5FA] border border-[#E2E8F0]'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: BANGLADESH-RELEVANT EDUCATIONAL CARDS */}
      <section className="space-y-5">
        <h2 className="text-xl font-bold text-[#12304A]">
          {isBn
            ? 'বাংলাদেশের প্রেক্ষাপটে দৈনন্দিন স্বাস্থ্য নির্দেশিকা'
            : 'Practical Health Guides for Bangladesh'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eduCards.map((card, idx) => (
            <ClinicalCard
              key={idx}
              accent={card.topic === 'diabetes' ? 'navy' : card.topic === 'cardio' ? 'teal' : 'warning'}
              className="flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge
                    tone={card.topic === 'diabetes' ? 'info' : card.topic === 'cardio' ? 'low' : 'moderate'}
                    size="sm"
                    label={card.badge}
                  />
                  {card.topic === 'diabetes' ? (
                    <Utensils className="w-4 h-4 text-[#0D9488]" aria-hidden="true" />
                  ) : card.topic === 'cardio' ? (
                    <HeartPulse className="w-4 h-4 text-[#0D9488]" aria-hidden="true" />
                  ) : (
                    <Footprints className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
                  )}
                </div>
                <h3 className="text-base font-bold text-[#12304A]">{card.title}</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-[#334155] leading-relaxed pt-1">
                  {card.points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#0D9488] font-bold mt-0.5">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ClinicalCard>
          ))}
        </div>
      </section>

      {/* SECTION 2: CLINICAL RISK REFERENCE CATEGORIES */}
      <ClinicalCard accent="navy">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">
                {isBn ? 'রেফারেন্স মানদণ্ড' : 'Clinical Reference Benchmarks'}
              </span>
              <h2 className="text-xl font-bold text-[#12304A] mt-0.5">
                {isBn
                  ? 'ডায়াবেটিস ও হৃদরোগের সাধারণ ক্লিনিক্যাল সীমা'
                  : 'Standard Clinical Risk Reference Ranges'}
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                {isBn
                  ? 'ল্যাবরেটরি ও রক্তচাপ রিপোর্টের সাধারণ আন্তর্জাতিক রেফারেন্স সীমা।'
                  : 'Educational reference criteria for laboratory glucose, HbA1c, and blood pressure readings.'}
              </p>
            </div>
            <Link
              to="/assessment"
              className="px-4 py-2 bg-[#12304A] hover:bg-[#1B4468] text-white text-xs font-bold rounded-xl transition self-start sm:self-auto"
            >
              {isBn ? 'আপনার পরিমাপ পরীক্ষা করুন →' : 'Test Your Metrics →'}
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {(filter === 'all' || filter === 'diabetes') && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
                  <Activity className="w-4 h-4 text-[#0D9488]" aria-hidden="true" />
                  <h3 className="font-bold text-[#12304A] text-sm uppercase tracking-wider">
                    {isBn ? 'ডায়াবেটিস রেফারেন্স স্তর' : 'Diabetes Reference Categories'}
                  </h3>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA]">
                    <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-[#991B1B] mb-1.5">
                      <span>▲ {isBn ? 'উচ্চ ঝুঁকি (High Risk)' : 'High Risk'}</span>
                      <span className="font-mono text-[11px] bg-white border border-[#FECACA] px-2.5 py-0.5 rounded-lg">
                        FBS ≥ 126 mg/dL | HbA1c ≥ 6.5%
                      </span>
                    </div>
                    <p className="text-[#991B1B]/90 leading-relaxed">
                      {isBn
                        ? 'দ্রুত একজন রেজিস্টার্ড চিকিৎসকের পরামর্শ নিন। নিয়মিত রক্তের গ্লুকোজ পরিমাপ করুন এবং মিষ্টিজাতীয় পানীয় বর্জন করুন।'
                        : 'Prompt consultation with a qualified healthcare professional. Regularly monitor blood glucose and follow medical advice.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
                    <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-[#92400E] mb-1.5">
                      <span>◆ {isBn ? 'মাঝারি ঝুঁকি (Moderate Risk)' : 'Moderate Risk'}</span>
                      <span className="font-mono text-[11px] bg-white border border-[#FDE68A] px-2.5 py-0.5 rounded-lg">
                        FBS 100–125 mg/dL | HbA1c 5.7–6.4%
                      </span>
                    </div>
                    <p className="text-[#92400E]/90 leading-relaxed">
                      {isBn
                        ? 'খাদ্যাভ্যাস উন্নত করুন, নিয়মিত হাঁটুন, ওজন নিয়ন্ত্রণে রাখুন এবং রক্তের গ্লুকোজ পর্যবেক্ষণ করুন।'
                        : 'Improve dietary habits, exercise regularly, maintain a healthy weight, and monitor blood glucose levels.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0]">
                    <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-[#15803D] mb-1.5">
                      <span>● {isBn ? 'কম ঝুঁকি (Low Risk)' : 'Low Risk'}</span>
                      <span className="font-mono text-[11px] bg-white border border-[#BBF7D0] px-2.5 py-0.5 rounded-lg">
                        FBS &lt; 100 mg/dL | HbA1c &lt; 5.7%
                      </span>
                    </div>
                    <p className="text-[#15803D]/90 leading-relaxed">
                      {isBn
                        ? 'সুষম পুষ্টি, নিয়মিত শারীরিক পরিশ্রম এবং বার্ষিক রুটিন চেকআপ বজায় রাখুন।'
                        : 'Maintain a healthy lifestyle through balanced nutrition, regular physical activity, and routine health monitoring.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {(filter === 'all' || filter === 'cardio') && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
                  <HeartPulse className="w-4 h-4 text-[#0D9488]" aria-hidden="true" />
                  <h3 className="font-bold text-[#12304A] text-sm uppercase tracking-wider">
                    {isBn ? 'হৃদরোগ ও রক্তচাপ রেফারেন্স স্তর' : 'Cardiovascular Reference Categories'}
                  </h3>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA]">
                    <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-[#991B1B] mb-1.5">
                      <span>▲ {isBn ? 'উচ্চ ঝুঁকি (High Risk)' : 'High Risk'}</span>
                      <span className="font-mono text-[11px] bg-white border border-[#FECACA] px-2.5 py-0.5 rounded-lg">
                        ASCVD ≥ 10% | BP ≥ 140/90 mmHg
                      </span>
                    </div>
                    <p className="text-[#991B1B]/90 leading-relaxed">
                      {isBn
                        ? 'দ্রুত চিকিৎসকের পরামর্শ নিন। রক্তচাপ ও কোলেস্টেরল পরিমাপ করুন, অতিরিক্ত লবণ ও ধূমপান বর্জন করুন।'
                        : 'Consult a healthcare professional promptly. Monitor blood pressure and cholesterol, reduce excess salt, and avoid smoking.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
                    <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-[#92400E] mb-1.5">
                      <span>◆ {isBn ? 'মাঝারি ঝুঁকি (Moderate Risk)' : 'Moderate Risk'}</span>
                      <span className="font-mono text-[11px] bg-white border border-[#FDE68A] px-2.5 py-0.5 rounded-lg">
                        ASCVD 3–10% | BP 120–139/80–89 mmHg
                      </span>
                    </div>
                    <p className="text-[#92400E]/90 leading-relaxed">
                      {isBn
                        ? 'খাবারে লবণ কমান, নিয়মিত হাঁটুন, তামাক বর্জন করুন এবং নিয়মিত রক্তচাপ পরীক্ষা করুন।'
                        : 'Improve dietary habits, exercise regularly, limit salt intake, avoid smoking, and attend regular health checkups.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0]">
                    <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-[#15803D] mb-1.5">
                      <span>● {isBn ? 'কম ঝুঁকি (Low Risk)' : 'Low Risk'}</span>
                      <span className="font-mono text-[11px] bg-white border border-[#BBF7D0] px-2.5 py-0.5 rounded-lg">
                        ASCVD &lt; 3% | BP &lt; 120/80 mmHg
                      </span>
                    </div>
                    <p className="text-[#15803D]/90 leading-relaxed">
                      {isBn
                        ? 'সুষম খাদ্য, নিয়মিত ব্যায়াম, মানসিক চাপ নিয়ন্ত্রণ এবং রুটিন চেকআপ বজায় রাখুন।'
                        : 'Maintain a healthy lifestyle through balanced nutrition, regular physical activity, stress management, and routine monitoring.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ClinicalCard>

      {/* SECTION 3: VERIFIED YOUTUBE VIDEO RESOURCES */}
      <ClinicalCard accent="teal">
        <div className="space-y-6">
          <div className="border-b border-[#E2E8F0] pb-4">
            <h2 className="text-xl font-bold text-[#12304A] flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-[#DC2626]" aria-hidden="true" />
              <span>
                {isBn ? 'যাচাইকৃত স্বাস্থ্য শিক্ষা ভিডিও' : 'Verified Clinical Education Videos'}
              </span>
            </h2>
            <p className="text-xs text-[#64748B] mt-1">
              {isBn
                ? 'বিশ্ব স্বাস্থ্য সংস্থা (WHO), CDC, Mayo Clinic ও AHA-এর শিক্ষামূলক ভিডিও ও বাংলা সারাংশ।'
                : 'Watch verified educational tutorials from WHO, CDC, Mayo Clinic, and the American Heart Association.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video, idx) => (
              <div
                key={idx}
                className="bg-[#F6F9FC] rounded-2xl overflow-hidden border border-[#E2E8F0] flex flex-col h-full"
              >
                <div className="aspect-video w-full bg-slate-900 relative">
                  <iframe
                    className="w-full h-full absolute top-0 left-0"
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={video.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <span className="text-[10px] font-bold text-[#0D9488] uppercase tracking-wider">
                    {video.category}
                  </span>
                  <h3 className="text-sm font-bold text-[#12304A] mt-1">{video.title}</h3>
                  <p className="text-xs text-[#475569] mt-2 leading-relaxed">{video.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ClinicalCard>

      {/* SECTION 4: TRUSTED HEALTH PORTALS */}
      <ClinicalCard accent="navy">
        <div className="space-y-6">
          <div className="border-b border-[#E2E8F0] pb-4">
            <h2 className="text-xl font-bold text-[#12304A] flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#0D9488]" aria-hidden="true" />
              <span>
                {isBn
                  ? 'নির্ভরযোগ্য বাংলাদেশ ও আন্তর্জাতিক স্বাস্থ্য পোর্টাল'
                  : 'Trusted Bangladesh & Global Health Portals'}
              </span>
            </h2>
            <p className="text-xs text-[#64748B] mt-1">
              {isBn
                ? 'বারডেম (BIRDEM), ন্যাশনাল হার্ট ফাউন্ডেশন, ইব্রাহিম কার্ডিয়াক এবং স্বাস্থ্য অধিদপ্তরের (DGHS) অফিশিয়াল ওয়েবসাইট।'
                : 'Official portals for BIRDEM, National Heart Foundation of Bangladesh, Ibrahim Cardiac Hospital, DGHS, and WHO.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWebLinks.map((org, idx) => (
              <a
                key={idx}
                href={org.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 rounded-xl bg-[#F6F9FC] hover:bg-white border border-[#E2E8F0] hover:border-[#0D9488] transition flex flex-col justify-between h-full"
              >
                <div>
                  <h3 className="text-sm font-bold text-[#12304A] group-hover:text-[#0D9488] transition-colors">
                    {org.title}
                  </h3>
                  <p className="text-[11px] font-semibold text-[#64748B] mt-0.5">{org.subtitle}</p>
                  <p className="text-xs text-[#475569] mt-2.5 leading-relaxed">{org.desc}</p>
                </div>
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#0D9488]">
                  <span>{isBn ? 'পোর্টাল দেখুন' : 'Visit Portal'}</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </ClinicalCard>

      {/* SECTION 5: FAQ ACCORDION */}
      <ClinicalCard>
        <div className="space-y-5">
          <div className="border-b border-[#E2E8F0] pb-4">
            <h2 className="text-xl font-bold text-[#12304A]">
              {isBn ? 'আপনার স্ক্রিনিং ফলাফল বোঝার সহায়িকা' : 'Understanding Your Screening Assessment'}
            </h2>
            <p className="text-xs text-[#64748B] mt-1">
              {isBn
                ? 'মেশিন লার্নিং ঝুঁকি অনুমান ও স্বাস্থ্য রেকর্ড সম্পর্কে সচরাচর জিজ্ঞাসিত প্রশ্ন।'
                : 'Frequently asked questions regarding statistical risk screening and saved records.'}
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: isBn
                  ? 'কিছু ক্ষেত্রে কেন ঝুঁকি অনুমান (Prediction) পাওয়া যায় না?'
                  : 'Why is a prediction unavailable or refused for some inputs?',
                a: isBn
                  ? 'মডেলগুলো নির্দিষ্ট গবেষণা ডেটাসেটের সীমার ভেতরে কাজ করে। গ্লুকোজ, রক্তচাপ বা বয়সের মান যদি গ্রহণযোগ্য সীমার বাইরে থাকে অথবা নিচের রক্তচাপ উপরের রক্তচাপের চেয়ে বেশি হয়, তবে ভুল অনুমান রোধে সিস্টেম তা গ্রহণ করে না।'
                  : 'Predictions require complete clinical measurements within the published dataset range. If measurements fall outside plausible or research-table bounds, VitaGuard refuses to guess.',
              },
              {
                q: isBn
                  ? 'ঝুঁকির শতাংশ (Risk Estimate) বলতে কী বোঝায়?'
                  : 'What does a statistical risk estimate mean?',
                a: isBn
                  ? 'ঝুঁকির শতাংশ হলো গবেষণা ডেটাসেটের অনুরূপ তথ্যের সাথে আপনার তথ্যের পরিসংখ্যানগত তুলনা। কম ঝুঁকি মানে শতভাগ রোগমুক্তি নয়, এবং উচ্চ ঝুঁকি মানেই নিশ্চিত রোগ নয়—এটি চিকিৎসকের পরামর্শ নেওয়ার একটি সহায়ক সংকেত।'
                  : 'A risk estimate reflects statistical similarity to labeled cases in a training dataset. Low risk does not mean zero risk, and high risk is a prompt for medical consultation—not a diagnosis.',
              },
              {
                q: isBn
                  ? 'আমার সেভ করা পরিমাপগুলো কোথায় থাকে?'
                  : 'Where are my saved measurements stored?',
                a: isBn
                  ? 'আপনি রোগী হিসেবে লগইন করে স্ক্রিনিং করলে তা আপনার ব্যক্তিগত ড্যাশবোর্ডে সংরক্ষিত থাকে। আপনি যেকোনো সময় ড্যাশবোর্ড থেকে তা দেখতে বা মুছে ফেলতে পারেন।'
                  : 'When signed in as a patient, your screenings are stored in your private account history and can be reviewed or deleted at any time from your Dashboard.',
              },
            ].map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-[#F6F9FC]"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 text-left text-sm font-bold text-[#12304A] flex justify-between items-center gap-3 hover:bg-white transition cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#64748B] shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 text-[#0D9488]' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-2 text-xs sm:text-sm text-[#475569] leading-relaxed bg-white border-t border-[#E2E8F0]">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </ClinicalCard>
    </PageContainer>
  );
}

export default AwarenessSection;
