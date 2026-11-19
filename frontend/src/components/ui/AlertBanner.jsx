import React from 'react';
import {
  Info,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  ShieldAlert,
  X,
} from 'lucide-react';

const BANNER_STYLES = {
  info: {
    shell: 'bg-[#F6F9FC] border-[#E2E8F0] border-l-4 border-l-[#12304A] text-[#12304A]',
    iconColor: 'text-[#12304A]',
    titleColor: 'text-[#12304A]',
    bodyColor: 'text-slate-700',
    Icon: Info,
    defaultRole: 'status',
  },
  teal: {
    shell: 'bg-[#F0FDFA] border-[#99F6E4] border-l-4 border-l-[#0D9488] text-[#12304A]',
    iconColor: 'text-[#0D9488]',
    titleColor: 'text-[#0F766E]',
    bodyColor: 'text-slate-700',
    Icon: ShieldAlert,
    defaultRole: 'status',
  },
  success: {
    shell: 'bg-[#DCFCE7]/60 border-[#BBF7D0] border-l-4 border-l-[#15803D] text-[#12304A]',
    iconColor: 'text-[#15803D]',
    titleColor: 'text-[#15803D]',
    bodyColor: 'text-slate-800',
    Icon: CheckCircle2,
    defaultRole: 'status',
  },
  warning: {
    shell: 'bg-[#FEF3C7]/70 border-[#FDE68A] border-l-4 border-l-[#D97706] text-[#12304A]',
    iconColor: 'text-[#B45309]',
    titleColor: 'text-[#92400E]',
    bodyColor: 'text-amber-950',
    Icon: AlertTriangle,
    defaultRole: 'alert',
  },
  critical: {
    shell: 'bg-[#FEE2E2]/70 border-[#FECACA] border-l-4 border-l-[#DC2626] text-[#12304A]',
    iconColor: 'text-[#DC2626]',
    titleColor: 'text-[#991B1B]',
    bodyColor: 'text-red-950',
    Icon: AlertOctagon,
    defaultRole: 'alert',
  },
};

function AlertBanner({
  tone = 'info',
  title,
  children,
  icon: CustomIcon = null,
  action,
  onDismiss,
  role,
  className = '',
}) {
  const style = BANNER_STYLES[tone] || BANNER_STYLES.info;
  const IconComponent = CustomIcon || style.Icon;
  const computedRole = role || style.defaultRole;

  return (
    <div
      role={computedRole}
      aria-live={computedRole === 'alert' ? 'assertive' : 'polite'}
      className={`p-4 sm:p-5 rounded-xl border shadow-clinical-xs flex items-start justify-between gap-3 ${style.shell} ${className}`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {IconComponent && (
          <IconComponent
            className={`w-5 h-5 shrink-0 mt-0.5 ${style.iconColor}`}
            aria-hidden="true"
          />
        )}
        <div className="space-y-1 min-w-0 flex-1">
          {title && (
            <h4 className={`text-sm font-bold leading-snug ${style.titleColor}`}>
              {title}
            </h4>
          )}
          {children && (
            <div className={`text-xs sm:text-sm leading-relaxed ${style.bodyColor}`}>
              {children}
            </div>
          )}
          {action && <div className="pt-2">{action}</div>}
        </div>
      </div>

      {typeof onDismiss === 'function' && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="p-1.5 rounded-lg text-slate-500 hover:text-[#12304A] hover:bg-black/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export default AlertBanner;
