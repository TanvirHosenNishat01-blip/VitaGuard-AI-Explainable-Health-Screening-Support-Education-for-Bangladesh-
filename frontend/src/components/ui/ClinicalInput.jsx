import React, { useId } from 'react';
import { AlertCircle } from 'lucide-react';

function ClinicalInput({
  id,
  name,
  label,
  secondaryLabel,
  value,
  onChange,
  type = 'text',
  inputMode,
  unit,
  hint,
  error,
  required = false,
  disabled = false,
  placeholder = '',
  min,
  max,
  step,
  rightElement,
  className = '',
  inputClassName = '',
  ...rest
}) {
  const generatedId = useId();
  const inputId = id || name || `clinical-input-${generatedId}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const isNumeric =
    type === 'number' || inputMode === 'numeric' || inputMode === 'decimal';

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-baseline justify-between gap-2">
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-[#12304A]"
          >
            {label}
            {required && (
              <span className="text-[#DC2626] ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
          {secondaryLabel && (
            <span className="text-xs font-medium text-[#64748B]">
              {secondaryLabel}
            </span>
          )}
        </div>
      )}

      <div className="relative flex items-center">
        <input
          id={inputId}
          name={name}
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`w-full min-h-[48px] px-3.5 py-2.5 bg-white text-[#12304A] text-sm rounded-xl border transition-colors duration-150 placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed ${
            isNumeric ? 'tabular-nums' : ''
          } ${unit || rightElement ? 'pr-20' : ''} ${
            error
              ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-red-200'
              : 'border-[#E2E8F0] hover:border-slate-300 focus:border-[#0D9488] focus:ring-[#99F6E4]'
          } ${inputClassName}`}
          {...rest}
        />

        {(unit || rightElement) && (
          <div className="absolute right-2.5 inset-y-0 flex items-center pointer-events-none">
            {rightElement ? (
              <div className="pointer-events-auto">{rightElement}</div>
            ) : (
              <span className="px-2 py-1 rounded-md bg-[#F6F9FC] border border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] select-none">
                {unit}
              </span>
            )}
          </div>
        )}
      </div>

      {hint && !error && (
        <p id={hintId} className="text-xs text-[#64748B] leading-relaxed">
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="flex items-start gap-1.5 text-xs font-medium text-[#B91C1C] leading-relaxed"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#DC2626]" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export default ClinicalInput;
