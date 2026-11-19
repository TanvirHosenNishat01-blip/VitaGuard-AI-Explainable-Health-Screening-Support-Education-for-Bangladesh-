import React from 'react';
import { X, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';

function StoryModal({ isOpen, onClose, record }) {
  if (!isOpen || !record) return null;

  // Safely parse feature_importance if it comes as a JSON string
  let features = {};
  try {
    if (typeof record.feature_importance === 'string') {
      features = JSON.parse(record.feature_importance);
    } else if (record.feature_importance && typeof record.feature_importance === 'object') {
      features = record.feature_importance;
    }
  } catch (e) {
    features = {};
  }

  // Sort and extract top 3 contributing factors
  const topFeatures = Object.entries(features)
    .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
    .slice(0, 3);

  const riskLevel = record.risk_level || record.status || 'Low Risk';
  const prob = record.risk_probability_percentage ?? record.probability ?? 0;
  const formattedDate = record.date || record.created_at
    ? new Date(record.date || record.created_at).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'N/A';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Clinical Narrative & Assessment Story</h3>
            <p className="text-xs text-gray-500 mt-0.5">Explainable AI (SHAP) Diagnostic Breakdown</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* AI Narrative Card */}
          <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
              <Activity className="w-4 h-4" /> AI Diagnostic Narrative
            </div>
            <p className="text-sm text-gray-700 leading-relaxed font-medium">
              On <span className="font-semibold text-gray-900">{formattedDate}</span>, your{' '}
              <span className="font-semibold text-gray-900">{record.type}</span> was evaluated with a{' '}
              <span className={`font-bold ${riskLevel === 'High Risk' ? 'text-red-600' : riskLevel === 'Moderate Risk' ? 'text-amber-600' : 'text-emerald-600'}`}>
                {riskLevel}
              </span>{' '}
              classification at an estimated probability of{' '}
              <span className="font-semibold text-gray-900">{prob}%</span>.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Assessment Type</span>
              <p className="text-sm font-bold text-gray-800 mt-0.5">{record.type}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Risk Score</span>
              <p className="text-sm font-bold text-gray-800 mt-0.5">{prob}%</p>
            </div>
          </div>

          {/* Key Biomarkers / Top SHAP Factors */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Key Diagnostic Biomarkers (Top Contributors)
            </h4>

            {topFeatures.length > 0 ? (
              <div className="space-y-2">
                {topFeatures.map(([name, val], idx) => {
                  const score = Number(val).toFixed(3);
                  const isElevating = Number(val) >= 0;
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-gray-200/80 rounded-xl flex items-center justify-between shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{name}</p>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {isElevating ? 'Elevated risk impact' : 'Protective / reducing impact'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                          isElevating ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          {isElevating ? `+${score}` : score} SHAP
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic bg-gray-50 p-3 rounded-lg border border-gray-100">
                Detailed local biomarker attribution data is not available for this record.
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default StoryModal;