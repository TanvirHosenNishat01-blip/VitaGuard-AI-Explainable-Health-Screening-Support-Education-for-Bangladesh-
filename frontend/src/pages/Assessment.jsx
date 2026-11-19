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
            <p className="text-sm text-[#475569]">
              {isBn
                ? 'বাংলাদেশের স্ক্রিনিং টেবিলের তথ্য দিয়ে একটি ক্যালিব্রেট না করা স্ক্রিনিং সূচক দেখে। লোকাল TreeSHAP দেখায় কোন ইনপুট সেই সূচকে যোগ করেছে। এটি রোগ নির্ণয় বা ল্যাব পরীক্ষার বদলি নয়।'
                : 'Uses the Bangladesh screening table to show an uncalibrated screening index. Local TreeSHAP shows which entered values contributed to that index. It is not a diagnosis and not a laboratory test.'}
            </p>
            <p className="text-xs text-[#64748B]">{text(ROWS[0].inputs)}</p>
          </div>
          <div className="pt-6">
            <MedicalButton fullWidth onClick={() => navigate('/bangladesh')} rightIcon={<ArrowRight className="w-4 h-4" />}>
              {isBn ? 'DiaBD স্ক্রিনিং খুলুন' : 'Open the DiaBD screening'}
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
            <p className="text-sm text-[#475569]">
              {isBn
                ? 'এটি রাখা হয়েছে কারণ DiaBD গ্লুকোজ, ইনসুলিন, স্কিন থিকনেস, গর্ভধারণের সংখ্যা বা পেডিগ্রি স্কোর নেয় না। এই আটটি সংখ্যা আগে থেকে থাকলে বিদ্যমান মডেল সেগুলো পড়ে। ফল একটি গবেষণা-টেবিলের স্ক্রিনিং অনুমান।'
                : 'It stays because DiaBD does not use glucose, insulin, skin thickness, pregnancy count, or the pedigree score. When those eight numbers are already in hand, the existing model can read them. The result is a research-table screening estimate.'}
            </p>
            <p className="text-xs text-[#92400E]">
              {isBn
                ? 'সীমা: ফিনিক্সের কাছে পিমা জনগোষ্ঠীর ৭৬৮ জন নারী, বয়স ২১ থেকে ৮১। পুরুষ, শিশু বা বাংলাদেশের রোগীর মডেল নয়। রোগ নির্ণয় নয়।'
                : 'Limit: 768 Pima women near Phoenix, aged 21 to 81. Not a model for men, children, or patients in Bangladesh. Not a diagnosis.'}
            </p>
          </div>
          <div className="pt-6">
            <MedicalButton variant="outline" fullWidth onClick={() => navigate('/predict/diabetes')} rightIcon={<ArrowRight className="w-4 h-4" />}>
              {isBn ? 'পিমা স্ক্রিনিং শুরু করুন' : 'Start the Pima screening'}
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
            <p className="text-sm text-[#475569]">
              {isBn
                ? 'ক্লিভল্যান্ডের পুরোনো ক্যাথেটারাইজেশন দলের মডেল। সাধারণ জনগোষ্ঠীর স্ক্রিনিং হিসেবে যাচাই করা হয়নি। ফল হৃদরোগের রোগ নির্ণয় নয়। ব্যাখ্যা গ্লোবাল সহগ, ব্যক্তিগত SHAP নয়।'
                : 'A model from the historical Cleveland catheterization cohort. It is not validated here as general community screening. The result is not a heart-disease diagnosis. The explanation is global coefficients, not a personal SHAP chart.'}
            </p>
            <p className="text-xs text-[#64748B]">{text(ROWS[2].inputs)}</p>
          </div>
          <div className="pt-6">
            <MedicalButton variant="secondary" fullWidth onClick={() => navigate('/predict/cardio')} rightIcon={<ArrowRight className="w-4 h-4" />}>
              {isBn ? 'ক্লিভল্যান্ড অনুমান খুলুন' : 'Open the Cleveland estimate'}
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
            <p className="text-sm text-[#475569]">
              {isBn
                ? 'প্রকাশিত WHO দক্ষিণ এশিয়া নন-ল্যাবরেটরি চার্টের একটি ঘর। এটি প্রশিক্ষিত মডেল নয়। বয়স ৪০ থেকে ৭৪। আগের হার্ট অ্যাটাক বা স্ট্রোক থাকলে চার্ট চলে না।'
                : 'One cell from the published WHO South Asia non-laboratory chart. It is not a trained model. The age range is 40 to 74. A previous heart attack or stroke stops the lookup.'}
            </p>
            <p className="text-xs text-[#64748B]">{text(ROWS[3].inputs)}</p>
          </div>
          <div className="pt-6">
            <MedicalButton variant="outline" fullWidth onClick={() => navigate('/bangladesh')} rightIcon={<ArrowRight className="w-4 h-4" />}>
              {isBn ? 'চার্ট খুলুন' : 'Open the chart'}
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
