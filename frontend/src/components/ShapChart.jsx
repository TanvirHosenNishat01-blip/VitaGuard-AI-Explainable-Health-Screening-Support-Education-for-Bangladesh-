import React from 'react';

function ShapChart({ shapPayload, title }) {
  // Support both direct array and nested object with features or feature_importance property
  const features = Array.isArray(shapPayload)
    ? shapPayload
    : shapPayload?.features ||
      shapPayload?.feature_importance ||
      shapPayload?.shap_values ||
      shapPayload?.shap ||
      shapPayload?.importance ||
      [];

  if (!features || !features.length) {
    return (
      <p className="text-xs text-[#64748B]">
        Feature importance data is not available for this model yet.
      </p>
    );
  }

  const signed = features.some((item) => item.signed || Number(item.shap) < 0);
  const amount = (item) =>
    Math.abs(Number(item.shap ?? item.importance ?? item.score ?? item.value) || 0);
  const maxValue = Math.max(...features.map(amount), 0.0001);
  const sourceLabel = signed ? 'SHAP' : 'Model feature importance';

  return (
    <div className="space-y-3" role="region" aria-label={title || sourceLabel}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-[#12304A] uppercase tracking-wider">
          {title || sourceLabel}
        </p>
        {signed && (
          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="inline-flex items-center gap-1 text-[#B91C1C]">
              <span aria-hidden="true">▲</span> +Risk
            </span>
            <span className="inline-flex items-center gap-1 text-[#0F766E]">
              <span aria-hidden="true">▼</span> -Risk
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2.5">
        {features.map((item, idx) => {
          const raw = Number(item.shap ?? item.importance ?? item.score ?? item.value) || 0;
          const width = Math.max((Math.abs(raw) / maxValue) * 100, 4);
          const featureName = item.feature || item.name || item.label || `Feature ${idx + 1}`;
          const isPositive = raw >= 0;
          const barClass = signed
            ? isPositive
              ? 'bg-[#DC2626]'
              : 'bg-[#0D9488]'
            : 'bg-[#12304A]';
          const directionSymbol = signed ? (isPositive ? '▲ +' : '▼ ') : '';

          return (
            <div key={featureName + idx}>
              <div className="flex justify-between items-baseline text-xs text-[#12304A] mb-1 gap-2">
                <span className="font-semibold truncate">{featureName}</span>
                <span
                  className={`font-mono tabular-nums font-semibold shrink-0 ${
                    signed
                      ? isPositive
                        ? 'text-[#B91C1C]'
                        : 'text-[#0F766E]'
                      : 'text-[#64748B]'
                  }`}
                >
                  {directionSymbol}
                  {raw.toFixed(4)}
                </span>
              </div>
              <div
                className="h-2.5 bg-slate-100 border border-[#E2E8F0] rounded-full overflow-hidden"
                aria-hidden="true"
              >
                <div
                  className={`h-full rounded-full transition-all duration-200 ${barClass}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Screen Reader Accessible Table Fallback (WCAG 1.1.1 / 1.3.1) */}
      <table className="sr-only">
        <caption>{title || sourceLabel}</caption>
        <thead>
          <tr>
            <th scope="col">Feature</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {features.map((item, idx) => {
            const raw = Number(item.shap ?? item.importance ?? item.score ?? item.value) || 0;
            const featureName = item.feature || item.name || item.label || `Feature ${idx + 1}`;
            return (
              <tr key={`sr-${featureName}-${idx}`}>
                <td>{featureName}</td>
                <td>{raw.toFixed(4)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ShapChart;
