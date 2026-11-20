/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xs: '360px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
    },
    extend: {
      colors: {
        clinical: {
          navy: '#12304A',
          navyLight: '#1E4668',
          navyDark: '#0B1F31',
          teal: '#0D9488',
          tealHover: '#0F766E',
          tealLight: '#F0FDFA',
          tealBorder: '#99F6E4',
          bg: '#F6F9FC',
          surface: '#FFFFFF',
          border: '#E2E8F0',
          muted: '#64748B',
          success: '#15803D',
          successBg: '#DCFCE7',
          successBorder: '#BBF7D0',
          warning: '#D97706',
          warningText: '#B45309',
          warningBg: '#FEF3C7',
          warningBorder: '#FDE68A',
          critical: '#DC2626',
          criticalText: '#B91C1C',
          criticalBg: '#FEE2E2',
          criticalBorder: '#FECACA',
        },
      },
      fontFamily: {
        sans: ['Inter', '"Noto Sans Bengali"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', '"Noto Sans Bengali"', 'system-ui', 'sans-serif'],
        bengali: ['"Noto Sans Bengali"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'clinical-xs': '0 1px 2px 0 rgba(18, 48, 74, 0.05)',
        'clinical-sm': '0 1px 3px 0 rgba(18, 48, 74, 0.08), 0 1px 2px -1px rgba(18, 48, 74, 0.04)',
        'clinical-md': '0 4px 6px -1px rgba(18, 48, 74, 0.08), 0 2px 4px -2px rgba(18, 48, 74, 0.04)',
        'clinical-lg': '0 10px 15px -3px rgba(18, 48, 74, 0.08), 0 4px 6px -4px rgba(18, 48, 74, 0.04)',
      },
      borderRadius: {
        clinical: '0.75rem',
        'clinical-lg': '1rem',
      },
    },
  },
  plugins: [],
};
//Done
