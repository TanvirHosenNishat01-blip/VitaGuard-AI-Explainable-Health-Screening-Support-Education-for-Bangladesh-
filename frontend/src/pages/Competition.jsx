import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ClipboardCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import PageContainer from '../components/ui/PageContainer';
import ClinicalCard from '../components/ui/ClinicalCard';
import AlertBanner from '../components/ui/AlertBanner';

const LINKS = [
  ['/presentation', 'Introduction', 'ভূমিকা'],
  ['/architecture', 'Architecture', 'আর্কিটেকচার'],
  ['/security', 'Security', 'নিরাপত্তা'],
  ['/data', 'Data', 'ডেটা'],
  ['/governance', 'Governance', 'গভর্নেন্স'],
  ['/audit', 'Audit', 'অডিট'],
  ['/pitchdeck', 'Pitch', 'পিচ'],
  ['/app', 'Walkthrough', 'ওয়াকথ্রু'],
];

const COPY = {
  '/presentation': {
    title: ['Project introduction', 'প্রকল্পের ভূমিকা'],
    blocks: [
      ['Problem', 'সমস্যা', 'People need a clear way to see what a screening score is, where it came from, and what it cannot decide. This project is a local screening-support and health-education workspace for that conversation.'],
      ['PredictRx', 'প্রেডিক্টআরএক্স', 'Four existing pathways stay separate: Bangladesh DiaBD, a Pima research-table screening with a stated cohort limit, a Cleveland historical model, and a WHO South Asia chart lookup. None of them is a diagnosis or a prescription.'],
      ['Three roles', 'তিন ভূমিকা', 'A patient can review a journey, appointments, notices, and the simulated blood page. A doctor sees only the access the care rule allows. An admin reviews accounts, notices, and AI governance. Admin approval is not a government credential check.'],
      ['Limitations', 'সীমা', 'NOT SUBMITTED. NOT APPROVED. NO RECRUITMENT AUTHORIZED. No BMRC or DGHS approval, no hospital deployment, and no claim of real-world clinical effectiveness.'],
    ],
  },
  '/architecture': {
    title: ['Technical architecture', 'টেকনিক্যাল আর্কিটেকচার'],
    blocks: [
      ['Clients', 'ক্লায়েন্ট', 'React 18, Vite 5, React Router 6, and Tailwind render the pages. The browser calls the local FastAPI service.'],
      ['API', 'এপিআই', 'FastAPI, SQLAlchemy, and SQLite. JWT is HS256 with issuer and audience checks. The prediction routes are separate from knowledge search.'],
      ['Intelligence', 'ইন্টেলিজেন্স', 'Knowledge search is lexical overlap over project notes. The graph is an in-process map with a source on each edge. Embeddings are not installed.'],
      ['Data flow', 'ডেটা প্রবাহ', 'A signed-in screening can store a consent row and, on the older prediction routes, a screening row. Knowledge search does not read patient rows.'],
    ],
  },
  '/security': {
    title: ['Security and privacy', 'নিরাপত্তা ও গোপনীয়তা'],
    blocks: [
      ['Authentication', 'অথেন্টিকেশন', 'Passwords are hashed with bcrypt. Tokens expire and are checked for signature, issuer, audience, and the HS256 algorithm. The signing secret comes from the environment. Admin login requires an enrolled authenticator.'],
      ['Authorization', 'অথরাইজেশন', 'A doctor reads a patient chart only after a confirmed appointment or an existing guideline from that doctor. Pending, rejected, cancelled, and completed visits do not open that access. Messages follow the same pair rule. Notifications stay on the signed-in account.'],
      ['What this phase added', 'এই ধাপে যা যোগ হয়েছে', 'API responses now send nosniff, frame denial, a referrer policy, a locked-down content security policy, and no-store caching. HSTS is not set on local HTTP.'],
      ['Still open', 'এখনো খোলা', 'Field encryption is not implemented. Login rate limiting is not implemented. A live isolated demo account is not implemented, because signing in would write the production database.'],
    ],
  },
  '/data': {
    title: ['Datasets and lineage', 'ডেটাসেট ও লাইনেজ'],
    blocks: [
      ['DiaBD', 'ডায়াবিডি', 'Used for the Bangladesh screening score. The data card marks the external license NOT VERIFIED. The score is an uncalibrated screening index, not a personal probability.'],
      ['Pima', 'পিমা', 'A Native American community dataset of women aged 21 to 81. The screening estimate is not a diagnosis, and it is not a model for men, children, or patients in Bangladesh. Redistribution is NOT VERIFIED.'],
      ['Cleveland', 'ক্লিভল্যান্ড', 'A 1984 catheterization cohort. Global coefficients are not an individual explanation. It is not general-population screening. License NOT VERIFIED.'],
      ['WHO chart', 'ডব্লিউএইচও চার্ট', 'A deterministic lookup for ages 40 to 74. It is not a trained model. Chart-value redistribution is NOT VERIFIED, so the publication text is not copied into the knowledge index.'],
    ],
  },
  '/governance': {
    title: ['Responsible AI', 'দায়িত্বশীল এআই'],
    blocks: [
      ['Status', 'অবস্থা', 'NOT SUBMITTED. NOT APPROVED. NO RECRUITMENT AUTHORIZED. An admin screen is not regulatory approval and not clinical approval.'],
      ['Explainability', 'ব্যাখ্যা', 'DiaBD uses the existing local TreeSHAP. Cleveland shows global coefficients only. The WHO pathway explains a lookup. Pima shows the existing model output with the cohort limit on screen. A feature contribution is not a cause.'],
      ['Fairness', 'ন্যায্যতা', 'The fairness page copies the historical DiaBD evaluation file already in the repository. Subgroup gaps are suppressed because no approved subgroup ground truth is available. Synthetic fairness results are not mixed with that file.'],
      ['Knowledge', 'জ্ঞান', 'Answers are quoted project passages. If the notes do not cover a question, the answer is empty. Retrieved text is treated as untrusted data.'],
    ],
  },
  '/audit': {
    title: ['Evidence and open issues', 'প্রমাণ ও খোলা বিষয়'],
    blocks: [
      ['Tests', 'টেস্ট', 'Phase A, B, C, D, and E pass when each file runs in its own process. A combined process is not a valid result because the tests replace one shared database dependency.'],
      ['Artifacts', 'আর্টিফ্যাক্ট', 'Nine named model files are checked by SHA-256 against ML_ARTIFACT_BASELINE.json. This phase does not change those files.'],
      ['Recorded DiaBD checks', 'রেকর্ড করা ডায়াবিডি পরীক্ষা', 'The compatibility note records 66.5, 44.1, and 9.5 for three synthetic profiles. Those checks are repeated in the Phase F test. They are not a new clinical study.'],
      ['Open issues', 'খোলা বিষয়', 'The API process on port 8000 was started before the newer routes, so the browser can show Not Found until it is restarted. Production blood rows are marked demo and their origin is not proven synthetic. Home-page deletion wording can still overclaim complete erasure. Encryption and public deployment remain blocked.'],
    ],
  },
  '/app': {
    title: ['Synthetic walkthrough', 'সিন্থেটিক ওয়াকথ্রু'],
    blocks: [
      ['How to use this', 'কীভাবে দেখবেন', 'This page does not create a user, does not sign in, and does not read production records. Role links below are narrated steps, not live accounts.'],
      ['Public pages', 'পাবলিক পাতা', 'Knowledge search, the graph, explainability, fairness, and the evaluation page are the safe public stops. They do not require an account.'],
      ['Narrated roles', 'বর্ণিত ভূমিকা', 'The patient, doctor, and admin pages describe the workflow. They do not contain a password, a token, or a real registration number.'],
      ['Blood and messages', 'ব্লাড ও বার্তা', 'The live blood page reads the local database. It is not used as the isolated demo. Messages require a real signed-in pair and are outside this walkthrough.'],
    ],
  },
  '/demo-user': {
    title: ['Patient story, not a login', 'রোগীর গল্প, লগইন নয়'],
    blocks: [
      ['Registration', 'নিবন্ধন', 'A competition narrator can describe registration. This page does not submit the registration form.'],
      ['Consent', 'সম্মতি', 'A screening estimate requires the consent checkbox. Withdrawal blocks the next estimate until a new agreement. The consent row stores pathway, version, language, and time.'],
      ['Explanation', 'ব্যাখ্যা', 'The result is a screening score. DiaBD is uncalibrated. It is not a diagnosis and not a dose.'],
      ['Next public stop', 'পরের পাবলিক ধাপ', 'Open the knowledge hub to ask an educational question such as how screening differs from diagnosis.'],
    ],
  },
  '/demo-doctor': {
    title: ['Doctor story, not a login', 'চিকিৎসকের গল্প, লগইন নয়'],
    blocks: [
      ['Verification', 'যাচাই', 'An admin can mark a typed registration number as reviewed. That review is not an independent BMDC or government check.'],
      ['Access', 'অ্যাক্সেস', 'Chart access starts only from a confirmed appointment or a guideline that doctor already wrote. A pending request does not open the chart.'],
      ['Messages', 'বার্তা', 'Coordination text is for the paired accounts only. It is not an emergency service and it is not a prescription channel.'],
      ['Inbox', 'ইনবক্স', 'This page does not open a real inbox.'],
    ],
  },
  '/demo-admin': {
    title: ['Admin story, not a bypass', 'অ্যাডমিন গল্প, বাইপাস নয়'],
    blocks: [
      ['No bypass', 'কোনো বাইপাস নেই', 'There is no demo admin password on this page. The real admin route still requires a token and an authenticator at login.'],
      ['Review', 'রিভিউ', 'The admin workspace can list doctor applications, privacy requests, audit rows, and the AI governance registry.'],
      ['AI registry', 'এআই রেজিস্ট্রি', 'The registry shows pathway lineage, dataset license status, and graph provenance. It does not approve the product for clinical use.'],
      ['Production data', 'প্রোডাকশন ডেটা', 'This story does not query patient rows.'],
    ],
  },
  '/pitchdeck': {
    title: ['Pitch deck', 'পিচ ডেক'],
    blocks: [],
  },
};

