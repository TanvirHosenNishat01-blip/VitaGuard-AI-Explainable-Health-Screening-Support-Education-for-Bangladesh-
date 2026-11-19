import React, { useId } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

function ClinicalSelect({
  id,
  name,
  label,
  secondaryLabel,
  value,
  onChange,
  options = [],
  placeholder,
  hint,
  error,
  required = false,
  disabled = false,
  children,
  className = '',
  selectClassName = '',
  ...rest
}) {
  const generatedId = useId();
  const selectId = id || name || `clinical-select-${generatedId}`;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-baseline justify-between gap-2">
          <label
            htmlFor={selectId}
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

      <div className="relative">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`w-full min-h-[48px] pl-3.5 pr-10 py-2.5 bg-white text-[#12304A] text-sm rounded-xl border appearance-none transition-colors duration-150 focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed ${
            error
              ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-red-200'
              : 'border-[#E2E8F0] hover:border-slate-300 focus:border-[#0D9488] focus:ring-[#99F6E4]'
          } ${selectClassName}`}
          {...rest}
        >
          {placeholder !== undefined && (
            <option value="">{placeholder}</option>
          )}
          {children
            ? children
            : options.map((opt) => {
                const optValue = typeof opt === 'object' ? opt.value : opt;
                const optLabel = typeof opt === 'object' ? opt.label : opt;
                const optDisabled = typeof opt === 'object' ? opt.disabled : false;
                return (
                  <option key={String(optValue)} value={optValue} disabled={optDisabled}>
                    {optLabel}
                  </option>
                );
              })}
        </select>

        <div
          className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#64748B]"
          aria-hidden="true"
        >
          <ChevronDown className="w-4 h-4" />
        </div>
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

export default ClinicalSelect;
