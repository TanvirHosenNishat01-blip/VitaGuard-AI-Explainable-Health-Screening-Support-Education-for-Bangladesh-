import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

const MAX_WIDTH_MAP = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

function AccessibleModal({
  isOpen,
  onClose,
  title,
  subtitle,
  size = 'md',
  footer,
  children,
  closeLabel = 'Close dialog',
}) {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      if (dialogRef.current) {
        const focusable = dialogRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable) {
          focusable.focus();
        } else {
          dialogRef.current.focus();
        }
      }
    }, 10);

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && typeof onClose === 'function') {
        event.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClass = MAX_WIDTH_MAP[size] || MAX_WIDTH_MAP.md;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0B1F31]/60 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget && typeof onClose === 'function') {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={subtitle ? descId : undefined}
        tabIndex={-1}
        className={`bg-white w-full ${widthClass} rounded-t-2xl sm:rounded-2xl border border-[#E2E8F0] shadow-clinical-lg overflow-hidden flex flex-col max-h-[90vh] focus:outline-none`}
      >
        {(title || subtitle || typeof onClose === 'function') && (
          <div className="px-5 sm:px-6 py-4 border-b border-[#E2E8F0] flex items-start justify-between gap-3 bg-white">
            <div className="min-w-0">
              {title && (
                <h2
                  id={titleId}
                  className="text-base sm:text-lg font-bold text-[#12304A] leading-snug"
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p id={descId} className="text-xs text-[#64748B] mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            {typeof onClose === 'function' && (
              <button
                type="button"
                onClick={onClose}
                aria-label={closeLabel}
                className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-xl text-[#64748B] hover:text-[#12304A] hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {children}
        </div>

        {footer && (
          <div className="px-5 sm:px-6 py-3.5 border-t border-[#E2E8F0] bg-[#F6F9FC] flex flex-wrap items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default AccessibleModal;
