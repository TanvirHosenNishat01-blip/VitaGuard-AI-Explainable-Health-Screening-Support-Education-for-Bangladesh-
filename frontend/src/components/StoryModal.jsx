import React, { useState } from 'react';
import { Activity, Printer, Stethoscope } from 'lucide-react';
import AccessibleModal from './ui/AccessibleModal';
import StatusBadge from './ui/StatusBadge';
import MedicalButton from './ui/MedicalButton';
import AlertBanner from './ui/AlertBanner';
import API from '../services/api';
import { useLanguage } from '../context/LanguageContext';

function StoryModal({ isOpen, onClose, record }) {
  const { lang, t } = useLanguage();
  const isBn = lang === 'bn';
  const [reviewMsg, setReviewMsg] = useState('');
  const [requesting, setRequesting] = useState(false);

  if (!isOpen || !record) return null;

  // Safely parse feature_importance if it comes as a JSON string
  let features = [];
  try {
    let parsed = record.feature_importance;
    if (typeof parsed === 'string') {
      parsed = JSON.parse(parsed);
    }
    if (Array.isArray(parsed)) {
      features = parsed.map((item) => [
        item.feature || item.name || 'Biomarker',
        Number(item.shap ?? item.importance ?? item.value ?? 0),
      ]);
    } else if (parsed && typeof parsed === 'object') {
      features = Object.entries(parsed).map(([k, v]) => [k, Number(v) || 0]);
    }
  } catch (e) {
    features = [];
  }

  // Sort and extract top 4 contributing factors
  const topFeatures = features
    .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
    .slice(0, 4);

  const riskLevel = record.risk_level || record.status || 'Low Risk';
  const prob = record.risk_probability_percentage ?? record.probability ?? 0;
  const formattedDate = record.date || record.created_at || 'N/A';

  const recordKind = String(record.type || '').toLowerCase().includes('cardio')
    ? 'heart'
    : 'diabetes';

  const handleRequestDoctorReview = async () => {
    if (!record.id) return;
    setReviewMsg('');
    setRequesting(true);
    try {
      await API.post('/api/reviews', { kind: recordKind, record_id: record.id });
      setReviewMsg(t('askDoctorSent'));
    } catch (err) {
      const detail = err.response?.data?.detail;
      setReviewMsg(typeof detail === 'string' ? detail : t('askDoctorNeedSave'));
    } finally {
      setRequesting(false);
    }
  };

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isBn
          ? 'ক্লিনিক্যাল স্ক্রিনিং রিপোর্ট ও এআই ব্যাখ্যা'
          : 'Clinical Screening Report & Explainable AI Summary'
      }
      subtitle={
        isBn
          ? `রেকর্ড #${record.id || '—'} · ${formattedDate}`
          : `Record #${record.id || '—'} · ${formattedDate}`
      }
      size="lg"
      footer={
        <div className="flex flex-wrap items-center justify-between w-full gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {record.id && (
              <MedicalButton
                variant="outline"
                size="sm"
                loading={requesting}
                onClick={handleRequestDoctorReview}
                leftIcon={<Stethoscope className="w-4 h-4" />}
              >
                {t('askDoctor')}
              </MedicalButton>
            )}
            <MedicalButton
              variant="ghost"
              size="sm"
              onClick={() => window.print()}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              {isBn ? 'প্রিন্ট করুন' : 'Print'}
            </MedicalButton>
          </div>
          <MedicalButton variant="primary" size="sm" onClick={onClose}>
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </MedicalButton>
        </div>
      }
    >
      {/* Non-Diagnostic Safety Notice */}
      <AlertBanner tone="warning" title={t('screeningTitle')}>
        <p>{t('screeningBody')}</p>
      </AlertBanner>

      {/* AI Narrative Card */}
      <div className="p-4 bg-[#F0FDFA] border border-[#99F6E4] rounded-xl space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[#0F766E] font-bold text-xs uppercase tracking-wider">
            <Activity className="w-4 h-4" aria-hidden="true" />
            <span>{isBn ? 'স্ক্রিনিং সারাংশ' : 'Screening Summary'}</span>
          </div>
          <StatusBadge status={riskLevel} size="sm" />
        </div>
        <p className="text-sm text-[#12304A] leading-relaxed font-medium">
          {isBn ? (
            <>
              <span className="font-bold">{formattedDate}</span> তারিখে আপনার{' '}
              <span className="font-bold">{record.type}</span> স্ক্রিনিং{' '}
              <span className="font-bold">{riskLevel}</span> ব্যান্ডে মূল্যায়িত হয়েছে (মডেল স্কোর:{' '}
              <span className="font-bold tabular-nums">{prob}%</span>)।
            </>
          ) : (
            <>
              On <span className="font-bold">{formattedDate}</span>, your{' '}
              <span className="font-bold">{record.type}</span> screening was placed in the{' '}
              <span className="font-bold">{riskLevel}</span> band with a model score of{' '}
              <span className="font-bold tabular-nums">{prob}%</span>.
            </>
          )}
        </p>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-[#F6F9FC] rounded-xl border border-[#E2E8F0]">
          <span className="text-[11px] font-bold text-[#64748B] uppercase">
            {isBn ? 'মূল্যায়নের ধরন' : 'Assessment Type'}
          </span>
          <p className="text-sm font-bold text-[#12304A] mt-0.5">{record.type}</p>
        </div>
        <div className="p-3.5 bg-[#F6F9FC] rounded-xl border border-[#E2E8F0]">
          <span className="text-[11px] font-bold text-[#64748B] uppercase">
            {isBn ? 'মডেল স্কোর' : 'Model Score'}
          </span>
          <p className="text-sm font-bold font-mono text-[#12304A] tabular-nums mt-0.5">
            {prob}%
          </p>
        </div>
        <div className="p-3.5 bg-[#F6F9FC] rounded-xl border border-[#E2E8F0]">
          <span className="text-[11px] font-bold text-[#64748B] uppercase">
            {isBn ? 'ডাক্তারের পরামর্শ স্ট্যাটাস' : 'Doctor Review Status'}
          </span>
          <p className="text-sm font-bold text-[#0F766E] mt-0.5">
            {record.doctorReviewed
              ? isBn
                ? 'ডাক্তারের গাইডলাইন যুক্ত'
                : 'Doctor Guideline Attached'
              : isBn
              ? 'পর্যালোচনার জন্য উন্মুক্ত'
              : 'Available for Review'}
          </p>
        </div>
      </div>

      {/* Key Biomarkers / Top Feature Factors */}
      <div className="space-y-3">
        <div>
          <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
            {recordKind === 'heart'
              ? isBn
                ? 'মডেলের সাধারণ ফিচার গুরুত্ব (লজিস্টিক রিগ্রেশন সহগ)'
                : 'Global Model Feature Weights (Logistic Regression)'
              : isBn
              ? 'মূল প্রভাবক সূচকসমূহ (ট্রি-SHAP / মডেল ফিচার গুরুত্ব)'
              : 'Key Contributing Indicators (TreeSHAP / Model Weights)'}
          </h3>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            {recordKind === 'heart'
              ? isBn
                ? 'বিঃদ্রঃ কার্ডিওভাসকুলার মডেলটি লজিস্টিক রিগ্রেশন ব্যবহার করে; এগুলো সার্বিক মডেলের সাধারণ সহগ, কোনো রোগী-নির্দিষ্ট লোকাল SHAP নয়।'
                : 'Note: Cardiovascular model utilizes global logistic regression coefficients, not patient-specific local TreeSHAP.'
              : isBn
              ? 'বিঃদ্রঃ এই মানগুলো মডেলের স্ক্রিনিং স্কোরে প্রতিটি ফিচারের আপেক্ষিক অবদান নির্দেশ করে।'
              : 'Note: Values represent relative feature attributions to the screening score.'}
          </p>
        </div>

        {topFeatures.length > 0 ? (
          <div className="space-y-2">
            {topFeatures.map(([name, val], idx) => {
              const score = Number(val).toFixed(3);
              const isElevating = Number(val) >= 0;
              return (
                <div
                  key={idx}
                  className="p-3 bg-white border border-[#E2E8F0] rounded-xl flex items-center justify-between shadow-clinical-xs gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-[#12304A] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#12304A] truncate">{name}</p>
                      <span className="text-[11px] text-[#64748B] font-medium">
                        {isElevating
                          ? isBn
                            ? 'ঝুঁকি স্কোর বৃদ্ধি করেছে'
                            : 'Elevated risk contribution'
                          : isBn
                          ? 'ঝুঁকি স্কোর কমিয়েছে'
                          : 'Protective / reducing contribution'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs font-bold font-mono tabular-nums px-2.5 py-1 rounded-lg border ${
                        isElevating
                          ? 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]'
                          : 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]'
                      }`}
                    >
                      {isElevating ? `▲ +${score}` : `▼ ${score}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#64748B] bg-[#F6F9FC] p-3.5 rounded-xl border border-[#E2E8F0]">
            {isBn
              ? 'এই রেকর্ডের জন্য বিস্তারিত বায়োমার্কার ওজন পাওয়া যায়নি।'
              : 'Detailed biomarker attribution data is not available for this record.'}
          </p>
        )}
      </div>

      {reviewMsg && (
        <p className="text-xs font-semibold text-[#0F766E]" role="status">
          {reviewMsg}
        </p>
      )}
    </AccessibleModal>
  );
}

export default StoryModal;
