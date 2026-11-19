import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, HeartPulse, Globe2, ArrowRight, BookOpen } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import PageContainer from '../components/ui/PageContainer';
import SectionHeader from '../components/ui/SectionHeader';
import ClinicalCard from '../components/ui/ClinicalCard';
import StatusBadge from '../components/ui/StatusBadge';
import MedicalButton from '../components/ui/MedicalButton';

const ROWS = [
  {
    name: ['Bangladesh DiaBD', 'বাংলাদেশ DiaBD'],
    context: ['Bangladesh screening table', 'বাংলাদেশ স্ক্রিনিং টেবিল'],
    inputs: ['Age, sex, BMI, blood pressure, family history', 'বয়স, লিঙ্গ, বিএমআই, রক্তচাপ, পারিবারিক ইতিহাস'],
    output: ['Uncalibrated screening index', 'ক্যালিব্রেট না করা স্ক্রিনিং সূচক'],
    explain: ['Local TreeSHAP', 'লোকাল TreeSHAP'],
    access: ['Open. Result is not saved.', 'খোলা। ফল সেভ হয় না।'],
  },
  {
    name: ['Pima research table', 'পিমা গবেষণা টেবিল'],
    context: ['Historical cohort of women, ages 21–81', 'ঐতিহাসিক নারী দল, বয়স ২১–৮১'],
    inputs: ['Eight research-table measurements', 'গবেষণা টেবিলের আটটি পরিমাপ'],
    output: ['Existing model score', 'আগের মডেল স্কোর'],
    explain: ['Not a personal explanation', 'ব্যক্তিগত ব্যাখ্যা নয়'],
    access: ['Open, with the cohort limit on screen.', 'খোলা, কোহর্ট সীমা স্ক্রিনে থাকে।'],
  },
  {
    name: ['Cleveland heart estimate', 'ক্লিভল্যান্ড হৃদযন্ত্র অনুমান'],
    context: ['Historical catheterization cohort', 'ঐতিহাসিক ক্যাথেটারাইজেশন দল'],
    inputs: ['13 coded clinic measurements', '১৩টি কোড করা ক্লিনিক পরিমাপ'],
    output: ['Historical model score', 'ঐতিহাসিক মডেল স্কোর'],
    explain: ['Global coefficients', 'গ্লোবাল সহগ'],
    access: ['Open. A signed-in result can be saved.', 'খোলা। সাইন-ইন করলে ফল সেভ হতে পারে।'],
  },
  {
    name: ['WHO South Asia chart', 'WHO দক্ষিণ এশিয়া চার্ট'],
    context: ['Published non-laboratory chart, ages 40–74', 'প্রকাশিত নন-ল্যাবরেটরি চার্ট, বয়স ৪০–৭৪'],
    inputs: ['Age, sex, smoking, systolic pressure, BMI', 'বয়স, লিঙ্গ, ধূমপান, সিস্টোলিক চাপ, বিএমআই'],
    output: ['Chart cell', 'চার্টের ঘর'],
    explain: ['Lookup, not a model', 'খোঁজ, মডেল নয়'],
    access: ['Open. A prior heart attack or stroke is refused.', 'খোলা। আগের হার্ট অ্যাটাক বা স্ট্রোক নিলে চলবে না।'],
  },
];

