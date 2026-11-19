import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import MedicalButton from './MedicalButton';
import { renderIcon } from './renderIcon';

function EmptyState({
  icon: Icon = ClipboardList,
  title = 'No records available yet',
  description = 'Once assessments or activities are recorded, they will appear here.',
  actionLabel,
  onAction,
  actionTo,
  secondaryAction,
  className = '',
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-dashed border-[#CBD5E1] p-8 sm:p-10 text-center flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <div
        className="w-12 h-12 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] text-[#0D9488] flex items-center justify-center"
        aria-hidden="true"
      >
        {renderIcon(Icon, 'w-6 h-6')}
      </div>

      <div className="space-y-1 max-w-md">
        <h3 className="text-base font-bold text-[#12304A]">{title}</h3>
        {description && (
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {(actionLabel || secondaryAction) && (
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          {actionLabel && actionTo ? (
            <Link
              to={actionTo}
              className="inline-flex items-center justify-center min-h-[48px] sm:min-h-[44px] px-5 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-semibold rounded-xl shadow-clinical-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2"
            >
              {actionLabel}
            </Link>
          ) : actionLabel && onAction ? (
            <MedicalButton variant="primary" size="md" onClick={onAction}>
              {actionLabel}
            </MedicalButton>
          ) : null}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
