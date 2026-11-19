import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ShapChart from './ShapChart';
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
    high: 'bg-red-50/50 border-red-200',
    moderate: 'bg-amber-50/60 border-amber-200',
    low: 'bg-green-50/50 border-green-200',
  }[tone];
  const title = {
    high: 'text-red-900',
    moderate: 'text-amber-900',
    low: 'text-green-900',
  }[tone];
  const badge = {
    high: 'bg-red-100 text-red-700',
    moderate: 'bg-amber-100 text-amber-800',
    low: 'bg-green-100 text-green-700',
  }[tone];

  const resolvedShapPayload = shapPayload || feature_importance || shap_values || shap || importance || features;
  const displayRecordId = record_id || id;
  const lowBand = display_bands?.low_below;

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
  const highBand = display_bands?.high_from;

  return (
    <div className={`p-6 rounded-xl border shadow-sm space-y-4 ${shell}`}>
      <div className="flex justify-between items-center gap-3">
        <div>
          <h3 className={`text-lg font-bold ${title}`}>{t('resultTitle')}</h3>
          {model_name && <p className="text-xs text-slate-500 mt-1">{model_name}</p>}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge}`}>
          {risk_level || (prediction === 1 ? t('resultClassYes') : t('resultClassNo'))}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">{t('resultScore')}</p>
          <p className="font-mono text-gray-800">
            {probabilityValue === undefined || probabilityValue === null ? 'N/A' : `${probabilityValue}%`}
          </p>
        </div>
        <div>
          <p className="text-gray-500">{t('resultGroup')}</p>
          <p className="font-semibold text-gray-800">{risk_level || '—'}</p>
        </div>
        <div>
          <p className="text-gray-500">{t('resultClass')}</p>
          <p className="font-mono text-gray-800">{prediction === 1 ? t('resultClassYes') : t('resultClassNo')}</p>
        </div>
        <div>
          <p className="text-gray-500">{t('resultHistory')}</p>
          <p className="font-mono text-gray-800">
            {displayRecordId ? `Record #${displayRecordId}` : 'Not saved'}
            {user_id ? ` · User ${user_id}` : ' · guest'}
          </p>
        </div>
      </div>

      <div className="bg-white/80 border border-slate-200 rounded-lg p-3 text-sm text-slate-700 space-y-2">
        <p>{t('resultRead')}</p>
        {lowBand !== undefined && highBand !== undefined && (
          <p>{fill(t('resultBand'), { low: lowBand, high: highBand })}</p>
        )}
        <p>{t('resultDoctor')}</p>
        <Link to="/evaluation" className="inline-block text-blue-700 font-bold text-xs">{t('resultLink')}</Link>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-slate-800 space-y-2">
        <p className="font-bold text-blue-800">{t('nextStepTitle')}</p>
        <p>{t('nextStepBody')}</p>
        {token && displayRecordId ? (
          <button type="button" onClick={askDoctor} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg">
            {t('askDoctor')}
          </button>
        ) : (
          <p className="text-xs text-slate-600">{t('askDoctorNeedSave')}</p>
        )}
        {reviewMessage && <p className="text-xs font-semibold text-slate-700">{reviewMessage}</p>}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
        <p className="font-bold">{t('screeningTitle')}</p>
        <p className="mt-1">{t('screeningBody')}</p>
        <p className="mt-1 font-semibold">{predictionResult.saved ? t('savedRecord') : t('notSaved')}</p>
      </div>

      <div className="mt-2 pt-4 border-t border-gray-200">
        <ShapChart shapPayload={resolvedShapPayload} title={t('modelWeights')} />
      </div>
    </div>
  );
}

export default ResultCard;
