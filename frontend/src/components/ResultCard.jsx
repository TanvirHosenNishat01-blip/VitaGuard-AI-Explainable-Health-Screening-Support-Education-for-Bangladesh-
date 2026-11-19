import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Printer,
  Stethoscope,
  Info,
  ChevronDown,
} from 'lucide-react';
import ShapChart from './ShapChart';
import StatusBadge from './ui/StatusBadge';
import MedicalButton from './ui/MedicalButton';
import AlertBanner from './ui/AlertBanner';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

function fill(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');
}

const OUTCOME_GUIDANCE = {
  en: {
    low: {
      heading: 'Low Screening Band — Not a Medical Clearance',
      summary:
        'Your entered measurements fall below the model cutoff for elevated statistical risk. However, a low screening score does not guarantee the absence of disease—held-out test evaluations still missed positive cases. Continue healthy habits and consult a doctor if you have symptoms.',
    },
    moderate: {
      heading: 'Moderate Screening Band — Preventive Review Recommended',
      summary:
        'Several indicators place your screening score in the intermediate band. There is no reason for alarm: scheduling a routine checkup with a registered physician and reviewing diet, blood pressure, and physical activity are constructive next steps.',
    },
    high: {
      heading: 'Elevated Screening Band — Prompt Physician Consultation Advised',
      summary:
        'Multiple clinical measurements contributed to a higher statistical screening score. This is a screening alert rather than a confirmed diagnosis. Please share this summary with a qualified MBBS physician for confirmatory laboratory evaluation.',
    },
  },
  bn: {
    low: {
      heading: 'কম ঝুঁকির স্ক্রিনিং স্তর — এটি রোগমুক্তির চূড়ান্ত সনদ নয়',
      summary:
        'আপনার প্রদত্ত পরিমাপগুলো মডেলের উচ্চ ঝুঁকির সীমার নিচে রয়েছে। তবে কম স্কোর মানেই শতভাগ ঝুঁকিমুক্ত নয়—গবেষণা টেস্টেও কিছু পজিটিভ কেস মডেল ধরতে পারেনি। কোনো শারীরিক উপসর্গ থাকলে অবশ্যই চিকিৎসকের পরামর্শ নিন।',
    },
    moderate: {
      heading: 'মাঝারি ঝুঁকির স্ক্রিনিং স্তর — প্রতিরোধমূলক পরামর্শ নেওয়া প্রয়োজন',
      summary:
        'আপনার কিছু স্বাস্থ্য সূচক মাঝারি স্তরে রয়েছে। আতঙ্কিত হওয়ার কোনো কারণ নেই; একজন রেজিস্টার্ড চিকিৎসকের পরামর্শ নেওয়া এবং খাদ্যাভ্যাস ও নিয়মিত হাঁটাচলার বিষয়ে সচেতন হওয়া এখন সবচেয়ে ভালো পদক্ষেপ।',
    },
    high: {
      heading: 'উচ্চ ঝুঁকির স্ক্রিনিং স্তর — দ্রুত চিকিৎসকের পরামর্শ নেওয়ার সুপারিশ',
      summary:
        'একাধিক ক্লিনিক্যাল পরিমাপের কারণে পরিসংখ্যানগত ঝুঁকি স্কোর বেশি এসেছে। এটি একটি প্রাথমিক স্ক্রিনিং সতর্কতা, চূড়ান্ত রোগ নির্ণয় নয়। নিশ্চিত ল্যাবরেটরি পরীক্ষা ও পরামর্শের জন্য একজন রেজিস্টার্ড চিকিৎসকের শরণাপন্ন হোন।',
    },
  },
};