const BN = {
  Problem: 'একটি স্কোরকে রোগ নির্ণয় মনে হয়, যদি তার উৎস, সীমা এবং মানুষের পর্যালোচনা স্পষ্ট না থাকে। এই প্রকল্প সেই কথোপকথনের জন্য একটি স্থানীয় স্ক্রিনিং-সহায়তা ও স্বাস্থ্যশিক্ষার জায়গা।',
  PredictRx: 'চারটি আগের পথ আলাদা থাকে: বাংলাদেশ ডায়াবিডি, পিমা গবেষণা-টেবিল স্ক্রিনিং যার সীমা লেখা আছে, ক্লিভল্যান্ডের পুরোনো মডেল, এবং ডব্লিউএইচও দক্ষিণ এশিয়া চার্ট। কোনোটিই রোগ নির্ণয় বা প্রেসক্রিপশন নয়।',
  'Three roles': 'রোগী যাত্রা, অ্যাপয়েন্টমেন্ট, নোটিশ এবং সিমুলেটেড ব্লাড পাতা দেখতে পারে। চিকিৎসক কেবল কেয়ার নিয়মে অনুমোদিত তথ্য দেখেন। অ্যাডমিন অ্যাকাউন্ট, নোটিশ এবং এআই গভর্নেন্স দেখেন। অ্যাডমিনের অনুমোদন সরকারি সনদ নয়।',
  Limitations: 'জমা হয়নি। অনুমোদন হয়নি। নিয়োগের অনুমতি নেই। বিএমআরসি বা ডিজিএইচএস অনুমোদন নেই, হাসপাতালে স্থাপন নেই, এবং বাস্তব ক্লিনিক্যাল কার্যকারিতার দাবি নেই।',
  Clients: 'ব্রাউজারে React 18, Vite 5, React Router 6 এবং Tailwind। ব্রাউজার স্থানীয় FastAPI সেবাকে ডাকে।',
  API: 'FastAPI, SQLAlchemy এবং SQLite। JWT হলো HS256, ইস্যুয়ার ও অডিয়েন্স যাচাইসহ। প্রেডিকশন রুট জ্ঞান খোঁজ থেকে আলাদা।',
  Intelligence: 'জ্ঞান খোঁজ প্রকল্পের নথির শব্দ মিল। গ্রাফ একটি ইন-প্রসেস মানচিত্র, প্রতিটি ধারে উৎস আছে। এমবেডিং ইনস্টল করা হয়নি।',
  'Data flow': 'সাইন-ইন করা স্ক্রিনিং একটি সম্মতি সারি রাখতে পারে। পুরোনো প্রেডিকশন রুট স্ক্রিনিং সারিও রাখতে পারে। জ্ঞান খোঁজ রোগীর সারি পড়ে না।',
  Authentication: 'পাসওয়ার্ড bcrypt দিয়ে হ্যাশ হয়। টোকেনের মেয়াদ, স্বাক্ষর, ইস্যুয়ার, অডিয়েন্স এবং HS256 যাচাই হয়। সিক্রেট পরিবেশ থেকে আসে। অ্যাডমিন লগইনে অথেন্টিকেটর লাগে।',
  Authorization: 'চিকিৎসক রোগীর চার্ট দেখেন কেবল নিশ্চিত অ্যাপয়েন্টমেন্ট বা সেই চিকিৎসকের আগের গাইডলাইন থাকলে। অপেক্ষমাণ, প্রত্যাখ্যাত, বাতিল বা শেষ ভিজিট অ্যাক্সেস খোলে না। বার্তা একই জোড়ার নিয়ম মানে। নোটিফিকেশন সাইন-ইন করা অ্যাকাউন্টে থাকে।',
  'What this phase added': 'এপিআই উত্তরে nosniff, ফ্রেম নিষেধ, রেফারার নীতি, কন্টেন্ট সিকিউরিটি পলিসি এবং no-store ক্যাশ যোগ হয়েছে। স্থানীয় HTTP-তে HSTS বসানো হয়নি।',
  'Still open': 'ফিল্ড এনক্রিপশন হয়নি। লগইন রেট লিমিট হয়নি। আলাদা ডেমো অ্যাকাউন্ট হয়নি, কারণ সাইন-ইন প্রোডাকশন ডেটাবেজে লিখবে।',
  DiaBD: 'বাংলাদেশ স্ক্রিনিং স্কোরের জন্য। ডেটা কার্ডে বাইরের লাইসেন্স NOT VERIFIED। স্কোর একটি আনক্যালিব্রেটেড স্ক্রিনিং সূচক, ব্যক্তিগত সম্ভাবনা নয়।',
  Pima: 'একটি নেটিভ আমেরিকান কমিউনিটি ডেটাসেট, ২১ থেকে ৮১ বছরের নারী। স্ক্রিনিং অনুমান রোগ নির্ণয় নয়, এবং এটি পুরুষ, শিশু বা বাংলাদেশের রোগীর মডেল নয়। পুনর্বিতরণ NOT VERIFIED।',
  Cleveland: '১৯৮৪ সালের ক্যাথেটারাইজেশন দল। গ্লোবাল সহগ ব্যক্তিগত ব্যাখ্যা নয়। এটি সাধারণ জনগোষ্ঠীর স্ক্রিনিং নয়। লাইসেন্স NOT VERIFIED।',
  'WHO chart': '৪০ থেকে ৭৪ বছরের জন্য নির্ধারিত খোঁজ। এটি প্রশিক্ষিত মডেল নয়। চার্টের লেখা কপি করা হয়নি, কারণ পুনর্বিতরণ NOT VERIFIED।',
  Status: 'জমা হয়নি। অনুমোদন হয়নি। নিয়োগের অনুমতি নেই। অ্যাডমিন স্ক্রিন নিয়ন্ত্রক অনুমোদন নয় এবং ক্লিনিক্যাল অনুমোদন নয়।',
  Explainability: 'ডায়াবিডিতে আগের লোকাল TreeSHAP। ক্লিভল্যান্ডে শুধু গ্লোবাল সহগ। ডব্লিউএইচও পথ একটি খোঁজ ব্যাখ্যা করে। পিমা আগের মডেল আউটপুট দেখায় এবং পাতায় কোহর্টের সীমা থাকে। ফিচার অবদান কারণ নয়।',
  Fairness: 'ন্যায্যতা পাতা ভান্ডারে থাকা পুরোনো ডায়াবিডি মূল্যায়ন ফাইল দেখায়। উপদলের ফারাক বানানো হয়নি, কারণ অনুমোদিত গ্রাউন্ড ট্রুথ নেই।',
  Knowledge: 'উত্তর প্রকল্পের উদ্ধৃতি। নথিতে না থাকলে উত্তর খালি। আনা লেখা অবিশ্বস্ত ডেটা হিসেবে ধরা হয়।',
  Tests: 'ফেজ এ, বি, সি, ডি এবং ই আলাদা প্রসেসে চললে পাস করে। এক প্রসেসে একসাথে চালানো বৈধ নয়।',
  Artifacts: 'নাম করা নয়টি মডেল ফাইল SHA-256 দিয়ে ML_ARTIFACT_BASELINE.json-এর সাথে মিলানো হয়। এই ধাপ সেই ফাইল বদলায় না।',
  'Recorded DiaBD checks': 'সামঞ্জস্য নথিতে তিনটি সিন্থেটিক প্রোফাইলের স্কোর ৬৬.৫, ৪৪.১ এবং ৯.৫ লেখা আছে। ফেজ এফ সেগুলি আবার দেখে। এটি নতুন ক্লিনিক্যাল গবেষণা নয়।',
  'Open issues': 'পোর্ট ৮০০০-এর এপিআই আগের প্রসেস হলে নতুন রুট Not Found দেখাতে পারে। প্রোডাকশন ব্লাড সারির উৎস সিন্থেটিক বলে প্রমাণিত নয়। এনক্রিপশন ও পাবলিক স্থাপন বন্ধ।',
  'How to use this': 'এই পাতা ব্যবহারকারী তৈরি করে না, সাইন ইন করে না, এবং প্রোডাকশন রেকর্ড পড়ে না। নিচের ভূমিকা বর্ণনা, লাইভ অ্যাকাউন্ট নয়।',
  'Public pages': 'জ্ঞান খোঁজ, গ্রাফ, ব্যাখ্যা, ন্যায্যতা এবং মূল্যায়ন পাতা অ্যাকাউন্ট ছাড়া দেখা যায়।',
  'Narrated roles': 'রোগী, চিকিৎসক এবং অ্যাডমিন পাতা কাজের ধারা বলে। এখানে পাসওয়ার্ড, টোকেন বা আসল নিবন্ধন নম্বর নেই।',
  'Blood and messages': 'লাইভ ব্লাড পাতা স্থানীয় ডেটাবেজ পড়ে। সেটিকে আলাদা ডেমো বানানো হয়নি। বার্তার জন্য সাইন-ইন করা জোড়া লাগে।',
  Registration: 'বর্ণনাকারী নিবন্ধন ব্যাখ্যা করতে পারেন। এই পাতা নিবন্ধন ফর্ম জমা দেয় না।',
  Consent: 'স্ক্রিনিং অনুমানের আগে সম্মতির বক্স লাগে। সম্মতি তুললে নতুন সম্মতির আগে পরের অনুমান বন্ধ থাকে।',
  Explanation: 'ফলাফল একটি স্ক্রিনিং স্কোর। ডায়াবিডি আনক্যালিব্রেটেড। এটি রোগ নির্ণয় নয় এবং ডোজ নয়।',
  'Next public stop': 'স্ক্রিনিং ও রোগ নির্ণয়ের পার্থক্য জিজ্ঞাসা করতে জ্ঞান হাব খুলুন।',
  Verification: 'অ্যাডমিন টাইপ করা নিবন্ধন নম্বর দেখেছেন বলে চিহ্ন দিতে পারেন। এটি স্বাধীন বিএমডিসি বা সরকারি যাচাই নয়।',
  Access: 'চার্ট খোলে কেবল নিশ্চিত অ্যাপয়েন্টমেন্ট বা সেই চিকিৎসকের আগের গাইডলাইন থেকে। অপেক্ষমাণ অনুরোধ চার্ট খোলে না।',
  Messages: 'সমন্বয়ের লেখা শুধু জোড়া অ্যাকাউন্টের। এটি জরুরি সেবা নয় এবং প্রেসক্রিপশন চ্যানেল নয়।',
  Inbox: 'এই পাতা আসল ইনবক্স খোলে না।',
  'No bypass': 'এই পাতায় ডেমো অ্যাডমিন পাসওয়ার্ড নেই। আসল অ্যাডমিন রুটে টোকেন এবং লগইনে অথেন্টিকেটর লাগে।',
  Review: 'অ্যাডমিন ওয়ার্কস্পেসে ডাক্তার আবেদন, গোপনীয়তা অনুরোধ, অডিট সারি এবং এআই গভর্নেন্স রেজিস্ট্রি থাকতে পারে।',
  'AI registry': 'রেজিস্ট্রি পথের লাইনেজ, ডেটাসেট লাইসেন্স এবং গ্রাফের উৎস দেখায়। এটি ক্লিনিক্যাল ব্যবহারের অনুমোদন নয়।',
  'Production data': 'এই গল্প রোগীর সারি পড়ে না।',
};

