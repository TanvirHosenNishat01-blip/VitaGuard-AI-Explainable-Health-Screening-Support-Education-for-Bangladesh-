import React from 'react';

function LoadingSkeleton({
  variant = 'card',
  rows = 3,
  label = 'Loading clinical records...',
  className = '',
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`w-full space-y-4 ${className}`}
    >
      <span className="sr-only">{label}</span>

      {variant === 'metrics' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-[#E2E8F0] space-y-2.5 animate-pulse"
            >
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-7 w-14 bg-slate-200 rounded" />
              <div className="h-2.5 w-24 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {variant === 'table' && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] space-y-3 animate-pulse">
          <div className="h-4 w-40 bg-slate-200 rounded mb-4" />
          {Array.from({ length: rows }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-b-0"
            >
              <div className="h-3.5 w-24 bg-slate-200 rounded" />
              <div className="h-3.5 w-32 bg-slate-100 rounded hidden sm:block" />
              <div className="h-6 w-20 bg-slate-200 rounded-full" />
              <div className="h-3.5 w-12 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {variant === 'text' && (
        <div className="space-y-2.5 animate-pulse">
          {Array.from({ length: rows }).map((_, idx) => (
            <div
              key={idx}
              className={`h-3.5 bg-slate-200 rounded ${
                idx === rows - 1 ? 'w-2/3' : 'w-full'
              }`}
            />
          ))}
        </div>
      )}

      {variant === 'card' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] space-y-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-48 bg-slate-200 rounded" />
              <div className="h-3 w-32 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-3.5 w-full bg-slate-100 rounded" />
            <div className="h-3.5 w-5/6 bg-slate-100 rounded" />
          </div>
        </div>
      )}
    </div>
  );
}

export default LoadingSkeleton;