function ResultCard({ predictionResult, shapPayload, recordKind = 'diabetes' }) {
  const { lang, t } = useLanguage();
  const isBn = lang === 'bn';
  const isHeart = recordKind === 'heart' || recordKind === 'cardio';
  const { token } = useAuth();
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [showLimitations, setShowLimitations] = useState(true);
  const [lineage, setLineage] = useState(null);

  React.useEffect(() => {
    const pathway = isHeart ? 'cleveland' : recordKind === 'diabetes' ? 'pima' : 'diabd';
    API.get(`/api/ai/lineage?pathway=${pathway}`)
      .then((res) => setLineage((res.data.pathways || [])[0] || null))
      .catch(() => setLineage(null));
  }, [isHeart, recordKind]);

  if (!predictionResult) return null;

  const {
    risk_level,
    prediction,
    risk_probability_percentage,
    probability,
    score,
    record_id,
    id,
    user_id,
    feature_importance,
    shap_values,
    shap,
    importance,
    features,
    display_bands,
    model_name,
  } = predictionResult;

  const probabilityValue = risk_probability_percentage ?? probability ?? score;
  const hasJustifiedProbability =
    probabilityValue !== undefined &&
    probabilityValue !== null &&
    !Number.isNaN(Number(probabilityValue));

  const level = String(risk_level || '').toLowerCase();
  const tone =
    level.includes('high') || level.includes('critical')
      ? 'high'
      : level.includes('moderate') || level.includes('medium')
      ? 'moderate'
      : 'low';

  const shell = {
    high: 'bg-[#FEF2F2] border-[#FECACA]',
    moderate: 'bg-[#FFFBEB] border-[#FDE68A]',
    low: 'bg-[#F0FDF4] border-[#BBF7D0]',
  }[tone];

  const titleColor = {
    high: 'text-[#991B1B]',
    moderate: 'text-[#92400E]',
    low: 'text-[#15803D]',
  }[tone];

  const ToneIcon = {
    high: AlertOctagon,
    moderate: AlertTriangle,
    low: CheckCircle2,
  }[tone];

  const resolvedShapPayload =
    shapPayload?.features?.length
      ? shapPayload
      : feature_importance || shap_values || shap || importance || features || shapPayload;

  const displayRecordId = record_id || id;
  const lowBand = display_bands?.low_below;
  const highBand = display_bands?.high_from;
  const guidance = (OUTCOME_GUIDANCE[lang] || OUTCOME_GUIDANCE.en)[tone];

  const askDoctor = async () => {
    setReviewMessage('');
    setReviewSubmitting(true);
    try {
      await API.post('/api/reviews', { kind: recordKind, record_id: displayRecordId });
      setReviewMessage(t('askDoctorSent'));
    } catch (err) {
      const detail = err.response?.data?.detail;
      setReviewMessage(typeof detail === 'string' ? detail : t('askDoctorNeedSave'));
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div
      role="region"
      aria-live="polite"
      className={`p-5 sm:p-7 rounded-2xl border shadow-clinical-sm space-y-5 print:border-slate-300 print:shadow-none ${shell}`}
    >
      {/* 1. Mandatory Non-Diagnostic Clinical Safety Banner */}
      <AlertBanner tone="warning" title={t('screeningTitle')}>
        <p>{t('screeningBody')}</p>
        <p className="mt-1 font-semibold">
          {predictionResult.saved ? t('savedRecord') : t('notSaved')}
        </p>
      </AlertBanner>

      {/* 2. Primary Screening Result Header */}
      <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] space-y-4">
        <div className="flex flex-wrap justify-between items-start gap-3">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl bg-[#F6F9FC] border border-[#E2E8F0] ${titleColor}`}>
              <ToneIcon className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h3 className={`text-lg sm:text-xl font-extrabold ${titleColor}`}>
                {t('resultTitle')}
              </h3>
              <p className="text-xs font-semibold text-[#12304A] mt-0.5">{guidance.heading}</p>
              {model_name && <p className="text-xs text-[#64748B] mt-0.5">{model_name}</p>}
            </div>
          </div>

          <StatusBadge
            tone={tone}
            label={risk_level || (prediction === 1 ? t('resultClassYes') : t('resultClassNo'))}
          />
        </div>

        <p className="text-sm text-[#334155] leading-relaxed bg-[#F6F9FC] p-3.5 rounded-xl border border-[#E2E8F0]">
          {guidance.summary}
        </p>

        {/* Metrics Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm pt-1">
          <div className="p-3.5 rounded-xl bg-[#F6F9FC] border border-[#E2E8F0]">
            <p className="text-xs font-semibold text-[#64748B]">{t('resultScore')}</p>
            <p className="text-lg font-mono font-extrabold tabular-nums text-[#12304A] mt-0.5">
              {hasJustifiedProbability ? `${probabilityValue}%` : 'N/A'}
            </p>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              {isBn ? 'মডেল-অনুমানকৃত স্কোর (ব্যক্তিগত গ্যারান্টি নয়)' : 'Model score (not personal certainty)'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F6F9FC] border border-[#E2E8F0]">
            <p className="text-xs font-semibold text-[#64748B]">{t('resultGroup')}</p>
            <p className="text-base font-bold text-[#12304A] mt-0.5">{risk_level || '—'}</p>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              {isBn ? '৩-স্তরের স্ক্রিনিং ব্যান্ড' : '3-tier screening band'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F6F9FC] border border-[#E2E8F0]">
            <p className="text-xs font-semibold text-[#64748B]">{t('resultClass')}</p>
            <p className="text-sm font-mono font-bold text-[#12304A] mt-0.5">
              {prediction === 1 ? t('resultClassYes') : t('resultClassNo')}
            </p>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              {isBn ? '৫০% কাটঅফ থ্রেশহোল্ড' : '50% cutoff threshold'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F6F9FC] border border-[#E2E8F0]">
            <p className="text-xs font-semibold text-[#64748B]">{t('resultHistory')}</p>
            <p className="text-sm font-mono font-bold text-[#12304A] mt-0.5">
              {displayRecordId ? `Record #${displayRecordId}` : isBn ? 'সেভ হয়নি' : 'Not saved'}
            </p>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              {user_id ? `User ID: ${user_id}` : isBn ? 'গেস্ট সেশন' : 'Guest session'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Explainable AI (Model Feature Weights / Attribution) */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] space-y-2">
        <ShapChart
          shapPayload={resolvedShapPayload}
          title={isHeart ? t('cardioModelWeights') : t('modelWeights')}
        />
        <p className="text-xs text-[#64748B] pt-1 leading-relaxed">
          {isHeart
            ? t('cardioModelWeightsDesc')
            : isBn
            ? 'বিঃদ্রঃ এই মানগুলো মডেলের ফিচার প্রভাবক গুরুত্ব নির্দেশ করে; এগুলো সরাসরি শতাংশের যোগফল নয়।'
            : 'Note: Values represent raw model feature weights / attributions in model units, not additive percentages.'}
        </p>
      </div>

      {lineage && (
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] space-y-2 text-sm">
          <p className="font-semibold text-[#12304A]">{isBn ? 'পথ ও সীমা' : 'Pathway and limits'}</p>
          <p className="text-xs text-[#475569]">{lineage.label} · {lineage.engine} · SHAP: {lineage.shap}</p>
          {lineage.artifact_sha256 && (
            <p className="text-[11px] font-mono text-[#64748B] break-all">sha256 {lineage.artifact_sha256}</p>
          )}
          <p className="text-xs text-[#334155]">{lineage.meaning}</p>
          <p className="text-xs text-[#475569]">
            {isBn
              ? 'এই সংখ্যা একটি স্ক্রিনিং ফল। এটি রোগ আছে কি না, ওষুধ, বা পরবর্তী পরীক্ষা ঠিক করে দেয় না।'
              : 'This number is a screening result. It does not decide whether a disease is present, which medicine to use, or which test comes next.'}
          </p>
          <Link className="text-xs text-[#0E7490]" to={isHeart ? '/knowledge/articles/heart-pathways' : '/knowledge/articles/diabetes-education'}>
            {isBn ? 'সম্পর্কিত শিক্ষামূলক নোট' : 'Related educational note'}
          </Link>
        </div>
      )}

      {/* 4. Follow-Up Guidance, Doctor Review & Printable Report */}
      <div className="bg-[#F0FDFA] border border-[#99F6E4] rounded-2xl p-5 text-sm text-[#12304A] space-y-3">
        <div className="flex items-center gap-2 text-[#0F766E] font-bold">
          <Stethoscope className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{t('nextStepTitle')}</span>
        </div>
        <p className="text-xs sm:text-sm leading-relaxed text-[#12304A]">{t('nextStepBody')}</p>

        <div className="flex flex-wrap items-center gap-3 pt-1 print:hidden">
          {token && displayRecordId ? (
            <MedicalButton
              variant="primary"
              size="sm"
              loading={reviewSubmitting}
              onClick={askDoctor}
              leftIcon={<Stethoscope className="w-4 h-4" />}
            >
              {t('askDoctor')}
            </MedicalButton>
          ) : (
            <span className="text-xs font-medium text-[#475569]">{t('askDoctorNeedSave')}</span>
          )}

          <MedicalButton
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            {isBn ? 'রিপোর্ট প্রিন্ট / PDF সেভ করুন' : 'Print / Save PDF Summary'}
          </MedicalButton>
        </div>

        {reviewMessage && (
          <p className="text-xs font-semibold text-[#0F766E] pt-1" role="status">
            {reviewMessage}
          </p>
        )}
      </div>

      {/* 5. Model Limitations & Uncertainty Disclosure */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowLimitations((v) => !v)}
          aria-expanded={showLimitations}
          className="w-full px-5 py-3.5 text-left flex items-center justify-between gap-3 hover:bg-[#F6F9FC] transition cursor-pointer"
        >
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#12304A]">
            <Info className="w-4 h-4 text-[#0D9488]" aria-hidden="true" />
            <span>
              {isBn
                ? 'মডেলের সীমাবদ্ধতা, ডেটাসেট ও টেস্ট ফলাফল'
                : 'Model Limitations, Dataset Context & Held-Out Test Counts'}
            </span>
          </span>
          <ChevronDown
            className={`w-4 h-4 text-[#64748B] transition-transform ${
              showLimitations ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>

        {showLimitations && (
          <div className="px-5 pb-5 pt-2 border-t border-[#F1F5F9] text-sm text-[#12304A] space-y-2.5">
            <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">{t('resultRead')}</p>
            {lowBand !== undefined && highBand !== undefined && (
              <p className="text-xs text-[#64748B]">
                {fill(t('resultBand'), { low: lowBand, high: highBand })}
              </p>
            )}
            <p className="text-xs text-[#64748B]">{t('resultDoctor')}</p>
            <Link
              to="/evaluation"
              className="inline-block text-[#0D9488] hover:text-[#0F766E] font-bold text-xs underline underline-offset-2"
            >
              {t('resultLink')} →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultCard;