function Assessment() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isBn = lang === 'bn';
  const text = (pair) => pair[isBn ? 1 : 0];

  return (
    <PageContainer className="space-y-8 py-8 sm:py-12">
      <SectionHeader
        badge={isBn ? 'চারটি আলাদা পথ' : 'Four separate pathways'}
        title={isBn ? 'কোন স্ক্রিনিংটি আপনি দেখছেন?' : 'Which screening are you looking at?'}
        subtitle={
          isBn
            ? 'প্রতিটি পথ আলাদা তথ্য ব্যবহার করে এবং আলাদা ধরনের ফল দেয়। একটি আরেকটির বদলি নয়।'
            : 'Each pathway uses different information and returns a different kind of result. One does not replace another.'
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClinicalCard accent="teal" className="flex flex-col justify-between">
          <div className="space-y-3">
            <StatusBadge tone="low" size="sm" label={isBn ? 'রোগীর জন্য খোলা' : 'Open to patients'} />
            <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] text-[#0D9488] flex items-center justify-center">
              <Globe2 className="w-6 h-6" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-[#12304A]">{text(ROWS[0].name)}</h2>
            <p className="text-sm font-semibold text-[#12304A]">{isBn ? 'এই পথ যা দেয়' : 'What this pathway offers'}</p>
            <ul className="text-sm text-[#475569] list-disc pl-5 space-y-1">
              <li>{isBn ? 'বাংলাদেশের একটি ক্লিনিক্যাল টেবিল ব্যবহার করে।' : 'Uses a Bangladesh-focused clinical table.'}</li>
              <li>{isBn ? 'লোকাল TreeSHAP দেখায় কোন ইনপুট সূচকে যোগ করেছে।' : 'Local TreeSHAP shows which inputs contributed to the index.'}</li>
              <li>{isBn ? 'একজন যোগ্য চিকিৎসকের সাথে আলোচনার আগে একটি প্রাথমিক স্ক্রিনিং দেখা যায়।' : 'A person can look at a preliminary screening result before talking with a qualified clinician.'}</li>
            </ul>
            <p className="text-sm font-semibold text-[#92400E]">{isBn ? 'গুরুত্বপূর্ণ সীমা' : 'Important limitations'}</p>
            <ul className="text-sm text-[#475569] list-disc pl-5 space-y-1">
              <li>{isBn ? 'পরীক্ষামূলক স্ক্রিনিং সহায়তা, রোগ নির্ণয় নয়।' : 'Experimental screening support, not a diagnosis.'}</li>
              <li>{isBn ? 'লক করা টেস্টে প্রিসিশন ০.১১৫৯, ভুল অ্যালার্ম ২৯০, মিস ২৭। কাটঅফ ০.৫১।' : 'Locked-test precision is 0.1159, with 290 false positives and 27 misses. Cutoff 0.51.'}</li>
              <li>{isBn ? '২১–৪০ বছরের কম রিকল ট্রেনিং আউট-অব-ফোল্ড বিশ্লেষণ, লক করা টেস্টের উপদল নয়।' : 'The lower recall around ages 21–40 is a training out-of-fold finding, not a locked-test subgroup result.'}</li>
              <li>{isBn ? 'স্যাম্পলিং ফ্রেম ও সাইট-ভিত্তিক উৎস স্বাধীনভাবে যাচাই হয়নি।' : 'Sampling frame and site-level provenance have not been independently verified.'}</li>
            </ul>
          </div>
          <div className="pt-6">
            <MedicalButton fullWidth onClick={() => navigate('/bangladesh')} rightIcon={<ArrowRight className="w-4 h-4" />}>
              {isBn ? 'বাংলাদেশ-কেন্দ্রিক স্ক্রিনিং দেখুন' : 'Explore Bangladesh-focused screening'}
            </MedicalButton>
          </div>
        </ClinicalCard>

        <ClinicalCard className="flex flex-col justify-between">
          <div className="space-y-3">
            <StatusBadge tone="info" size="sm" label={isBn ? '৮টি পরিমাপ · খোলা' : '8 measurements · open'} />
            <div className="w-12 h-12 rounded-xl bg-[#F0F5FA] text-[#12304A] flex items-center justify-center">
              <Activity className="w-6 h-6" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-[#12304A]">{text(ROWS[1].name)}</h2>
            <p className="text-sm font-semibold text-[#12304A]">{isBn ? 'এই পথ যা দেয়' : 'What this pathway offers'}</p>
            <ul className="text-sm text-[#475569] list-disc pl-5 space-y-1">
              <li>{isBn ? 'ঐতিহাসিকভাবে পড়া একটি ডায়াবেটিস গবেষণা দল দেখা যায়।' : 'A historically studied diabetes research cohort can be explored.'}</li>
              <li>{isBn ? 'DiaBD যে আটটি পরিমাপ নেয় না, এই পথ সেগুলো আলাদা রাখে।' : 'It keeps the eight measurements DiaBD does not use on a separate pathway.'}</li>
            </ul>
            <p className="text-sm font-semibold text-[#92400E]">{isBn ? 'গুরুত্বপূর্ণ সীমা' : 'Important limitations'}</p>
            <ul className="text-sm text-[#475569] list-disc pl-5 space-y-1">
              <li>{isBn ? 'ফিনিক্স এলাকার ঐতিহাসিক গবেষণার নারী, বয়স ২১–৮১। বাংলাদেশের সাধারণ জনগোষ্ঠী নয়।' : 'Historical Phoenix-area women, ages 21–81. Not the general Bangladesh population.'}</li>
              <li>{isBn ? 'রোগ নির্ণয় নয়। রোগীর পথে সম্মতি লাগে।' : 'Not a diagnosis. Patient access needs consent.'}</li>
              <li>{isBn ? '৮৭.৬৬ শতাংশ বৈধ ফল নয়। লিকেজ-মুক্ত লজিস্টিক OOF PR-AUC ০.৭১৬৬, Brier ০.১৬২৭।' : '87.66 percent is not a valid result. Leakage-free logistic OOF PR-AUC is 0.7166, Brier score 0.1627.'}</li>
            </ul>
          </div>
          <div className="pt-6">
            <MedicalButton variant="outline" fullWidth onClick={() => navigate('/predict/diabetes')} rightIcon={<ArrowRight className="w-4 h-4" />}>
              {isBn ? 'পিমা গবেষণা পথ দেখুন' : 'Explore the Pima research pathway'}
            </MedicalButton>
          </div>
        </ClinicalCard>

        <ClinicalCard accent="navy" className="flex flex-col justify-between">
          <div className="space-y-3">
            <StatusBadge tone="moderate" size="sm" label={isBn ? 'ঐতিহাসিক দল' : 'Historical cohort'} />
            <div className="w-12 h-12 rounded-xl bg-[#F0F5FA] text-[#12304A] flex items-center justify-center">
              <HeartPulse className="w-6 h-6" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-[#12304A]">{text(ROWS[2].name)}</h2>
            <p className="text-sm font-semibold text-[#12304A]">{isBn ? 'এই পথ যা দেয়' : 'What this pathway offers'}</p>
            <ul className="text-sm text-[#475569] list-disc pl-5 space-y-1">
              <li>{isBn ? 'হৃদযন্ত্রের গবেষণা ডায়াবেটিস পথ থেকে আলাদা।' : 'Cardiovascular research stays separate from the diabetes pathways.'}</li>
              <li>{isBn ? 'ঐতিহাসিক ক্লিভল্যান্ড দলের ক্লিনিক্যাল চলক ব্যবহার করে।' : 'It uses clinical variables from the historical Cleveland cohort.'}</li>
            </ul>
            <p className="text-sm font-semibold text-[#92400E]">{isBn ? 'গুরুত্বপূর্ণ সীমা' : 'Important limitations'}</p>
            <ul className="text-sm text-[#475569] list-disc pl-5 space-y-1">
              <li>{isBn ? '১৯৮৪ সালের ক্যাথেটারাইজেশন দল। ২৯৭ সারি, লক করা টেস্ট ৬০ সারি।' : 'A 1984 catheterization cohort. 297 rows, and a 60-row locked test.'}</li>
              <li>{isBn ? 'সেই ৬০ সারিতে অ্যাকুরেসি ০.৯১৬৭। সাধারণ জনগোষ্ঠীর স্ক্রিনিং নয়। রোগ নির্ণয় নয়।' : 'Accuracy 0.9167 is that 60-row test. Not general-population screening and not a diagnosis.'}</li>
            </ul>
          </div>
          <div className="pt-6">
            <MedicalButton variant="secondary" fullWidth onClick={() => navigate('/predict/cardio')} rightIcon={<ArrowRight className="w-4 h-4" />}>
              {isBn ? 'হৃদযন্ত্র গবেষণা মূল্যায়ন দেখুন' : 'Explore cardiovascular research assessment'}
            </MedicalButton>
          </div>
        </ClinicalCard>

        <ClinicalCard className="flex flex-col justify-between">
          <div className="space-y-3">
            <StatusBadge tone="low" size="sm" label={isBn ? 'চার্ট খোঁজ · ৪০–৭৪' : 'Chart lookup · ages 40–74'} />
            <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] text-[#0D9488] flex items-center justify-center">
              <BookOpen className="w-6 h-6" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-[#12304A]">{text(ROWS[3].name)}</h2>
            <p className="text-sm font-semibold text-[#12304A]">{isBn ? 'এই পথ যা দেয়' : 'What this pathway offers'}</p>
            <ul className="text-sm text-[#475569] list-disc pl-5 space-y-1">
              <li>{isBn ? 'প্রকাশিত WHO দক্ষিণ এশিয়া ঝুঁকি চার্ট ব্যবহার করে।' : 'Uses a published WHO South Asia risk chart.'}</li>
              <li>{isBn ? 'নতুন প্রশিক্ষিত মডেলের বদলে একটি স্বচ্ছ খোঁজ।' : 'A transparent lookup, rather than a newly trained model.'}</li>
            </ul>
            <p className="text-sm font-semibold text-[#92400E]">{isBn ? 'গুরুত্বপূর্ণ সীমা' : 'Important limitations'}</p>
            <ul className="text-sm text-[#475569] list-disc pl-5 space-y-1">
              <li>{isBn ? 'বয়স ৪০–৭৪। ৩৯ ও ৭৫ এই সীমার বাইরে।' : 'Ages 40–74. Ages 39 and 75 do not resolve.'}</li>
              <li>{isBn ? 'এটি খোঁজ, প্রশিক্ষিত মডেল নয়। চার্টের সংখ্যা রোগ নির্ণয় নয়। টেবিল মিল অ্যাকুরেসি নয়।' : 'It is a lookup, not a trained model. A chart number is not a diagnosis. Table consistency is not accuracy.'}</li>
            </ul>
          </div>
          <div className="pt-6">
            <MedicalButton variant="outline" fullWidth onClick={() => navigate('/bangladesh')} rightIcon={<ArrowRight className="w-4 h-4" />}>
              {isBn ? 'WHO ঝুঁকি চার্ট দেখুন' : 'Explore the WHO risk chart'}
            </MedicalButton>
          </div>
        </ClinicalCard>
      </div>

      <ClinicalCard title={isBn ? 'পাশাপাশি তুলনা' : 'Side-by-side comparison'}>
        <p className="text-sm text-[#475569] mb-4">
          {isBn
            ? 'এই তালিকা কোন পথ বেছে নেবে তা বলে না। এটি দেখায় প্রতিটি পথ কী করে।'
            : 'This table does not choose a pathway for you. It shows what each one does.'}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-[#64748B]">
                <th className="py-2 pr-3">{isBn ? 'পথ' : 'Pathway'}</th>
                <th className="py-2 pr-3">{isBn ? 'প্রসঙ্গ' : 'Context'}</th>
                <th className="py-2 pr-3">{isBn ? 'ফল' : 'Output'}</th>
                <th className="py-2 pr-3">{isBn ? 'ব্যাখ্যা' : 'Explanation'}</th>
                <th className="py-2">{isBn ? 'রোগী' : 'Patients'}</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.name[0]} className="border-t border-[#E2E8F0] align-top">
                  <td className="py-3 pr-3 font-semibold text-[#12304A]">{text(row.name)}</td>
                  <td className="py-3 pr-3 text-[#475569]">{text(row.context)}</td>
                  <td className="py-3 pr-3 text-[#475569]">{text(row.output)}</td>
                  <td className="py-3 pr-3 text-[#475569]">{text(row.explain)}</td>
                  <td className="py-3 text-[#475569]">{text(row.access)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link className="inline-block mt-4 text-sm text-[#0E7490]" to="/knowledge/articles/screening-not-diagnosis">
          {isBn ? 'স্ক্রিনিং ও রোগ নির্ণয়ের পার্থক্য পড়ুন' : 'Read how screening differs from a diagnosis'}
        </Link>
      </ClinicalCard>
    </PageContainer>
  );
}

export default Assessment;
