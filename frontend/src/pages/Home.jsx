import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  FileSearch,
  Lock,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Users,
  BookOpen,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath } from '../utils/roles';
import PageContainer from '../components/ui/PageContainer';
import ClinicalCard from '../components/ui/ClinicalCard';
import MedicalButton from '../components/ui/MedicalButton';
import SectionHeader from '../components/ui/SectionHeader';
import StatusBadge from '../components/ui/StatusBadge';
import AlertBanner from '../components/ui/AlertBanner';

const COPY = {
  en: {
    eyebrow: 'TriNexus · Ethical Clinical Decision Support System',
    heroTitle: 'Responsible, Explainable Health Risk Screening for Bangladesh',
    heroLead:
      'VitaGuard AI helps patients and clinicians organize health measurements, explore statistical risk estimates for diabetes and cardiovascular conditions, understand contributing factors with TreeSHAP and model feature weights, and connect with admin-reviewed doctors.',
    primaryCta: 'Start Health Assessment',
    secondaryCta: 'Learn How It Works',
    dashboardCta: 'Open My Dashboard',
    safetyNoticeTitle: 'Clinical Screening Support — Never an Automatic Diagnosis',
    safetyNoticeBody:
      'VitaGuard AI provides statistical risk estimates to support early awareness and clinical conversation. It does not diagnose disease, prescribe medication, or replace a qualified physician.',
    introBadge: 'Platform Overview',
    introTitle: 'Built for Clarity, Clinical Honesty, and Patient Trust',
    introSubtitle:
      'Unlike opaque health calculators that hide their limitations, VitaGuard AI shows what each model measures, which dataset it was trained on, and why each biomarker influenced your screening result.',
    pillars: [
      {
        title: 'Guided 5-Step Intake',
        desc: 'Structured step-by-step forms with clear measurement units, normal reference ranges, and bilingual Bangla/English instructions.',
      },
      {
        title: 'Explainable AI (TreeSHAP & Model Weights)',
        desc: 'See which clinical indicators influenced a screening estimate via local TreeSHAP for diabetes screening and global feature weights for cardiology.',
      },
      {
        title: 'Doctor-in-the-Loop Care',
        desc: 'Request a screening review or book an appointment slot with doctors whose BMDC registration details have been checked by an administrator.',
      },
    ],
    screeningBadge: 'Screening Pathways',
    screeningTitle: 'Two Core Health Domains, Two Transparent Pathways',
    screeningSubtitle:
      'Choose laboratory-based clinical screening when you have lab reports, or use the Bangladesh non-invasive pathway when you only have basic physical measurements.',
    diabetesCard: {
      tag: 'Bangladesh DiaBD',
      title: 'Diabetes screening index',
      desc: 'An uncalibrated screening index from the Bangladesh DiaBD pathway. Not a diagnosis.',
      points: [
        'DiaBD uses age, sex, BMI, blood pressure, and family history, with the existing local TreeSHAP view.',
        'The Pima form stays open for eight historical measurements that DiaBD does not use. The table is 768 women aged 21 to 81, and the result is not a diagnosis or a Bangladesh model.',
        'The score is not a calibrated personal probability and not a laboratory result.',
      ],
      primaryBtn: 'Start Bangladesh Screening',
      secondaryBtn: 'View Assessment Hub',
    },
    cardioCard: {
      tag: 'Cardiac Screening (Logistic Regression + WHO)',
      title: 'Cardiovascular Risk Screening',
      desc: 'Organize heart-health indicators with logistic regression global coefficients and published South Asia reference charts.',
      points: [
        'Clinical Cardiology Pathway (13 inputs): Resting blood pressure, serum cholesterol, resting ECG, ST metrics, with global model coefficients (not individual TreeSHAP).',
        'WHO South Asia Non-Laboratory Chart (Ages 40–74): 10-year cardiovascular risk band lookup using age, sex, smoking status, systolic blood pressure, and BMI.',
        'Automatic clinical safety lockouts when prior heart attack or stroke requires direct physician care.',
      ],
      primaryBtn: 'Start Cardiovascular Assessment',
      secondaryBtn: 'Open WHO South Asia Chart',
    },
    howBadge: 'Step-by-Step Workflow',
    howTitle: 'How VitaGuard AI Works',
    howSubtitle: 'A transparent four-stage workflow designed so patients and families never feel lost.',
    steps: [
      {
        step: '01',
        title: 'Choose Your Screening Pathway',
        desc: 'Select Diabetes, Cardiovascular, or Bangladesh Non-Invasive screening based on the measurements you have available.',
      },
      {
        step: '02',
        title: 'Enter Measurements in 5 Guided Steps',
        desc: 'Follow simple bilingual prompts with unit hints and range checks that refuse implausible or out-of-table numbers.',
      },
      {
        step: '03',
        title: 'Review Explainable Screening Results',
        desc: 'Read your risk category, model score, directional SHAP factor breakdown, and explicit model limitations.',
      },
      {
        step: '04',
        title: 'Connect with a Doctor or Save Your Record',
        desc: 'Signed-in patients can save records to their longitudinal history, request a doctor review, or print a clinical summary.',
      },
    ],
    bdBadge: 'Bangladesh-First Design',
    bdTitle: 'Designed for Real Patients and Families Across Bangladesh',
    bdSubtitle:
      'Healthcare tools must work for first-time digital users, elderly family members, and low-cost Android phones.',
    bdCards: [
      {
        title: 'Bilingual Bangla & English Experience',
        desc: 'Switch seamlessly between natural, respectful Bangla and English at any step without losing your entered form data.',
      },
      {
        title: 'Non-Laboratory Screening Option',
        desc: 'When fasting blood sugar or lipid panels are unavailable, use the Bangladesh DiaBD and WHO South Asia non-lab tools using blood pressure and BMI.',
      },
      {
        title: 'Community Blood Network & Health Education',
        desc: 'The blood page is a labeled simulation. It is not a hospital donation service. Public notices are separate educational posts.',
      },
    ],
    transparencyBadge: 'Scientific Honesty',
    transparencyTitle: 'Clinical Transparency & Published Model Evaluation',
    transparencyBody:
      'A responsible Clinical Decision Support System never hides missed cases behind a single accuracy number. Our public Model Evaluation page reports held-out test confusion matrices, sensitivity, specificity, and dataset cohort limitations (Pima, Cleveland Clinic, DiaBD, and Pabna hospital comparison).',
    transparencyBtn: 'Inspect Model Evaluation & Test Counts',
    doctorBadge: 'Clinician Collaboration',
    doctorTitle: 'How Doctors Participate in VitaGuard AI',
    doctorBody:
      'Doctors register with their BMDC registration number, specialty, and workplace. Once an administrator reviews their registration details, doctors can inspect patient-submitted screening records, attach clinical guidelines to the patient dashboard, manage appointment requests, and publish public health notices.',
    privacyBadge: 'Privacy & Clinical Safety',
    privacyTitle: 'Patient Privacy & Ethical Guardrails',
    privacyItems: [
      'Explicit Informed Consent: No screening model runs until you explicitly confirm that you understand the estimate is non-diagnostic.',
      'Deletion request: A signed-in patient can ask to remove that account’s screening rows. Database-file backups are kept, and complete erasure is not claimed.',
      'No Automated Prescriptions: VitaGuard AI never recommends specific drug names or dosages.',
      'No False Reassurance: Low-risk screening scores clearly state how many positive cases were missed on held-out tests so symptoms are never ignored.',
    ],
    faqBadge: 'Common Questions',
    faqTitle: 'Frequently Asked Questions',
    faqs: [
      {
        q: 'Is a VitaGuard AI result a confirmed medical diagnosis?',
        a: 'No. Every result generated by VitaGuard AI is a statistical screening estimate based on historical datasets. Only a qualified physician can diagnose diabetes or cardiovascular disease after clinical examination and laboratory testing.',
      },
      {
        q: 'Can I use VitaGuard AI without signing in?',
        a: 'Yes. You can run Diabetes, Cardiovascular, and Bangladesh screenings as a guest. Signing in as a patient allows you to save your screening history, request a doctor review, and book appointments.',
      },
      {
        q: 'What is the difference between the standard assessment and the Bangladesh screening page?',
        a: 'The lab diabetes page uses the Pima research table and states that limit on the screen. The Bangladesh DiaBD page is a separate uncalibrated screening score. Heart tools are the Cleveland historical model and the WHO South Asia chart lookup. None of these is a diagnosis.',
      },
      {
        q: 'How is my health data protected?',
        a: 'Saved screening rows are tied to the signed-in account. A deletion request can remove them. Database-file backups are kept, and complete erasure is not claimed.',
      },
    ],
  },
  bn: {
    eyebrow: 'ট্রাইনেক্সাস · নৈতিক ক্লিনিক্যাল ডিসিশন সাপোর্ট সিস্টেম',
    heroTitle: 'বাংলাদেশের জন্য দায়িত্বশীল ও ব্যাখ্যাযোগ্য স্বাস্থ্য ঝুঁকি স্ক্রিনিং',
    heroLead:
      'ভিটাগার্ড এআই (VitaGuard AI) রোগী ও চিকিৎসকদের স্বাস্থ্য পরিমাপগুলো গুছিয়ে রাখতে, ডায়াবেটিস ও হৃদরোগের পরিসংখ্যানগত ঝুঁকি বুঝতে, ট্রি-SHAP ও মডেল ফিচার গুরুত্বের মাধ্যমে মূল প্রভাবক জানতে এবং যাচাইকৃত ডাক্তারদের সাথে যুক্ত হতে সহায়তা করে।',
    primaryCta: 'স্বাস্থ্য মূল্যায়ন শুরু করুন',
    secondaryCta: 'কীভাবে কাজ করে জানুন',
    dashboardCta: 'আমার ড্যাশবোর্ডে যান',
    safetyNoticeTitle: 'প্রাথমিক স্বাস্থ্য স্ক্রিনিং সহায়তা — এটি কোনো চূড়ান্ত রোগ নির্ণয় নয়',
    safetyNoticeBody:
      'ভিটাগার্ড এআই প্রাথমিক সচেতনতা ও চিকিৎসকের সাথে আলোচনার সুবিধার্থে পরিসংখ্যানগত ঝুঁকি অনুমান প্রদান করে। এটি কোনো রোগ নির্ণয় করে না, ওষুধের প্রেসক্রিপশন দেয় না এবং রেজিস্টার্ড চিকিৎসকের বিকল্প নয়।',
    introBadge: 'প্ল্যাটফর্ম পরিচিতি',
    introTitle: 'স্বচ্ছতা, চিকিৎসাগত সততা ও রোগীর আস্থার ওপর নির্মিত',
    introSubtitle:
      'সাধারণ স্বাস্থ্য ক্যালকুলেটরের মতো সীমাবদ্ধতা লুকিয়ে না রেখে, ভিটাগার্ড এআই স্পষ্টভাবে দেখায় কোন মডেল কী পরিমাপ করে, কোন ডেটাসেটে তা তৈরি হয়েছে এবং কেন আপনার ফলাফল এমন এসেছে।',
    pillars: [
      {
        title: '৫ ধাপের সহজ গাইডেড ফর্ম',
        desc: 'সঠিক পরিমাপের একক, স্বাভাবিক সীমা এবং সহজ বাংলা ও ইংরেজি নির্দেশনাসহ ধাপে ধাপে তথ্য প্রদানের সুবিধা।',
      },
      {
        title: 'ব্যাখ্যাযোগ্য এআই (ট্রি-SHAP ও ফিচার গুরুত্ব)',
        desc: 'অস্পষ্ট সংখ্যার বদলে ডায়াবেটিসের ক্ষেত্রে লোকাল ট্রি-SHAP এবং কার্ডিওভাসকুলারের ক্ষেত্রে মডেল সাধারণ সহগের মাধ্যমে কোন সূচক প্রভাব ফেলেছে তা দেখুন।',
      },
      {
        title: 'ডাক্তারের পর্যালোচনা ও পরামর্শ',
        desc: 'অ্যাডমিন কর্তৃক BMDC তথ্য যাচাইকৃত ডাক্তারদের কাছে আপনার সেভ করা স্ক্রিনিং রিভিউয়ের জন্য পাঠান বা অ্যাপয়েন্টমেন্টের সময় চান।',
      },
    ],
    screeningBadge: 'স্ক্রিনিংয়ের মাধ্যমসমূহ',
    screeningTitle: 'দুটি প্রধান স্বাস্থ্য ক্ষেত্র, দুটি স্বচ্ছ পদ্ধতি',
    screeningSubtitle:
      'ল্যাবরেটরি রিপোর্ট থাকলে ক্লিনিক্যাল ল্যাব পাথওয়ে বেছে নিন, অথবা শুধুমাত্র রক্তচাপ ও ওজন/উচ্চতা জানা থাকলে বাংলাদেশ নন-ইনভেসিভ স্ক্রিনিং ব্যবহার করুন।',
    diabetesCard: {
      tag: 'বাংলাদেশ DiaBD',
      title: 'ডায়াবেটিস স্ক্রিনিং সূচক',
      desc: 'বাংলাদেশ DiaBD পথের একটি ক্যালিব্রেট না করা স্ক্রিনিং সূচক। রোগ নির্ণয় নয়।',
      points: [
        'DiaBD বয়স, লিঙ্গ, বিএমআই, রক্তচাপ ও পারিবারিক ইতিহাস ব্যবহার করে। লোকাল TreeSHAP আগের মতোই থাকে।',
        'পিমা ফর্ম খোলা থাকে, কারণ DiaBD যে আটটি পরিমাপ নেয় না সেগুলো এই পথ পড়ে। টেবিল ২১ থেকে ৮১ বছরের ৭৬৮ জন নারীর। ফল রোগ নির্ণয় বা বাংলাদেশের মডেল নয়।',
        'স্কোরটি ক্যালিব্রেট করা ব্যক্তিগত সম্ভাবনা নয় এবং ল্যাব ফল নয়।',
      ],
      primaryBtn: 'বাংলাদেশ স্ক্রিনিং শুরু করুন',
      secondaryBtn: 'অ্যাসেসমেন্ট হাব দেখুন',
    },
    cardioCard: {
      tag: 'হৃদস্বাস্থ্য স্ক্রিনিং (লজিস্টিক রিগ্রেশন + WHO)',
      title: 'হৃদরোগ ঝুঁকি মূল্যায়ন',
      desc: 'ক্লিনিক্যাল কার্ডিওলজি সূচকের সাধারণ মডেল সহগ এবং বিশ্ব স্বাস্থ্য সংস্থার (WHO) দক্ষিণ এশিয়া ছকের মাধ্যমে ঝুঁকি মূল্যায়ন করুন।',
      points: [
        'ক্লিনিক্যাল কার্ডিওলজি পদ্ধতি (১৩টি তথ্য): রক্তচাপ, কোলেস্টেরল, ইসিজি সহ সাধারণ মডেল সহগ (কোনো একক ট্রি-SHAP নয়)।',
        'WHO দক্ষিণ এশিয়া নন-ল্যাব ছক (বয়স ৪০–৭৪): বয়স, লিঙ্গ, ধূমপান, সিস্টোলিক রক্তচাপ ও বিএমআই ব্যবহার করে ১০ বছরের হৃদরোগ ঝুঁকির ব্যান্ড।',
        'পূর্বে হার্ট অ্যাটাক বা স্ট্রোকের ইতিহাস থাকলে সরাসরি চিকিৎসকের পরামর্শ নেওয়ার নিরাপত্তা সতর্কতা।',
      ],
      primaryBtn: 'হৃদরোগ মূল্যায়ন শুরু করুন',
      secondaryBtn: 'WHO দক্ষিণ এশিয়া ছক দেখুন',
    },
    howBadge: 'কাজের ধাপসমূহ',
    howTitle: 'ভিটাগার্ড এআই কীভাবে কাজ করে',
    howSubtitle: 'রোগী ও পরিবারের সদস্যরা যেন সহজেই প্রতিটি ধাপ বুঝতে পারেন সেজন্য চারটি স্পষ্ট ধাপ।',
    steps: [
      {
        step: '০১',
        title: 'উপযুক্ত স্ক্রিনিং বেছে নিন',
        desc: 'আপনার কাছে থাকা তথ্যের ওপর ভিত্তি করে ডায়াবেটিস, হৃদরোগ অথবা বাংলাদেশ নন-ইনভেসিভ স্ক্রিনিং নির্বাচন করুন।',
      },
      {
        step: '০২',
        title: '৫টি সহজ ধাপে তথ্য দিন',
        desc: 'বাংলা ও ইংরেজি নির্দেশনা এবং সঠিক একক দেখে তথ্য দিন। অগ্রহণযোগ্য বা টেবিলের বাইরের মান ফর্ম স্বয়ংক্রিয়ভাবে আটকে দেবে।',
      },
      {
        step: '০৩',
        title: 'ব্যাখ্যাসহ ফলাফল দেখুন',
        desc: 'ঝুঁকির স্তর, মডেল স্কোর, SHAP প্রভাবক তালিকা এবং মডেলের সীমাবদ্ধতাগুলো শান্ত ও স্পষ্ট ভাষায় পড়ুন।',
      },
      {
        step: '০৪',
        title: 'ডাক্তারের পরামর্শ নিন বা রেকর্ড সেভ করুন',
        desc: 'লগইন করা রোগীরা রেকর্ড সংরক্ষণ করতে পারেন, ডাক্তারের রিভিউ চাইতে পারেন এবং প্রিন্টযোগ্য রিপোর্ট নিতে পারেন।',
      },
    ],
    bdBadge: 'বাংলাদেশ-কেন্দ্রিক ডিজাইন',
    bdTitle: 'বাংলাদেশের সাধারণ মানুষ ও পরিবারের কথা ভেবে তৈরি',
    bdSubtitle:
      'প্রথমবার ইন্টারনেট ব্যবহারকারী, বয়স্ক মানুষ এবং কমদামী অ্যান্ড্রয়েড ফোনেও যেন সহজে ব্যবহার করা যায়।',
    bdCards: [
      {
        title: 'সহজ বাংলা ও ইংরেজি ভাষা',
        desc: 'যেকোনো সময় বাংলা ও ইংরেজি ভাষার মধ্যে পরিবর্তন করুন—আপনার লেখা তথ্যের কোনো ক্ষতি হবে না।',
      },
      {
        title: 'ল্যাব টেস্ট ছাড়া প্রাথমিক স্ক্রিনিং',
        desc: 'হাতের কাছে রক্ত পরীক্ষার রিপোর্ট না থাকলে শুধুমাত্র রক্তচাপ ও বিএমআই দিয়ে বাংলাদেশ DiaBD এবং WHO ছক ব্যবহার করুন।',
      },
      {
        title: 'ব্লাড নেটওয়ার্ক ও স্বাস্থ্য শিক্ষা',
        desc: 'ব্লাড পাতা একটি চিহ্নিত সিমুলেশন। এটি হাসপাতালের রক্তদান সেবা নয়। পাবলিক নোটিশ আলাদা শিক্ষামূলক পোস্ট।',
      },
    ],
    transparencyBadge: 'বৈজ্ঞানিক সততা',
    transparencyTitle: 'ক্লিনিক্যাল স্বচ্ছতা ও প্রকাশিত মডেল মূল্যায়ন',
    transparencyBody:
      'একটি দায়িত্বশীল ক্লিনিক্যাল ডিসিশন সাপোর্ট সিস্টেম কখনো শুধু একটি অ্যাকুরেসি সংখ্যা দেখিয়ে মিস হওয়া কেস লুকায় না। আমাদের মডেল মূল্যায়ন পাতায় টেস্ট কনফিউশন ম্যাট্রিক্স, সেন্সিটিভিটি, স্পেসিফিসিটি এবং ডেটাসেটের সীমাবদ্ধতা (পিমা, ক্লিভল্যান্ড ক্লিনিক, DiaBD ও পাবনা হাসপাতাল তুলনা) উন্মুক্তভাবে প্রকাশ করা হয়েছে।',
    transparencyBtn: 'মডেল মূল্যায়ন ও টেস্ট ফলাফল দেখুন',
    doctorBadge: 'চিকিৎসকের সম্পৃক্ততা',
    doctorTitle: 'ভিটাগার্ড এআই-তে ডাক্তারদের ভূমিকা',
    doctorBody:
      'ডাক্তাররা তাঁদের BMDC রেজিস্ট্রেশন নম্বর, বিশেষজ্ঞতা ও কর্মস্থলের তথ্য দিয়ে নিবন্ধন করেন। অ্যাডমিন তথ্য পর্যালোচনা করার পর তাঁরা রোগীর স্ক্রিনিং রেকর্ড দেখতে পারেন, রোগীর ড্যাশবোর্ডে ক্লিনিক্যাল গাইডলাইন পাঠাতে পারেন, অ্যাপয়েন্টমেন্ট নিশ্চিত করতে পারেন এবং জনস্বাস্থ্য নোটিশ প্রকাশ করতে পারেন।',
    privacyBadge: 'গোপনীয়তা ও নিরাপত্তা',
    privacyTitle: 'রোগীর তথ্যের গোপনীয়তা ও নৈতিক সুরক্ষা',
    privacyItems: [
      'স্পষ্ট সম্মতি ছাড়া স্ক্রিনিং চলে না: এটি রোগ নির্ণয় নয়—এই মর্মে সম্মতি দেওয়ার পরেই কেবল হিসাব চলে।',
      'মুছে ফেলার অনুরোধ: লগইন করা রোগী নিজের অ্যাকাউন্টের স্ক্রিনিং সারি সরানোর অনুরোধ করতে পারেন। ডেটাবেজ ফাইলের ব্যাকআপ থাকে, এবং সম্পূর্ণ মুছে ফেলার দাবি করা হয় না।',
      'কোনো ওষুধের নাম বা ডোজ দেওয়া হয় না: ভিটাগার্ড এআই কখনো স্বয়ংক্রিয়ভাবে ওষুধ বা ডোজ নির্ধারণ করে না।',
      'ভুল আশ্বাস থেকে সুরক্ষা: কম ঝুঁকির ফলাফলেও মডেল টেস্টে কতজন রোগী মিস করেছে তা জানানো হয়, যাতে শারীরিক উপসর্গ অবহেলা না করা হয়।',
    ],
    faqBadge: 'সচরাচর জিজ্ঞাসা',
    faqTitle: 'সাধারণ প্রশ্ন ও উত্তর (FAQ)',
    faqs: [
      {
        q: 'ভিটাগার্ড এআই-এর ফলাফল কি চূড়ান্ত রোগ নির্ণয়?',
        a: 'না। ভিটাগার্ড এআই-এর প্রতিটি ফলাফল গবেষণা ডেটাসেটের ওপর ভিত্তি করে একটি পরিসংখ্যানগত স্ক্রিনিং অনুমান মাত্র। শুধুমাত্র একজন রেজিস্টার্ড চিকিৎসক শারীরিক পরীক্ষা ও ল্যাব টেস্টের মাধ্যমে চূড়ান্ত রোগ নির্ণয় করতে পারেন।',
      },
      {
        q: 'অ্যাকাউন্টে লগইন না করেও কি স্ক্রিনিং করা যাবে?',
        a: 'হ্যাঁ। গেস্ট হিসেবেও আপনি ডায়াবেটিস, হৃদরোগ এবং বাংলাদেশ স্ক্রিনিং চালাতে পারবেন। তবে ফলাফল সংরক্ষণ করতে, ডাক্তারের রিভিউ চাইতে এবং অ্যাপয়েন্টমেন্ট বুক করতে রোগী হিসেবে সাইন ইন করা প্রয়োজন।',
      },
      {
        q: 'সাধারণ অ্যাসেসমেন্ট এবং বাংলাদেশ স্ক্রিনিং পাতার পার্থক্য কী?',
        a: 'ল্যাব ডায়াবেটিস পাতা পিমা গবেষণা টেবিল ব্যবহার করে এবং সেই সীমা পাতায় লেখা থাকে। বাংলাদেশ ডায়াবিডি আলাদা একটি আনক্যালিব্রেটেড স্ক্রিনিং স্কোর। হৃদযন্ত্রের সরঞ্জাম হলো ক্লিভল্যান্ডের পুরোনো মডেল এবং ডব্লিউএইচও দক্ষিণ এশিয়া চার্ট। এগুলোর কোনোটিই রোগ নির্ণয় নয়।',
      },
      {
        q: 'আমার স্বাস্থ্য তথ্য কীভাবে সুরক্ষিত থাকে?',
        a: 'সেভ করা স্ক্রিনিং সারি সাইন-ইন করা অ্যাকাউন্টের সাথে থাকে। মুছে ফেলার অনুরোধ সেগুলি সরাতে পারে। ডেটাবেজ ফাইলের ব্যাকআপ থাকে, এবং সম্পূর্ণ মুছে ফেলার দাবি করা হয় না।',
      },
    ],
  },
};

