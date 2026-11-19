import React from 'react';
import { renderIcon } from './renderIcon';

const TONE_CLASSES = {
  default: 'bg-white border-[#E2E8F0]',
  navy: 'bg-white border-[#12304A]/20 border-t-4 border-t-[#12304A]',
  teal: 'bg-white border-[#99F6E4] border-t-4 border-t-[#0D9488]',
  success: 'bg-white border-[#BBF7D0] border-t-4 border-t-[#15803D]',
  warning: 'bg-white border-[#FDE68A] border-t-4 border-t-[#D97706]',
  critical: 'bg-white border-[#FECACA] border-t-4 border-t-[#DC2626]',
  muted: 'bg-[#F6F9FC] border-[#E2E8F0]',
};

const PADDING_CLASSES = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

function ClinicalCard({
  title,
  subtitle,
  icon: Icon = null,
  headerAction,
  footer,
  tone = 'default',
  padding = 'md',
  interactive = false,
  onClick,
  as: Component = 'div',
  className = '',
  bodyClassName = '',
  children,
  ...rest
}) {
  const toneClass = TONE_CLASSES[tone] || TONE_CLASSES.default;
  const padClass = PADDING_CLASSES[padding] ?? PADDING_CLASSES.md;
  const isClickable = interactive || typeof onClick === 'function';

  const handleKeyDown = (e) => {
    if (typeof onClick === 'function' && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <Component
      onClick={onClick}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      tabIndex={isClickable ? 0 : undefined}
      role={typeof onClick === 'function' ? 'button' : undefined}
      className={`rounded-2xl border shadow-clinical-xs transition-shadow duration-150 ${toneClass} ${
        isClickable
          ? 'hover:shadow-clinical-md hover:border-slate-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2'
          : ''
      } ${className}`}
      {...rest}
    >
      {(title || subtitle || Icon || headerAction) && (
        <div
          className={`flex flex-wrap items-start justify-between gap-3 ${
            padding === 'none' ? 'px-5 pt-5 pb-4 border-b border-[#E2E8F0]' : 'px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-[#E2E8F0]'
          }`}
        >
          <div className="flex items-start gap-3 min-w-0">
            {Icon && (
              <div
                className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] text-[#0D9488] flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                {renderIcon(Icon, 'w-5 h-5')}
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="text-base sm:text-lg font-bold text-[#12304A] leading-snug">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs sm:text-sm text-[#64748B] mt-0.5 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}

      <div className={`${padClass} ${bodyClassName}`}>{children}</div>

      {footer && (
        <div className="px-5 sm:px-6 py-3.5 bg-[#F6F9FC] border-t border-[#E2E8F0] rounded-b-2xl">
          {footer}
        </div>
      )}
    </Component>
  );
}

export default ClinicalCard;