const SLIDES = [
  ['Title', 'TriNexus | VitaGuard AI. A local screening-support and education workspace. Not a diagnostic service.'],
  ['Problem', 'A score without its source, limit, and human review is easy to misread as a diagnosis.'],
  ['Solution', 'PredictRx keeps four existing pathways and adds explanation, project-note retrieval, and governance labels.'],
  ['Architecture', 'React and Vite in the browser. FastAPI and SQLite on the machine. Prediction stays separate from knowledge search.'],
  ['Three roles', 'Patient, doctor, and admin each have a bounded workspace. Doctor chart access follows the confirmed-appointment rule.'],
  ['Pathways', 'DiaBD screening index, Pima research-table screening with a stated cohort limit, Cleveland historical cohort, WHO chart lookup.'],
  ['Explainable AI', 'Local TreeSHAP only where that explainer already exists. Coefficients and lookups are labeled as what they are.'],
  ['Knowledge', 'Lexical retrieval with citations. A graph of documented limits. No causal medical edges.'],
  ['Responsible AI', 'Historical evaluation stays in its file. Subgroup fairness is not invented. Dataset redistribution remains NOT VERIFIED.'],
  ['Business pathway', 'A later institutional license is only a proposal. No revenue, customer count, or savings figure is claimed.'],
  ['Scale roadmap', 'Bangla and English exist now. A national or international deployment is not built and is not claimed.'],
  ['Privacy and security', 'Consent, username-confirmed deletion, bcrypt, JWT checks, admin authenticator, and response headers. No NRB partnership is on record.'],
  ['Demonstration', 'Public educational pages only. No demo password and no production sign-in during the briefing.'],
  ['Limits', 'Not submitted, not approved, no recruitment. No hospital integration and no claim of clinical effectiveness.'],
  ['Future research', 'Encryption, embedding retrieval, and any external text depend on a later approval and a verified license.'],
  ['Score band', 'The top band means production-grade. This build is a tested local prototype. It does not have measured revenue, millions of users, or a clinical outcome.'],
  ['Close', 'The engineering claim is the tested local system, including the limits written on the screen. Plans are not results.'],
];

