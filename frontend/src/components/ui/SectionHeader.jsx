import React from 'react';

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  badge,
  actions,
  align = 'left',
  size = 'md',
  as: HeadingTag = 'h1',
  className = '',
}) {
  const isCenter = align === 'center';

  const titleSizeClass =
    size === 'lg'
      ? 'text-2xl sm:text-3xl font-extrabold'
      : size === 'sm'
      ? 'text-lg sm:text-xl font-bold'
      : 'text-xl sm:text-2xl font-extrabold';

  return (
    <div
      className={`flex flex-col ${
        isCenter
          ? 'items-center text-center'
          : 'sm:flex-row sm:items-center sm:justify-between'
      } gap-4 ${className}`}
    >
      <div className="space-y-1 min-w-0">
        {(eyebrow || badge) && (
          <div
            className={`flex flex-wrap items-center gap-2 ${
              isCenter ? 'justify-center' : ''
            }`}
          >
            {eyebrow && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D9488]">
                {eyebrow}
              </span>
            )}
            {badge}
          </div>
        )}

        {title && (
          <HeadingTag
            className={`${titleSizeClass} text-[#12304A] tracking-tight leading-snug`}
          >
            {title}
          </HeadingTag>
        )}

        {subtitle && (
          <p className="text-xs sm:text-sm text-[#64748B] max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

export default SectionHeader;
