import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function AwarenessSection() {
  const [filter, setFilter] = useState('all'); 
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // -----------------------------------------------------
  // 1. 100% Active YouTube Video IDs for Real Thumbnails
  // -----------------------------------------------------
  const allVideos = [
    // Diabetes Videos
    {
      id: "mRVZ9lkubag", // CDC A Change for Life (Preventing Type 2 Diabetes)
      title: "CDC – Preventing Type 2 Diabetes",
      category: "CDC Prevention",
      topic: "diabetes",
      desc: "স্বাস্থ্যকর খাবার, ব্যায়াম, ওজন নিয়ন্ত্রণ ও জীবনযাত্রার পরিবর্তনের মাধ্যমে ডায়াবেটিসের ঝুঁকি কমানোর উপায় দেখায়।"
    },
    {
      id: "V-1bOCr2XK8", // Mayo Clinic - Understanding Diabetes
      title: "Mayo Clinic – Type 2 Diabetes Prevention",
      category: "Mayo Clinic",
      topic: "diabetes",
      desc: "স্বাস্থ্যকর অভ্যাস, ওজন নিয়ন্ত্রণ এবং টাইপ ২ ডায়াবেটিস প্রতিরোধ বা বিলম্বিত করার উপায় জানায়।"
    },
    {
      id: "Kp6Jk9vsqkM", // WHO Diabetes Patient View
      title: "WHO – Diabetes Awareness & Prevention",
      category: "World Health Organization",
      topic: "diabetes",
      desc: "ডায়াবেটিসের ঝুঁকি, জটিলতা, প্রতিরোধ ও দ্রুত রোগ শনাক্তকরণের গুরুত্ব বোঝায়।"
    },
    {
      id: "7KRUfWqa0k8", // Riverside Diabetes
      title: "Diabetes Services: Preventing Diabetes",
      category: "Clinical Assessment",
      topic: "diabetes",
      desc: "রক্তে গ্লুকোজ ও HbA1c কী এবং ডায়াবেটিস মূল্যায়নে এসব পরীক্ষার ভূমিকা কী তা ব্যাখ্যা করে।"
    },

    // Cardiovascular Videos
    {
      id: "609od4UAdF4", // AHA PREVENT Risk Calculator
      title: "American Heart Association – PREVENT Risk Calculator",
      category: "AHA Cardiology",
      topic: "cardio",
      desc: "বিভিন্ন স্বাস্থ্যতথ্য ব্যবহার করে ভবিষ্যতে হৃদরোগ, স্ট্রোক ও হার্ট ফেইলিউরের ঝুঁকি অনুমান করার ধারণা দেয়।"
    },
    {
      id: "VYViolo48_0", // Stanford Heart Disease Prevention
      title: "Stanford Health – Cardiovascular Risk Prevention",
      category: "Stanford Health",
      topic: "cardio",
      desc: "হৃদরোগ কীভাবে তৈরি হয়, বংশগত ও জীবনযাপনজনিত ঝুঁকি এবং প্রতিরোধের উপায় ব্যাখ্যা করে।"
    },
    {
      id: "8WkumWFJ3FM", // Narayana Health Heart Disease
      title: "Heart Disease Prevention & Screening",
      category: "Narayana Health",
      topic: "cardio",
      desc: "উচ্চ রক্তচাপ, কোলেস্টেরল, ধূমপান, ডায়াবেটিস ও স্থূলতার কারণে হৃদরোগের ঝুঁকি এবং প্রতিরোধের উপায় জানায়।"
    }
  ];

  // -----------------------------------------------------
  // 2. Official Health Portals & Web Links
  // -----------------------------------------------------
  const webLinks = [
    // Diabetes Links
    {
      title: "BIRDEM General Hospital",
      subtitle: "Diabetic Association of Bangladesh",
      desc: "ডায়াবেটিস, হরমোনজনিত রোগ, রোগ নির্ণয়, চিকিৎসা ও সংশ্লিষ্ট গবেষণার তথ্য পাওয়া যায়।",
      url: "http://www.birdembd.org/",
      topic: "diabetes"
    },
    {
      title: "BIRDEM / BADAS – Animations",
      subtitle: "Diabetes Awareness Videos",
      desc: "ডায়াবেটিস সচেতনতা, প্রতিরোধ ও অ্যানিমেশনের মাধ্যমে স্বাস্থ্যশিক্ষা দেওয়া হয়।",
      url: "https://cghr-badas.org/animations/",
      topic: "diabetes"
    },
    {
      title: "RSSDI – Diabetes Education",
      subtitle: "Bengali Patient Area",
      desc: "ডায়াবেটিস প্রতিরোধ, জটিলতা ও স্বাস্থ্যসচেতনতা সম্পর্কে ধারণা দেয়।",
      url: "https://rssdi.in/newwebsite/patient-area.php/patient-area.php",
      topic: "diabetes"
    },
    {
      title: "American Diabetes Association",
      subtitle: "Diabetes Risk Test",
      desc: "প্রশ্নের উত্তর দিয়ে টাইপ ২ ডায়াবেটিস হওয়ার সম্ভাব্য ঝুঁকি সম্পর্কে ধারণা পাওয়া যায়।",
      url: "https://diabetes.org",
      topic: "diabetes"
    },
    {
      title: "WHO – Diabetes Fact Sheet",
      subtitle: "Global Health Organization",
      desc: "ডায়াবেটিসের লক্ষণ, ঝুঁকির কারণ, জটিলতা, শনাক্তকরণ ও প্রতিরোধ সম্পর্কে তথ্য দেয়।",
      url: "https://www.who.int/news-room/fact-sheets/detail/diabetes",
      topic: "diabetes"
    },
    
    // Cardiovascular Links
    {
      title: "National Heart Foundation of Bangladesh",
      subtitle: "Cardiovascular Treatment & Prevention",
      desc: "হৃদরোগের চিকিৎসা, সচেতনতা ও প্রতিরোধসংক্রান্ত তথ্যের জন্য এই প্রতিষ্ঠানটি দেখতে পারো।",
      url: "https://www.nhf.org.bd/",
      topic: "cardio"
    },
    {
      title: "Ibrahim Cardiac Hospital",
      subtitle: "Affiliated with BADAS",
      desc: "BADAS-এর অধিভুক্ত হৃদরোগ চিকিৎসা ও গবেষণা প্রতিষ্ঠানের তথ্য পাওয়া যায়।",
      url: "https://www.ibrahimcardiac.org.bd/",
      topic: "cardio"
    },
    {
      title: "American Heart Association",
      subtitle: "PREVENT Calculator & Guidelines",
      desc: "উপযুক্ত প্রাপ্তবয়স্কদের স্বাস্থ্যসংক্রান্ত তথ্য ব্যবহার করে ১০ ও ৩০ বছরের হৃদরোগের ঝুঁকি অনুমান করে।",
      url: "https://www.heart.org",
      topic: "cardio"
    },
    {
      title: "Framingham Heart Study",
      subtitle: "NHLBI / Boston University",
      desc: "হৃদরোগের ঝুঁকির কারণ ও দীর্ঘমেয়াদি ঝুঁকি নিরূপণ নিয়ে গবেষণার তথ্য দেয়।",
      url: "https://framinghamheartstudy.org/",
      topic: "cardio"
    },

    // All Topics / General Health Links
    {
      title: "DGHS Bangladesh",
      subtitle: "Directorate General of Health Services",
      desc: "সরকারি স্বাস্থ্য নির্দেশিকা, প্রকাশনা ও অসংক্রামক রোগ নিয়ন্ত্রণ কর্মসূচির তথ্য পাওয়া যায়।",
      url: "https://dghs.gov.bd/",
      topic: "all"
    },
    {
      title: "IPHN Bangladesh",
      subtitle: "Institute of Public Health Nutrition",
      desc: "স্থূলতা, ডায়াবেটিস, উচ্চ রক্তচাপ ও করোনারি হৃদরোগ প্রতিরোধে পুষ্টির ভূমিকা সম্পর্কে তথ্য দেয়।",
      url: "https://iphn.gov.bd/",
      topic: "all"
    },
    {
      title: "UNICEF India",
      subtitle: "NCDs Awareness",
      desc: "অসংক্রামক রোগের ক্রমবর্ধমান ঝুঁকি এবং স্বাস্থ্যকর পরিবেশ ও প্রতিরোধের গুরুত্ব তুলে ধরে।",
      url: "https://www.unicef.org/india/time-lead-protecting-indias-children-silent-rise-ncds",
      topic: "all"
    }
  ];

  // Filters setup
  const filteredVideos = filter === 'all' ? allVideos : allVideos.filter(v => v.topic === filter);
  const filteredWebLinks = filter === 'all' ? webLinks : webLinks.filter(o => o.topic === filter || o.topic === 'all');

  return (
    <div className="min-h-screen bg-[#f4f7fa] flex flex-col justify-between font-sans text-slate-800">
      {/* Main Hub Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-12">
        
        {/* Hero Section & Category Filter */}
        <div className="text-center sm:text-left animate-fade-in-up">
          <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-widest bg-blue-100/50 px-3 py-1.5 rounded-full shadow-sm border border-blue-100">
            KNOW A LITTLE. CARE A LITTLE MORE.
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-4 mb-2">
            Knowledge is a good first step.
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Select a category below to explore clinical predictions, verified YouTube resources, and trusted web portals tailored to your health interests.
          </p>

          {/* Interactive Filter Chips */}
          <div className="flex items-center justify-center sm:justify-start gap-3 mt-8">
            {['all', 'diabetes', 'cardio'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 transform active:scale-95 ${
                  filter === type
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 -translate-y-0.5'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {type === 'all' ? 'All Topics' : type === 'diabetes' ? 'Diabetes' : 'Heart Health'}
              </button>
            ))}
          </div>
        </div>

        {/* =========================================
            SECTION 1: CLINICAL PREDICTION MODELS
        ============================================= */}
        <div className="bg-white rounded-[2rem] border border-slate-200/80 p-8 sm:p-10 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                TriNexus – VitaGuard AI
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
                Clinical Risk Classification
              </h2>
              <p className="text-xs text-slate-500 mt-1.5">
                Benchmark criteria and automated AI health guidance integrated into VitaGuard models.
              </p>
            </div>
            <Link to="/assessment" className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-colors shadow-md text-center">
              Test Your Metrics →
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Diabetes Prediction Range (Visible for 'all' or 'diabetes') */}
            {(filter === 'all' || filter === 'diabetes') && (
              <div className="space-y-5">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                  <span className="text-xl">🩸</span>
                  <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">Diabetes Risk Categories</h3>
                </div>
                <div className="space-y-4 text-xs">
                  <div className="p-5 rounded-2xl bg-red-50 border border-red-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between font-bold text-red-900 mb-2">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> High Risk</span>
                      <span className="font-mono text-[10px] bg-white border border-red-200 px-2.5 py-1 rounded-lg shadow-sm">FBS ≥ 126 | HbA1c ≥ 6.5%</span>
                    </div>
                    <p className="text-red-800/80 text-[11px] leading-relaxed">Prompt consultation with a qualified healthcare professional. Regularly monitor blood glucose, limit sugary drinks, and follow medical advice.</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between font-bold text-amber-900 mb-2">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Medium Risk</span>
                      <span className="font-mono text-[10px] bg-white border border-amber-200 px-2.5 py-1 rounded-lg shadow-sm">FBS 100–125 | HbA1c 5.7–6.4%</span>
                    </div>
                    <p className="text-amber-800/80 text-[11px] leading-relaxed">Improve dietary habits, exercise regularly, maintain a healthy weight, get adequate sleep, and monitor blood glucose levels.</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between font-bold text-emerald-900 mb-2">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Low Risk</span>
                      <span className="font-mono text-[10px] bg-white border border-emerald-200 px-2.5 py-1 rounded-lg shadow-sm">FBS &lt; 100 | HbA1c &lt; 5.7%</span>
                    </div>
                    <p className="text-emerald-800/80 text-[11px] leading-relaxed">Maintain a healthy lifestyle through balanced nutrition, regular physical activity, adequate sleep, and routine health monitoring.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Cardio Prediction Range (Visible for 'all' or 'cardio') */}
            {(filter === 'all' || filter === 'cardio') && (
              <div className="space-y-5">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                  <span className="text-xl">🫀</span>
                  <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">Cardiovascular Risk Categories</h3>
                </div>
                <div className="space-y-4 text-xs">
                  <div className="p-5 rounded-2xl bg-red-50 border border-red-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between font-bold text-red-900 mb-2">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> High Risk</span>
                      <span className="font-mono text-[10px] bg-white border border-red-200 px-2.5 py-1 rounded-lg shadow-sm">ASCVD ≥ 10% | BP ≥ 140/90</span>
                    </div>
                    <p className="text-red-800/80 text-[11px] leading-relaxed">Consult a healthcare professional promptly. Monitor blood pressure and cholesterol, reduce excess salt, avoid smoking, and follow medical advice.</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between font-bold text-amber-900 mb-2">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Medium Risk</span>
                      <span className="font-mono text-[10px] bg-white border border-amber-200 px-2.5 py-1 rounded-lg shadow-sm">ASCVD 3–10% | BP 120–139/80–89</span>
                    </div>
                    <p className="text-amber-800/80 text-[11px] leading-relaxed">Improve dietary habits, exercise regularly, limit salt intake, avoid smoking, and attend regular health checkups.</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between font-bold text-emerald-900 mb-2">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Low Risk</span>
                      <span className="font-mono text-[10px] bg-white border border-emerald-200 px-2.5 py-1 rounded-lg shadow-sm">ASCVD &lt; 3% | BP &lt; 120/80</span>
                    </div>
                    <p className="text-emerald-800/80 text-[11px] leading-relaxed">Maintain a healthy lifestyle through balanced nutrition, regular physical activity, stress management, and routine health monitoring.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =========================================
            SECTION 2: YOUTUBE VIDEO RESOURCES
        ============================================= */}
        <div className="bg-white rounded-[2rem] border border-slate-200/80 p-8 shadow-sm space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -z-10 opacity-60 translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <span className="text-red-500">▶</span> Official YouTube Videos
            </h2>
            <p className="text-xs text-slate-500 mt-1">Watch verified clinical tutorials and presentations directly inside the hub.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video, idx) => (
              <div key={idx} className="group bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl hover:shadow-red-900/5 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full block">
                {/* 100% Working YouTube IFrame */}
                <div className="aspect-video w-full bg-slate-800 relative">
                    <iframe 
                        className="w-full h-full absolute top-0 left-0"
                        src={`https://www.youtube.com/embed/${video.id}`} 
                        title={video.title} 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen>
                    </iframe>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">{video.category}</span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1.5 group-hover:text-red-600 transition-colors line-clamp-2">{video.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed line-clamp-3 mb-4">
                    {video.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================
            SECTION 3: TRUSTED WEB PORTALS (LINKS)
        ============================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-7 sm:p-9 shadow-xs space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-10 opacity-60 translate-x-1/2 -translate-y-1/2"></div>
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <span className="text-emerald-500">🌐</span> Trusted Health Portals & Web Links
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Official portals for government guidelines, non-communicable disease programs, and studies.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
             {filteredWebLinks.map((org, idx) => (
                <a key={idx} href={org.url} target="_blank" rel="noopener noreferrer" className="group p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100/50 transition-all flex flex-col justify-between h-full">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">{org.title}</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">{org.subtitle}</p>
                    <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">{org.desc}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                    Visit Portal ↗
                  </div>
                </a>
             ))}
          </div>
        </div>

        {/* Interactive FAQ Accordion */}
        <div className="bg-white rounded-[2rem] border border-slate-200/80 p-8 sm:p-10 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-extrabold text-slate-900">Understanding your assessment</h2>
            <p className="text-xs text-slate-500 mt-1">Frequently asked questions regarding machine learning predictions.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Why is a prediction unavailable for some records?',
                a: 'Predictions require complete clinical measurements for the target model. If crucial features (such as fasting glucose or blood pressure) are missing or out of plausible range, VitaGuard marks the status as unavailable to prevent misleading assessments.'
              },
              {
                q: 'What does a risk estimate mean?',
                a: 'A risk estimate reflects the statistical likelihood of developing a condition based on patterns learned from clinical datasets. Low risk does not mean zero risk, and high risk is an actionable alert for medical consultation—not a diagnosis.'
              },
              {
                q: 'Where are my measurements saved?',
                a: 'Your measurements are securely encrypted and stored within your private VitaGuard patient account database. You can review, correct, or monitor trends at any time via your personal Dashboard.'
              }
            ].map((item, idx) => (
              <div key={idx} className="border border-slate-200/80 rounded-2xl overflow-hidden transition-all duration-300">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className={`w-full p-5 text-left text-xs sm:text-sm font-bold text-slate-800 flex justify-between items-center transition-colors cursor-pointer ${openFaq === idx ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                >
                  <span>{item.q}</span>
                  <span className={`text-slate-400 font-mono transition-transform duration-300 ${openFaq === idx ? 'rotate-180 text-blue-600' : ''}`}>
                    ▼
                  </span>
                </button>
                <div className={`transition-all duration-300 ease-in-out ${openFaq === idx ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                  <div className="px-5 pb-5 text-xs text-slate-500 leading-relaxed bg-blue-50/50">
                    {item.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200/80 py-5 px-8 text-center text-[11px] font-medium text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-3">
        <p>&copy; 2026 TriNexus · VitaGuard AI. A little awareness. A better tomorrow.</p>
        <Link to="/assessment" className="text-blue-600 hover:text-blue-800 transition-colors font-bold">Start a guided health assessment</Link>
      </footer>
    </div>
  );
}

export default AwarenessSection;