function Competition() {
  const { pathname } = useLocation();
  const { lang } = useLanguage();
  const isBn = lang === 'bn';
  const [slide, setSlide] = useState(0);
  const page = COPY[pathname] || COPY['/presentation'];
  const title = page.title[isBn ? 1 : 0];

  return (
    <PageContainer className="space-y-6 py-8">
      <ClinicalCard title={title} subtitle="NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED" icon={ClipboardCheck}>
        <AlertBanner tone="warning" title={isBn ? 'সিন্থেটিক ব্রিফিং' : 'Synthetic briefing'}>
          {isBn
            ? 'এই পাতা অ্যাকাউন্ট তৈরি করে না এবং প্রোডাকশন রেকর্ড পড়ে না।'
            : 'This page does not create an account and does not read production records.'}
        </AlertBanner>
        <nav className="mt-4 flex flex-wrap gap-2" aria-label={isBn ? 'ব্রিফিং' : 'Briefing'}>
          {LINKS.map(([to, en, bn]) => (
            <Link key={to} to={to} className={`rounded-full px-3 py-1 text-xs border ${pathname === to ? 'bg-[#12304A] text-white border-[#12304A]' : 'border-[#E2E8F0] text-[#12304A]'}`}>
              {isBn ? bn : en}
            </Link>
          ))}
        </nav>
      </ClinicalCard>

      {pathname === '/pitchdeck' ? (
        <ClinicalCard title={`${slide + 1} / ${SLIDES.length}. ${SLIDES[slide][0]}`}>
          <p className="text-sm text-[#334155]">{SLIDES[slide][1]}</p>
          {isBn && <p className="text-sm text-[#334155] mt-2">স্লাইডের বাক্য ইংরেজিতে রাখা হয়েছে, কারণ পাওয়ারপয়েন্ট ফাইলটি ইংরেজি।</p>}
          <div className="mt-4 flex gap-2">
            <button type="button" className="rounded-lg border border-[#E2E8F0] px-3 py-1 text-sm" onClick={() => setSlide((value) => Math.max(0, value - 1))}>
              {isBn ? 'আগের' : 'Previous'}
            </button>
            <button type="button" className="rounded-lg border border-[#E2E8F0] px-3 py-1 text-sm" onClick={() => setSlide((value) => Math.min(SLIDES.length - 1, value + 1))}>
              {isBn ? 'পরের' : 'Next'}
            </button>
          </div>
          <p className="text-xs text-[#64748B] mt-3">A PowerPoint copy is in docs/presentation/TriNexus_VitaGuard_AIBC_2026.pptx.</p>
        </ClinicalCard>
      ) : (
        page.blocks.map(([enTitle, bnTitle, body]) => (
          <ClinicalCard key={enTitle} title={isBn ? bnTitle : enTitle}>
            <p className="text-sm text-[#334155] leading-6">{isBn ? (BN[enTitle] || body) : body}</p>
          </ClinicalCard>
        ))
      )}

      {pathname === '/app' && (
        <ClinicalCard title={isBn ? 'পাবলিক স্টপ' : 'Public stops'}>
          <ul className="text-sm space-y-2">
            <li><Link className="text-[#0E7490]" to="/knowledge">Knowledge assistant</Link></li>
            <li><Link className="text-[#0E7490]" to="/knowledge/graph">Knowledge graph</Link></li>
            <li><Link className="text-[#0E7490]" to="/explain">Explainability</Link></li>
            <li><Link className="text-[#0E7490]" to="/fairness">Fairness</Link></li>
            <li><Link className="text-[#0E7490]" to="/demo-user">Patient narrative</Link></li>
            <li><Link className="text-[#0E7490]" to="/demo-doctor">Doctor narrative</Link></li>
            <li><Link className="text-[#0E7490]" to="/demo-admin">Admin narrative</Link></li>
          </ul>
        </ClinicalCard>
      )}
    </PageContainer>
  );
}

export default Competition;
