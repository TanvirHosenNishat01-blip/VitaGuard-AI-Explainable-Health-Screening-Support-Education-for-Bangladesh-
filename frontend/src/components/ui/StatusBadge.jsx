import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  ShieldCheck,
  Clock,
} from 'lucide-react';

const TONE_MAP = {
  low: {
    bg: 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]',
    Icon: CheckCircle2,
    defaultLabel: 'Low Risk',
  },
  success: {
    bg: 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]',
    Icon: CheckCircle2,
    defaultLabel: 'Normal',
  },
  approved: {
    bg: 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]',
    Icon: ShieldCheck,
    defaultLabel: 'Approved',
  },
  confirmed: {
    bg: 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]',
    Icon: CheckCircle2,
    defaultLabel: 'Confirmed',
  },
  moderate: {
    bg: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
    Icon: AlertTriangle,
    defaultLabel: 'Moderate Risk',
  },
  warning: {
    bg: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
    Icon: AlertTriangle,
    defaultLabel: 'Attention Needed',
  },
  pending: {
    bg: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
    Icon: Clock,
    defaultLabel: 'Pending',
  },
  high: {
    bg: 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]',
    Icon: AlertOctagon,
    defaultLabel: 'High Risk',
  },
  critical: {
    bg: 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]',
    Icon: AlertOctagon,
    defaultLabel: 'High Risk',
  },
  rejected: {
    bg: 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]',
    Icon: AlertOctagon,
    defaultLabel: 'Declined',
  },
  declined: {
    bg: 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]',
    Icon: AlertOctagon,
    defaultLabel: 'Declined',
  },
  info: {
    bg: 'bg-[#F0FDFA] text-[#0F766E] border-[#99F6E4]',
    Icon: Info,
    defaultLabel: 'Information',
  },
  teal: {
    bg: 'bg-[#F0FDFA] text-[#0F766E] border-[#99F6E4]',
    Icon: ShieldCheck,
    defaultLabel: 'Active',
  },
  neutral: {
    bg: 'bg-slate-100 text-[#12304A] border-[#E2E8F0]',
    Icon: Info,
    defaultLabel: 'Status',
  },
};

const SIZE_MAP = {
  sm: 'px-2.5 py-0.5 text-[11px] gap-1',
  md: 'px-3 py-1 text-xs gap-1.5',
  lg: 'px-3.5 py-1.5 text-sm gap-2',
};

function resolveTone(tone, statusText) {
  if (tone && TONE_MAP[tone]) return TONE_MAP[tone];
  const raw = String(statusText || tone || '').toLowerCase();
  if (raw.includes('high') || raw.includes('critical') || raw.includes('reject') || raw.includes('decline')) {
    return TONE_MAP.high;
  }
  if (raw.includes('moderate') || raw.includes('medium') || raw.includes('warn') || raw.includes('pending') || raw.includes('wait')) {
    return TONE_MAP.moderate;
  }
  if (raw.includes('low') || raw.includes('normal') || raw.includes('clear') || raw.includes('approv') || raw.includes('confirm') || raw.includes('stable')) {
    return TONE_MAP.low;
  }
  if (raw.includes('info') || raw.includes('teal')) {
    return TONE_MAP.info;
  }
  return TONE_MAP.neutral;
}

function StatusBadge({
  tone,
  status,
  label,
  size = 'md',
  showIcon = true,
  customIcon: CustomIcon = null,
  className = '',
  children,
}) {
  const displayLabel = children || label || status;
  const resolved = resolveTone(tone, displayLabel);
  const IconComponent = CustomIcon || resolved.Icon;
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border leading-snug select-none ${resolved.bg} ${sizeClass} ${className}`}
    >
      {showIcon && IconComponent && (
        <IconComponent
          className={size === 'lg' ? 'w-4 h-4 shrink-0' : 'w-3.5 h-3.5 shrink-0'}
          aria-hidden="true"
        />
      )}
      <span>{displayLabel || resolved.defaultLabel}</span>
    </span>
  );
}

export default StatusBadge;
