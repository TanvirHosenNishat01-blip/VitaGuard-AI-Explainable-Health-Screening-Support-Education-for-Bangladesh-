import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useLanguage } from '../context/LanguageContext';

function pct(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return `${(Number(value) * 100).toFixed(1)}%`;
}

function fill(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');
}

function Score({ label, value, detail }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-xl font-extrabold text-slate-900 mt-1">{value}</p>
      {detail && <p className="text-[11px] text-slate-500 mt-1">{detail}</p>}
    </div>
  );
}

function Matrix({ clinical, t }) {
  if (!clinical) return null;
  const cells = [
    { label: t('evalCleared'), value: clinical.true_negative, tone: 'bg-slate-50' },
    { label: t('evalAlarm'), value: clinical.false_alarms, tone: 'bg-amber-50' },
    { label: t('evalMissed'), value: clinical.missed_cases, tone: 'bg-rose-50' },
    { label: t('evalCaught'), value: clinical.true_positive, tone: 'bg-blue-50' },
  ];
  return (
    <div>
      <p className="text-xs text-slate-500 mb-2">{t('evalMatrix')}</p>
      <div className="grid grid-cols-2 gap-2">
        {cells.map((cell) => (
          <div key={cell.label} className={`border border-slate-200 rounded-xl p-3 ${cell.tone}`}>
            <p className="text-[11px] text-slate-600">{cell.label}</p>
            <p className="text-lg font-extrabold text-slate-900">{cell.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModelCard({ title, trainedOn, extra, metrics, clinical, t, precisionLabel }) {
  const interval = clinical?.accuracy_interval_95;
  const sensInterval = clinical?.sensitivity_interval_95;
  const specInterval = clinical?.specificity_interval_95;
  const reading = {
    missed: clinical?.missed_cases,
    positives: clinical?.actual_positive,
    sens: pct(clinical?.sensitivity),
    spec: pct(clinical?.specificity),
    sensLow: pct(sensInterval?.low),
    sensHigh: pct(sensInterval?.high),
    specLow: pct(specInterval?.low),
    specHigh: pct(specInterval?.high),
    n: clinical?.test_rows,
    base: pct(clinical?.majority_baseline_accuracy),
    acc: pct(metrics?.accuracy),
  };
  return (
    <section className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
      <div>
        <h2 className="font-bold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500 mt-1">{`${String(trainedOn || '').trim()}${/[.।!?]$/.test(String(trainedOn || '').trim()) ? ' ' : '. '}${extra}`}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Score label={t('evalSensitivity')} value={pct(clinical?.sensitivity)} detail={`${sensInterval ? `${pct(sensInterval.low)}–${pct(sensInterval.high)}` : ''}`} />
        <Score label={t('evalSpecificity')} value={pct(clinical?.specificity)} detail={`${specInterval ? `${pct(specInterval.low)}–${pct(specInterval.high)}` : ''}`} />
        <Score label={t('evalAuc')} value={metrics?.roc_auc == null ? '—' : Number(metrics.roc_auc).toFixed(4)} detail="0.5–1.0" />
        <Score label={t('evalAccuracy')} value={pct(metrics?.accuracy)} detail={interval ? `${pct(interval.low)}–${pct(interval.high)}` : ''} />
        <Score label={precisionLabel} value={pct(metrics?.precision ?? clinical?.ppv)} detail="" />
      </div>
      <p className="text-sm text-slate-700">{fill(t('evalPatient'), reading)}</p>
      <p className="text-sm text-slate-700">{fill(t('evalDoctor'), reading)}</p>
      <p className="text-sm text-slate-700">{fill(t('evalBaseline'), reading)}</p>
      <Matrix clinical={clinical} t={t} />
    </section>
  );
}

function ModelEvaluation() {
  const { t, lang } = useLanguage();
  const precisionLabel = lang === 'bn' ? 'প্রিসিশন' : 'Precision';
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/api/evaluation')
      .then((res) => setData(res.data))
      .catch(() => setError('Evaluation file could not be loaded.'));
  }, []);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-4">
      <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl space-y-2">
        <h1 className="text-2xl font-extrabold text-slate-900">{t('evaluation')}</h1>
        <p className="text-sm font-semibold text-amber-950">
          {lang === 'bn'
            ? 'সর্বশেষ গবেষণা সিদ্ধান্ত: কোনো নির্ভরযোগ্য প্রোডাকশন উন্নতি প্রতিষ্ঠিত হয়নি। বর্তমান ডেটার সীমা আছে, এবং আরও প্রতিনিধিত্বশীল, যথাযথভাবে অনুমোদিত ডেটা দরকার।'
            : 'Latest research conclusion: No reliable production improvement was established. Current data limitations remain, and additional representative, appropriately approved data is required.'}
        </p>
        <p className="text-sm text-slate-700">
          {lang === 'bn'
            ? 'চারটি পথ একই মাপকাঠিতে তুলনীয় নয়। অ্যাকুরেসি একা ফল বোঝায় না। নিচের সংখ্যা লক করা টেস্ট বা গবেষণা ফোল্ড থেকে, এবং কোনোটিই ক্লিনিক্যাল যাচাই নয়।'
            : 'The four pathways are not comparable on one scale. Accuracy alone does not explain a result. The numbers below are locked-test or research-fold results, and none of them is clinical validation.'}
        </p>
        <p className="text-sm text-amber-900">{t('evalLimit')}</p>
        <p className="text-sm text-slate-700">{t('evalOrigin')}</p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <section className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
        <h2 className="font-bold text-slate-900">{lang === 'bn' ? 'পিমা গবেষণা পথ' : 'Pima research pathway'}</h2>
        <p className="text-sm text-slate-700">
          {lang === 'bn'
            ? 'ঐতিহাসিক টেবিল ৭৬৮ সারি। ৮৭.৬৬% অ্যাকুরেসি বৈধ নয়, কারণ ইনসুলিন লেবেল দিয়ে ভরা হয়েছিল। লিকেজ-মুক্ত লজিস্টিক আউট-অব-ফোল্ড PR-AUC ০.৭১৬৬, Brier স্কোর ০.১৬২৭। এটি স্বাধীন ক্লিনিক্যাল যাচাই নয়। দল: ফিনিক্স এলাকার ঐতিহাসিক গবেষণার নারী, বয়স ২১–৮১। সম্মতি থাকলে রোগীর পথ খোলা।'
            : 'Historical table: 768 records. The 87.66% accuracy is invalid because of label leakage. Leakage-free logistic out-of-fold PR-AUC is 0.7166, and the Brier score is 0.1627. Those are not independent clinical validation. The cohort is historical Phoenix-area women, ages 21–81. Consented patient access is open.'}
        </p>
      </section>
      <section className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
        <h2 className="font-bold text-slate-900">{lang === 'bn' ? 'WHO দক্ষিণ এশিয়া চার্ট' : 'WHO South Asia chart'}</h2>
        <p className="text-sm text-slate-700">
          {lang === 'bn'
            ? 'এটি প্রকাশিত ঝুঁকি চার্টের নির্ধারক খোঁজ, নতুন প্রশিক্ষিত মডেল নয়। বয়স ৪০–৭৪। সর্বশেষ মিল পরীক্ষায় ৭০০টির মধ্যে ৭০০টি ঘর মিলেছে। বয়স ৩৯ ও ৭৫ সীমার বাইরে। টেবিল মিল মডেল অ্যাকুরেসি নয়।'
            : 'This is a deterministic lookup of a published risk chart, not a newly trained model. Ages 40–74. The latest consistency check matched 700 of 700 tested cells. Ages 39 and 75 do not resolve. Table consistency is not model accuracy.'}
        </p>
      </section>
      {data && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ModelCard
              title={`DiaBD · ${data.diabetes.model}`}
              trainedOn={lang === 'bn'
                ? 'পরিষ্কার করা DiaBD সারি, বয়স ২১ থেকে ৮০। প্রকাশিত ডেটা নিবন্ধে ৬৩টি ইউনিয়নের কথা আছে; এই ফাইলে সাইট কলাম নেই। স্যাম্পলিং ফ্রেম ও সাইট-ভিত্তিক উৎস স্বাধীনভাবে যাচাই হয়নি। এটি জাতীয় নমুনা নয় এবং রোগনির্ণয় নয়।'
                : data.diabetes.trained_on}
              extra={lang === 'bn'
                ? `লক করা টেস্ট সারি: ${data.diabetes.clinical.test_rows}। প্রিসিশন ${Number(data.diabetes.test_metrics.precision).toFixed(4)}। ভুল অ্যালার্ম ${data.diabetes.clinical.false_alarms}। মিস হওয়া কেস ${data.diabetes.clinical.missed_cases}। কাটঅফ ${data.diabetes.threshold}। বাংলাদেশ যাচাই: নেই।`
                : `Locked test rows: ${data.diabetes.clinical.test_rows}. Precision ${Number(data.diabetes.test_metrics.precision).toFixed(4)}. False positives ${data.diabetes.clinical.false_alarms}. False negatives ${data.diabetes.clinical.missed_cases}. Cutoff ${data.diabetes.threshold}. Bangladesh validation: no.`}
              metrics={data.diabetes.test_metrics}
              clinical={data.diabetes.clinical}
              t={t}
              precisionLabel={precisionLabel}
            />
            <ModelCard
              title={lang === 'bn' ? `ক্লিভল্যান্ড · ${data.cardio.model}` : `Cleveland · ${data.cardio.model}`}
              trainedOn={lang === 'bn'
                ? 'ঐতিহাসিক ক্যাথেটারাইজেশন দল। সাধারণ জনগোষ্ঠীর স্ক্রিনিং নয়।'
                : `${data.cardio.trained_on}. Historical catheterization cohort, not community screening.`}
              extra={lang === 'bn'
                ? `ট্রেন ${data.cardio.train_rows} / লক করা টেস্ট ${data.cardio.test_rows}। এই কার্ডের অ্যাকুরেসি সেই ${data.cardio.test_rows} সারির টেস্ট। বাংলাদেশ যাচাই: নেই।`
                : `Train ${data.cardio.train_rows} / locked test ${data.cardio.test_rows}. The accuracy on this card is that ${data.cardio.test_rows}-row test. Bangladesh validation: no.`}
              metrics={data.cardio.test_metrics}
              clinical={data.cardio.clinical}
              t={t}
              precisionLabel={precisionLabel}
            />
          </div>
          <section className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <h2 className="font-bold text-slate-900">{lang === 'bn' ? 'DiaBD বয়স ও ভারসাম্য' : 'DiaBD age and imbalance'}</h2>
            <p className="text-sm text-slate-700">
              {lang === 'bn'
                ? 'পরিষ্কার সারি ৫,১১৯, পজিটিভ ৩২৪, প্রায় ৬.৩%। লক করা টেস্ট অ্যাকুরেসি ০.৬৯০৪, প্রিসিশন ০.১১৫৯, রিকল ০.৫৮৪৬, ভুল অ্যালার্ম ২৯০, মিস ২৭, কাটঅফ ০.৫১। কম প্রিসিশনের মানে পজিটিভ স্ক্রিনের পর ফলো-আপ দরকার। ২১–৪০ বছরের ট্রেনিং আউট-অব-ফোল্ড রিকল প্রায় ০.৩২০৮। এটি লক করা টেস্টের উপদল নয়।'
                : 'Clean rows 5,119, positives 324, about 6.3%. Locked-test accuracy 0.6904, precision 0.1159, recall 0.5846, 290 false positives, 27 false negatives, cutoff 0.51. Low precision means a positive screen needs follow-up. Training out-of-fold recall for ages 21–40 is about 0.3208. That is not a locked-test subgroup result.'}
            </p>
            <p className="text-sm text-slate-700">
              {lang === 'bn'
                ? 'ডেটাসেটের স্যাম্পলিং ফ্রেম ও সাইট-ভিত্তিক উৎস স্বাধীনভাবে যাচাই হয়নি। CSV-তে সাইট কলাম নেই।'
                : 'Dataset sampling frame and site-level provenance have not been independently verified. The CSV has no site column.'}
            </p>
          </section>
          <section className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <h2 className="font-bold text-slate-900">{t('evalRule')}</h2>
            <p className="text-sm text-slate-700">{t('evalDiabetesKeep')}</p>
            <p className="text-sm text-slate-700">{t('evalHeartChange')}</p>
            <p className="text-xs text-slate-500">{data.diabetes.selection_rule}</p>
            {data.diabetes.compared_with && (
              <p className="text-xs text-slate-500">{t('evalRunner')}: RandomForest accuracy {pct(data.diabetes.compared_with.accuracy)}, ROC-AUC {data.diabetes.compared_with.roc_auc}, recall {pct(data.diabetes.compared_with.recall)}.</p>
            )}
            <p className="text-xs text-slate-500">{data.cardio.selection_rule}</p>
            <p className="text-xs text-slate-500">{data.cardio.note}</p>
          </section>
        </>
      )}
    </main>
  );
}

export default ModelEvaluation;