function Home() {
  const { lang } = useLanguage();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);

  const c = COPY[lang] || COPY.en;
  const isLoggedIn = Boolean(token && user);

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-clinical-bg text-[#12304A]">
      {/* HERO SECTION */}
      <section className="bg-gradient-to-b from-[#12304A] to-[#173B5B] text-white border-b border-[#1E4970]">
        <PageContainer className="py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#5EEAD4] text-xs font-bold tracking-wide">
                <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{c.eyebrow}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
                {c.heroTitle}
              </h1>

              <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl">
                {c.heroLead}
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <MedicalButton
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/assessment')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {c.primaryCta}
                </MedicalButton>

                <button
                  type="button"
                  onClick={scrollToHowItWorks}
                  className="inline-flex items-center justify-center gap-2 min-h-[52px] px-6 py-3 rounded-xl font-semibold text-base text-white bg-white/10 hover:bg-white/15 border border-white/25 transition cursor-pointer"
                >
                  <span>{c.secondaryCta}</span>
                </button>

                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={() => navigate(getDashboardPath())}
                    className="inline-flex items-center justify-center gap-2 min-h-[52px] px-5 py-3 rounded-xl font-semibold text-sm text-[#99F6E4] hover:text-white underline underline-offset-4 cursor-pointer"
                  >
                    <span>{c.dashboardCta} →</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Clinical Summary Panel */}
            <div className="lg:col-span-5">
              <div className="bg-white text-[#12304A] rounded-2xl p-6 sm:p-7 shadow-clinical-lg border border-[#E2E8F0] space-y-5">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#0D9488] flex items-center justify-center font-bold">
                      <Activity className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#12304A]">
                        {lang === 'bn' ? 'ক্লিনিক্যাল স্ক্রিনিং মডিউল' : 'Clinical Screening Modules'}
                      </h2>
                      <p className="text-xs text-[#64748B]">
                        {lang === 'bn' ? 'ব্যাখ্যাযোগ্য এআই ও ডক্টর রিভিউ যুক্ত' : 'Explainable AI + Doctor Review Ready'}
                      </p>
                    </div>
                  </div>
                  <StatusBadge
                    tone="info"
                    size="sm"
                    label={lang === 'bn' ? 'বাংলা ও EN' : 'BN & EN'}
                  />
                </div>

                <div className="space-y-3">
                  <Link
                    to="/bangladesh"
                    className="block p-4 rounded-xl border border-[#E2E8F0] hover:border-[#0D9488] bg-[#F6F9FC] hover:bg-white transition group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#12304A] group-hover:text-[#0D9488]">
                        {lang === 'bn' ? '১. বাংলাদেশ নন-ইনভেসিভ স্ক্রিনিং (সক্রিয়)' : '1. Bangladesh Non-Invasive Screening (Active)'}
                      </span>
                      <span className="text-xs font-semibold text-[#0D9488]">→</span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">
                      {lang === 'bn'
                        ? 'রক্ত পরীক্ষা ছাড়া স্ক্রিনিং · DiaBD + WHO হৃদঝুঁকি ছক'
                        : 'Non-invasive screening · DiaBD + WHO CVD risk chart'}
                    </p>
                  </Link>

                  <Link
                    to="/predict/cardio"
                    className="block p-4 rounded-xl border border-[#E2E8F0] hover:border-[#0D9488] bg-[#F6F9FC] hover:bg-white transition group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#12304A] group-hover:text-[#0D9488]">
                        {lang === 'bn' ? '২. হৃদরোগ ঝুঁকি স্ক্রিনিং' : '2. Cardiovascular Risk Screening'}
                      </span>
                      <span className="text-xs font-semibold text-[#0D9488]">→</span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">
                      {lang === 'bn'
                        ? '১৩টি কার্ডিয়াক সূচক · গাইডেড ৫-ধাপের উইজার্ড'
                        : '13 cardiac measurements · Guided 5-step wizard'}
                    </p>
                  </Link>

                  <Link
                    to="/bangladesh"
                    className="block p-4 rounded-xl border border-[#99F6E4] bg-[#F0FDFA] hover:bg-[#CCFBF1]/50 transition group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#0F766E]">
                        {lang === 'bn'
                          ? '৩. বাংলাদেশ নন-ইনভেসিভ স্ক্রিনিং (DiaBD ও WHO)'
                          : '3. Bangladesh Non-Invasive Screening (DiaBD & WHO)'}
                      </span>
                      <span className="text-xs font-semibold text-[#0F766E]">→</span>
                    </div>
                    <p className="text-xs text-[#0F766E]/80 mt-1">
                      {lang === 'bn'
                        ? 'রক্ত পরীক্ষা ছাড়াই রক্তচাপ ও বিএমআই দিয়ে প্রাথমিক ঝুঁকি অনুমান'
                        : 'No lab blood draw required — uses blood pressure, BMI, age & history'}
                    </p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      <PageContainer className="space-y-14 py-10 sm:py-14">
        {/* CLINICAL DISCLAIMER BANNER */}
        <AlertBanner tone="warning" title={c.safetyNoticeTitle}>
          <p>{c.safetyNoticeBody}</p>
        </AlertBanner>

        {/* PLATFORM INTRODUCTION */}
        <section className="space-y-6">
          <SectionHeader
            badge={c.introBadge}
            title={c.introTitle}
            subtitle={c.introSubtitle}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {c.pillars.map((pillar, index) => (
              <ClinicalCard key={index} accent={index === 1 ? 'teal' : 'navy'}>
                <div className="space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#F0F5FA] text-[#12304A] flex items-center justify-center font-bold">
                    {index === 0 ? (
                      <FileSearch className="w-5 h-5 text-[#0D9488]" />
                    ) : index === 1 ? (
                      <Activity className="w-5 h-5 text-[#0D9488]" />
                    ) : (
                      <Stethoscope className="w-5 h-5 text-[#0D9488]" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-[#12304A]">{pillar.title}</h3>
                  <p className="text-sm text-[#475569] leading-relaxed">{pillar.desc}</p>
                </div>
              </ClinicalCard>
            ))}
          </div>
        </section>

        {/* DIABETES & CARDIOVASCULAR SCREENING INTRODUCTION */}
        <section className="space-y-6">
          <SectionHeader
            badge={c.screeningBadge}
            title={c.screeningTitle}
            subtitle={c.screeningSubtitle}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Diabetes Card */}
            <ClinicalCard accent="navy" className="flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge tone="info" label={c.diabetesCard.tag} size="sm" />
                  <span className="text-xs font-mono text-[#64748B]">XGBoost · DiaBD · SHAP</span>
                </div>
                <h3 className="text-xl font-bold text-[#12304A]">{c.diabetesCard.title}</h3>
                <p className="text-sm text-[#475569] leading-relaxed">{c.diabetesCard.desc}</p>
                <ul className="space-y-2.5 pt-2">
                  {c.diabetesCard.points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-[#334155]">
                      <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0 mt-1" aria-hidden="true" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap gap-3 pt-6 mt-6 border-t border-[#E2E8F0]">
                <MedicalButton
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/bangladesh')}
                >
                  {c.diabetesCard.primaryBtn}
                </MedicalButton>
                <MedicalButton
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/assessment')}
                >
                  {c.diabetesCard.secondaryBtn}
                </MedicalButton>
              </div>
            </ClinicalCard>

            {/* Cardiovascular Card */}
            <ClinicalCard accent="teal" className="flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge tone="moderate" label={c.cardioCard.tag} size="sm" />
                  <span className="text-xs font-mono text-[#64748B]">Logistic Regression · WHO Chart</span>
                </div>
                <h3 className="text-xl font-bold text-[#12304A]">{c.cardioCard.title}</h3>
                <p className="text-sm text-[#475569] leading-relaxed">{c.cardioCard.desc}</p>
                <ul className="space-y-2.5 pt-2">
                  {c.cardioCard.points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-[#334155]">
                      <HeartPulse className="w-4 h-4 text-[#0D9488] shrink-0 mt-1" aria-hidden="true" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap gap-3 pt-6 mt-6 border-t border-[#E2E8F0]">
                <MedicalButton
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/predict/cardio')}
                >
                  {c.cardioCard.primaryBtn}
                </MedicalButton>
                <MedicalButton
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/bangladesh')}
                >
                  {c.cardioCard.secondaryBtn}
                </MedicalButton>
              </div>
            </ClinicalCard>
          </div>
        </section>

        {/* HOW VITAGUARD WORKS */}
        <section id="how-it-works" className="scroll-mt-20 space-y-6">
          <SectionHeader
            badge={c.howBadge}
            title={c.howTitle}
            subtitle={c.howSubtitle}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {c.steps.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-clinical-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#12304A] text-white font-mono text-sm font-bold">
                    {item.step}
                  </span>
                  <h3 className="text-base font-bold text-[#12304A]">{item.title}</h3>
                  <p className="text-sm text-[#475569] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BANGLADESH-FOCUSED HEALTHCARE AWARENESS */}
        <section className="space-y-6">
          <SectionHeader
            badge={c.bdBadge}
            title={c.bdTitle}
            subtitle={c.bdSubtitle}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {c.bdCards.map((card, i) => (
              <ClinicalCard key={i}>
                <div className="space-y-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#F0FDFA] text-[#0D9488] flex items-center justify-center">
                    {i === 0 ? (
                      <BookOpen className="w-5 h-5" />
                    ) : i === 1 ? (
                      <Activity className="w-5 h-5" />
                    ) : (
                      <Users className="w-5 h-5" />
                    )}
                  </div>
                  <h3 className="text-base font-bold text-[#12304A]">{card.title}</h3>
                  <p className="text-sm text-[#475569] leading-relaxed">{card.desc}</p>
                </div>
              </ClinicalCard>
            ))}
          </div>
        </section>

        {/* CLINICAL TRANSPARENCY & DOCTOR INVOLVEMENT */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ClinicalCard accent="navy">
            <div className="space-y-4">
              <StatusBadge tone="info" size="sm" label={c.transparencyBadge} />
              <h3 className="text-xl font-bold text-[#12304A]">{c.transparencyTitle}</h3>
              <p className="text-sm text-[#475569] leading-relaxed">{c.transparencyBody}</p>
              <div className="pt-2">
                <MedicalButton
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/evaluation')}
                >
                  {c.transparencyBtn} →
                </MedicalButton>
              </div>
            </div>
          </ClinicalCard>

          <ClinicalCard accent="teal">
            <div className="space-y-4">
              <StatusBadge tone="low" size="sm" label={c.doctorBadge} />
              <h3 className="text-xl font-bold text-[#12304A]">{c.doctorTitle}</h3>
              <p className="text-sm text-[#475569] leading-relaxed">{c.doctorBody}</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <MedicalButton
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/notices')}
                >
                  {lang === 'bn' ? 'ডাক্তারদের স্বাস্থ্য নোটিশ দেখুন' : 'View Doctor Health Notices'}
                </MedicalButton>
                {!isLoggedIn && (
                  <MedicalButton
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/login')}
                  >
                    {lang === 'bn' ? 'ডাক্তার / রোগী সাইন ইন' : 'Patient / Doctor Sign In'}
                  </MedicalButton>
                )}
              </div>
            </div>
          </ClinicalCard>
        </section>

        {/* PRIVACY & SAFETY INFORMATION */}
        <section className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-clinical-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0F5FA] text-[#12304A] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-[#0D9488]" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">
                {c.privacyBadge}
              </span>
              <h2 className="text-xl font-bold text-[#12304A]">{c.privacyTitle}</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {c.privacyItems.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#F6F9FC] border border-[#E2E8F0] flex items-start gap-3"
              >
                <AlertTriangle className="w-4 h-4 text-[#0D9488] shrink-0 mt-1" aria-hidden="true" />
                <p className="text-sm text-[#334155] leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* INTERACTIVE FAQ */}
        <section className="space-y-6">
          <SectionHeader badge={c.faqBadge} title={c.faqTitle} />
          <div className="space-y-3">
            {c.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-clinical-xs"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-[#F6F9FC] transition cursor-pointer"
                  >
                    <span className="text-base font-bold text-[#12304A]">{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#64748B] shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 text-[#0D9488]' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-sm text-[#475569] leading-relaxed border-t border-[#F1F5F9]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* BOTTOM CTA BANNER */}
        <section className="bg-[#12304A] text-white rounded-2xl p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-2xl font-bold text-white">
              {lang === 'bn'
                ? 'প্রস্তুত থাকলে আপনার প্রাথমিক স্বাস্থ্য মূল্যায়ন শুরু করুন'
                : 'Ready to organize your health measurements?'}
            </h2>
            <p className="text-sm text-slate-200 leading-relaxed">
              {lang === 'bn'
                ? 'মাত্র কয়েক মিনিটে ধাপে ধাপে আপনার তথ্য দিন এবং ব্যাখ্যাযোগ্য স্ক্রিনিং ফলাফল দেখুন।'
                : 'Complete a guided 5-step screening assessment or explore our health education hub.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <MedicalButton
              variant="secondary"
              size="md"
              onClick={() => navigate('/assessment')}
            >
              {c.primaryCta}
            </MedicalButton>
            <MedicalButton
              variant="outline"
              size="md"
              onClick={() => navigate('/awareness')}
              className="!bg-white/10 !text-white !border-white/25 hover:!bg-white/20"
            >
              {lang === 'bn' ? 'স্বাস্থ্য শিক্ষা কেন্দ্র' : 'Health Education Hub'}
            </MedicalButton>
          </div>
        </section>
      </PageContainer>
    </div>
  );
}

export default Home;
