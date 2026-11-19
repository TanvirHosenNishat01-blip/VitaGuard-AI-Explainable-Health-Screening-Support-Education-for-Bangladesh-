import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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

function ResultCard({ predictionResult, shapPayload, recordKind = 'diabetes' }) {
  const { t } = useLanguage();
  const { token } = useAuth();
  const [reviewMessage, setReviewMessage] = useState('');
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
  const level = String(risk_level || '').toLowerCase();
  const tone = level.includes('high') ? 'high' : level.includes('moderate') ? 'moderate' : 'low';
  const shell = {
    high: 'bg-[#FEE2E2]/40 border-[#FECACA]',
    moderate: 'bg-[#FEF3C7]/40 border-[#FDE68A]',
    low: 'bg-[#DCFCE7]/40 border-[#BBF7D0]',
  }[tone];
  const title = {
    high: 'text-[#991B1B]',
    moderate: 'text-[#92400E]',
    low: 'text-[#15803D]',
  }[tone];

  const resolvedShapPayload =
    shapPayload || feature_importance || shap_values || shap || importance || features;
  const displayRecordId = record_id || id;
  const lowBand = display_bands?.low_below;
  const highBand = display_bands?.high_from;

  const askDoctor = async () => {
    setReviewMessage('');
    try {
      await API.post('/api/reviews', { kind: recordKind, record_id: displayRecordId });
      setReviewMessage(t('askDoctorSent'));
    } catch (err) {
      const detail = err.response?.data?.detail;
      setReviewMessage(typeof detail === 'string' ? detail : t('askDoctorNeedSave'));
    }
  };

  return (
    <div
      role="region"
      aria-live="polite"
      className={`p-5 sm:p-6 rounded-2xl border shadow-clinical-xs space-y-4 ${shell}`}
    >
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h3 className={`text-lg font-bold ${title}`}>{t('resultTitle')}</h3>
          {model_name && <p className="text-xs text-[#64748B] mt-0.5">{model_name}</p>}
        </div>
        <StatusBadge
          tone={tone}
          label={risk_level || (prediction === 1 ? t('resultClassYes') : t('resultClassNo'))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm bg-white/90 p-4 rounded-xl border border-[#E2E8F0]">
        <div>
          <p className="text-xs font-semibold text-[#64748B]">{t('resultScore')}</p>
          <p className="font-mono font-bold tabular-nums text-[#12304A] mt-0.5">
            {probabilityValue === undefined || probabilityValue === null
              ? 'N/A'
              : `${probabilityValue}%`}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-[#64748B]">{t('resultGroup')}</p>
          <p className="font-semibold text-[#12304A] mt-0.5">{risk_level || '—'}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-[#64748B]">{t('resultClass')}</p>
          <p className="font-mono text-[#12304A] mt-0.5">
            {prediction === 1 ? t('resultClassYes') : t('resultClassNo')}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-[#64748B]">{t('resultHistory')}</p>
          <p className="font-mono text-[#12304A] mt-0.5">
            {displayRecordId ? `Record #${displayRecordId}` : 'Not saved'}
            {user_id ? ` · User ${user_id}` : ' · guest'}
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 text-sm text-[#12304A] space-y-2">
        <p>{t('resultRead')}</p>
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
          {t('resultLink')}
        </Link>
      </div>

      <div className="bg-[#F0FDFA] border border-[#99F6E4] rounded-xl p-4 text-sm text-[#12304A] space-y-2.5">
        <p className="font-bold text-[#0F766E]">{t('nextStepTitle')}</p>
        <p className="text-xs sm:text-sm leading-relaxed">{t('nextStepBody')}</p>
        {token && displayRecordId ? (
          <MedicalButton variant="primary" size="sm" onClick={askDoctor}>
            {t('askDoctor')}
          </MedicalButton>
        ) : (
          <p className="text-xs text-[#64748B]">{t('askDoctorNeedSave')}</p>
        )}
        {reviewMessage && (
          <p className="text-xs font-semibold text-[#0F766E]" role="status">
            {reviewMessage}
          </p>
        )}
      </div>

      <AlertBanner tone="warning" title={t('screeningTitle')}>
        <p>{t('screeningBody')}</p>
        <p className="mt-1 font-semibold">
          {predictionResult.saved ? t('savedRecord') : t('notSaved')}
        </p>
      </AlertBanner>

      <div className="mt-2 pt-4 border-t border-[#E2E8F0] bg-white p-4 rounded-xl border">
        <ShapChart shapPayload={resolvedShapPayload} title={t('modelWeights')} />
      </div>
    </div>
  );
}

export default ResultCard;
