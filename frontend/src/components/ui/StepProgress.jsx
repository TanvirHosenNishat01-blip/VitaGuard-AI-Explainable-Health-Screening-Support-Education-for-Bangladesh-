import React from 'react';
import { Check } from 'lucide-react';

function StepProgress({
  steps = [],
  currentStep = 0,
  onStepClick,
  ariaLabel = 'Assessment Progress',
  className = '',
}) {
  if (!Array.isArray(steps) || steps.length === 0) return null;

  const activeIdx = Math.min(Math.max(Number(currentStep) || 0, 0), steps.length - 1);
  const progressPercent = Math.round(((activeIdx + 1) / steps.length) * 100);
  const activeStepObj = steps[activeIdx];
  const activeLabel =
    typeof activeStepObj === 'object' ? activeStepObj.label : String(activeStepObj);

  return (
    <nav aria-label={ariaLabel} className={`w-full ${className}`}>
      {/* Mobile Compact Progress Bar (< 640px) */}
      <div className="sm:hidden space-y-2 bg-white p-4 rounded-xl border border-[#E2E8F0]">
        <div className="flex items-center justify-between text-xs font-semibold text-[#12304A]">
          <span>
            Step {activeIdx + 1} of {steps.length}:{' '}
            <strong className="text-[#0D9488]">{activeLabel}</strong>
          </span>
          <span className="tabular-nums text-[#64748B]">{progressPercent}%</span>
        </div>
        <div
          className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-[#0D9488] rounded-full transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Tablet & Desktop Stepper (>= 640px) */}
      <ol className="hidden sm:flex items-center justify-between w-full bg-white px-6 py-4 rounded-2xl border border-[#E2E8F0] shadow-clinical-xs">
        {steps.map((step, index) => {
          const label = typeof step === 'object' ? step.label : String(step);
          const isCompleted = index < activeIdx;
          const isCurrent = index === activeIdx;
          const canClick = typeof onStepClick === 'function' && isCompleted;

          return (
            <li
              key={label + index}
              aria-current={isCurrent ? 'step' : undefined}
              className="flex items-center flex-1 last:flex-initial"
            >
              <button
                type="button"
                disabled={!canClick}
                onClick={canClick ? () => onStepClick(index) : undefined}
                className={`flex items-center gap-2.5 text-left rounded-lg p-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] ${
                  canClick ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border transition-colors ${
                    isCompleted
                      ? 'bg-[#15803D] border-[#15803D] text-white'
                      : isCurrent
                      ? 'bg-[#0D9488] border-[#0D9488] text-white ring-4 ring-[#F0FDFA]'
                      : 'bg-[#F6F9FC] border-[#E2E8F0] text-[#64748B]'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    isCurrent
                      ? 'text-[#12304A] font-bold'
                      : isCompleted
                      ? 'text-[#15803D]'
                      : 'text-[#64748B]'
                  }`}
                >
                  {label}
                </span>
              </button>

              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 rounded-full ${
                    isCompleted ? 'bg-[#15803D]' : 'bg-[#E2E8F0]'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default StepProgress;
