import React from 'react';
import { Activity } from 'lucide-react';
import AccessibleModal from './ui/AccessibleModal';
import StatusBadge from './ui/StatusBadge';
import MedicalButton from './ui/MedicalButton';

function StoryModal({ isOpen, onClose, record }) {
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

  // Sort and extract top 3 contributing factors
  const topFeatures = features
    .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
    .slice(0, 3);

  const riskLevel = record.risk_level || record.status || 'Low Risk';
  const prob = record.risk_probability_percentage ?? record.probability ?? 0;
  const formattedDate =
    record.date || record.created_at
      ? new Date(record.date || record.created_at).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'N/A';

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Clinical Narrative & Assessment Story"
      subtitle="Explainable AI (SHAP) Screening Breakdown"
      size="md"
      footer={
        <MedicalButton variant="navy" size="sm" onClick={onClose}>
          Close
        </MedicalButton>
      }
    >
      {/* AI Narrative Card */}
      <div className="p-4 bg-[#F0FDFA] border border-[#99F6E4] rounded-xl space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[#0F766E] font-bold text-xs uppercase tracking-wider">
            <Activity className="w-4 h-4" aria-hidden="true" />
            <span>AI Screening Narrative</span>
          </div>
          <StatusBadge status={riskLevel} size="sm" />
        </div>
        <p className="text-sm text-[#12304A] leading-relaxed font-medium">
          On <span className="font-bold">{formattedDate}</span>, your{' '}
          <span className="font-bold">{record.type}</span> screening was evaluated in the{' '}
          <span className="font-bold">{riskLevel}</span> band with an estimated model score of{' '}
          <span className="font-bold tabular-nums">{prob}%</span>.
        </p>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 bg-[#F6F9FC] rounded-xl border border-[#E2E8F0]">
          <span className="text-[11px] font-bold text-[#64748B] uppercase">
            Assessment Type
          </span>
          <p className="text-sm font-bold text-[#12304A] mt-0.5">{record.type}</p>
        </div>
        <div className="p-3.5 bg-[#F6F9FC] rounded-xl border border-[#E2E8F0]">
          <span className="text-[11px] font-bold text-[#64748B] uppercase">
            Model Score
          </span>
          <p className="text-sm font-bold text-[#12304A] tabular-nums mt-0.5">
            {prob}%
          </p>
        </div>
      </div>

      {/* Key Biomarkers / Top SHAP Factors */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
          Key Screening Biomarkers (Top Contributors)
        </h3>

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
                      <p className="text-sm font-bold text-[#12304A] truncate">
                        {name}
                      </p>
                      <span className="text-[11px] text-[#64748B] font-medium">
                        {isElevating
                          ? 'Elevated risk contribution'
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
            Detailed local biomarker attribution data is not available for this record.
          </p>
        )}
      </div>
    </AccessibleModal>
  );
}

export default StoryModal;
