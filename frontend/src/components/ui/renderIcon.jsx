import React from 'react';

export function isIconComponent(icon) {
  if (!icon || React.isValidElement(icon)) return false;
  if (typeof icon === 'function') return true;
  return typeof icon === 'object' && Boolean(icon.$$typeof);
}

export function renderIcon(icon, className) {
  if (!icon) return null;
  if (React.isValidElement(icon)) return icon;
  if (isIconComponent(icon)) {
    const IconComponent = icon;
    return <IconComponent className={className} aria-hidden="true" />;
  }
  return null;
}
