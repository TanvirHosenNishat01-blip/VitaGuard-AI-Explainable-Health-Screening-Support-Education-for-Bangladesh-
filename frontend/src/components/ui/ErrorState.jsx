import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import MedicalButton from './MedicalButton';

function ErrorState({
  title = 'Unable to load clinical data',
  message = 'A connection or server issue prevented loading this information. Please try again.',
  onRetry,
  retryLabel = 'Try again',
  backTo,
  backLabel = 'Return',
  className = '',
}) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`bg-white rounded-2xl border border-[#FECACA] border-l-4 border-l-[#DC2626] p-6 sm:p-8 shadow-clinical-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-start gap-3.5 min-w-0">
        <div
          className="w-10 h-10 rounded-xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1 min-w-0">
          <h3 className="text-sm sm:text-base font-bold text-[#991B1B]">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      {(onRetry || backTo) && (
        <div className="flex items-center gap-2.5 shrink-0">
          {typeof onRetry === 'function' && (
            <MedicalButton
              variant="outline"
              size="sm"
              leftIcon={RotateCcw}
              onClick={onRetry}
            >
              {retryLabel}
            </MedicalButton>
          )}
          {backTo && (
            <Link
              to={backTo}
              className="inline-flex items-center justify-center min-h-[40px] sm:min-h-[36px] px-3.5 py-1.5 bg-[#12304A] text-white text-xs font-semibold rounded-lg hover:bg-[#1E4668] transition-colors"
            >
              {backLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default ErrorState;
