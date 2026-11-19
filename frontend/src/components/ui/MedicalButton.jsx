import React from 'react';
import { Loader2 } from 'lucide-react';
import { renderIcon } from './renderIcon';

const VARIANT_CLASSES = {
  primary:
    'bg-[#0D9488] hover:bg-[#0F766E] active:bg-[#115E59] text-white border border-transparent shadow-clinical-xs',
  navy:
    'bg-[#12304A] hover:bg-[#1E4668] active:bg-[#0B1F31] text-white border border-transparent shadow-clinical-xs',
  secondary:
    'bg-[#12304A] hover:bg-[#1E4668] active:bg-[#0B1F31] text-white border border-transparent shadow-clinical-xs',
  outline:
    'bg-white hover:bg-[#F6F9FC] active:bg-slate-100 text-[#12304A] border border-[#E2E8F0] shadow-clinical-xs',
  ghost:
    'bg-transparent hover:bg-slate-100 active:bg-slate-200/70 text-[#12304A] border border-transparent',
  danger:
    'bg-[#DC2626] hover:bg-red-700 active:bg-red-800 text-white border border-transparent shadow-clinical-xs',
  'soft-danger':
    'bg-[#FEE2E2] hover:bg-red-100 text-[#B91C1C] border border-[#FECACA]',
};

const SIZE_CLASSES = {
  sm: 'min-h-[40px] sm:min-h-[36px] px-3.5 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'min-h-[48px] sm:min-h-[44px] px-5 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'min-h-[52px] px-6 py-3 text-base gap-2.5 rounded-xl',
};

function MedicalButton({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  loadingText,
  disabled = false,
  fullWidth = false,
  leftIcon: LeftIcon = null,
  rightIcon: RightIcon = null,
  className = '',
  onClick,
  ...rest
}) {
  const isDisabled = disabled || loading;
  const variantClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary;
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      onClick={onClick}
      className={`inline-flex items-center justify-center font-semibold transition-colors duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2 disabled:opacity-55 disabled:pointer-events-none cursor-pointer ${variantClass} ${sizeClass} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...rest}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {LeftIcon && (
            <span className="shrink-0 inline-flex items-center" aria-hidden="true">
              {renderIcon(LeftIcon, 'w-4 h-4')}
            </span>
          )}
          <span>{children}</span>
          {RightIcon && (
            <span className="shrink-0 inline-flex items-center" aria-hidden="true">
              {renderIcon(RightIcon, 'w-4 h-4')}
            </span>
          )}
        </>
      )}
    </button>
  );
}

export default MedicalButton;
