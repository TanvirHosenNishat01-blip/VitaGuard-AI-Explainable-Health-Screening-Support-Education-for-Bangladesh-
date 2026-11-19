import React from 'react';

const MAX_WIDTH_CLASSES = {
  narrow: 'max-w-4xl',
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
  full: 'max-w-full',
};

function PageContainer({
  children,
  size = 'default',
  as: Component = 'main',
  className = '',
  ...rest
}) {
  const widthClass = MAX_WIDTH_CLASSES[size] || MAX_WIDTH_CLASSES.default;

  return (
    <Component
      className={`w-full ${widthClass} mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}

export default PageContainer;
