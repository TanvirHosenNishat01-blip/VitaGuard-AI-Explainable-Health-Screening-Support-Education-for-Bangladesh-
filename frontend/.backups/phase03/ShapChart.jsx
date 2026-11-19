import React from 'react';

function ShapChart({ shapPayload, title }) {
  // Support both direct array and nested object with features or feature_importance property
  const features = Array.isArray(shapPayload) 
    ? shapPayload 
    : (shapPayload?.features || shapPayload?.feature_importance || shapPayload?.shap_values || shapPayload?.shap || shapPayload?.importance || []);

  if (!features || !features.length) {
    return (
      <p className="text-xs text-gray-500">
        Feature importance data is not available for this model yet.
      </p>
    );
  }

  const signed = features.some((item) => item.signed || Number(item.shap) < 0);
  const amount = (item) => Math.abs(Number(item.shap ?? item.importance ?? item.score ?? item.value) || 0);
  const maxValue = Math.max(...features.map(amount), 0.0001);
  const sourceLabel = signed ? 'SHAP' : 'Model feature importance';

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
        {title || sourceLabel}
      </p>
      <div className="space-y-2">
        {features.map((item, idx) => {
          const raw = Number(item.shap ?? item.importance ?? item.score ?? item.value) || 0;
          const width = Math.max((Math.abs(raw) / maxValue) * 100, 4);
          const featureName = item.feature || item.name || item.label || `Feature ${idx + 1}`;
          const bar = signed ? (raw >= 0 ? 'bg-red-500' : 'bg-blue-500') : 'bg-blue-500';
          return (
            <div key={featureName + idx}>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span className="font-medium">{featureName}</span>
                <span className="font-mono">{raw.toFixed(4)}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${bar}`} style={{ width: `${width}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ShapChart;
