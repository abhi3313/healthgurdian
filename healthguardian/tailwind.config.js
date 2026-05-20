/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eff8ff',
          100: '#daf0fe',
          200: '#bee3fd',
          300: '#91d1fb',
          400: '#5db6f7',
          500: '#3897f0',
          600: '#1a77e5',
          700: '#1560c8',
          800: '#174fa3',
          900: '#194481',
          950: '#132b50',
        },
        accent: {
          DEFAULT: '#00e5c3',
          dark:    '#00b89c',
        },
        surface: {
          DEFAULT: '#0f1623',
          card:    '#151e2e',
          border:  '#1e2d42',
          muted:   '#1a2438',
        },
        danger:  '#f5365c',
        warning: '#fb8c00',
        success: '#2dce89',
      },
      fontFamily: {
        sans:    ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        xl:    '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        card:        '0 4px 24px rgba(0,0,0,0.25)',
        glow:        '0 0 24px rgba(0,229,195,0.18)',
        'glow-blue': '0 0 32px rgba(56,151,240,0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':  'spin 8s linear infinite',
        'float':      'float 6s ease-in-out infinite',
        'shimmer':    'shimmer 1.5s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
