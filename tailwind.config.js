/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          // Primary gold palette
          gold: '#ecd862',
          'gold-dark': '#ddab33',
          'gold-light': '#f2cb50',
          amber: '#c3802d',
          'amber-dark': '#a3671d',
          // Neutral dark surfaces
          bg: '#0f0b05',
          surface: '#1e1508',
          'surface-2': '#2e200e',
          ink: '#f0ddb0',
          'ink-muted': '#c4a46b',
          'ink-dim': '#7a5e35',
          // Legacy aliases (kept so old references keep rendering in the gold theme)
          orange: '#ecd862',
          'orange-dark': '#ddab33',
          'orange-light': '#f2cb50',
          teal: '#c3802d',
          'teal-dark': '#a3671d',
          'teal-light': '#ddab33',
          navy: '#1e1508',
          'navy-dark': '#0f0b05',
          'navy-light': '#2e200e',
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.08)',
        'panel': '0 8px 32px 0 rgba(0,0,0,0.12)',
        'modal': '0 20px 60px 0 rgba(0,0,0,0.2)',
      },
      animation: {
        'slide-in-right': 'slideInRight 0.25s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'task-enter': 'taskCardEnter 0.2s ease-out',
      },
      keyframes: {
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        taskCardEnter: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};