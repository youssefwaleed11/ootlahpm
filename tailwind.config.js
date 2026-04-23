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
        arabic: ['Cairo', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          gold: '#ecd862',
          'gold-dark': '#f2cb50',
          'gold-light': '#f5e389',
          amber: '#ddab33',
          bronze: '#c3802d',
          'bronze-dark': '#a3671d',
          navy: '#1e1508',
          'navy-dark': '#0f0b05',
          'navy-light': '#2e200e',
          orange: '#ecd862',
          'orange-dark': '#f2cb50',
          'orange-light': '#f5e389',
        },
        surface: {
          DEFAULT: '#1e1508',
          dark: '#0f0b05',
          light: '#2e200e',
        },
        content: {
          primary: '#f0ddb0',
          secondary: '#c4a46b',
          muted: '#7a5e35',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.35), 0 1px 2px -1px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.4), 0 2px 4px -1px rgba(0,0,0,0.3)',
        panel: '0 8px 32px 0 rgba(0,0,0,0.4)',
        modal: '0 20px 60px 0 rgba(0,0,0,0.5)',
        'gold-glow': '0 0 0 1px rgba(236,216,98,0.2), 0 4px 16px -4px rgba(236,216,98,0.3)',
      },
      animation: {
        'slide-in-right': 'slideInRight 0.25s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'task-enter': 'taskCardEnter 0.2s ease-out',
        shimmer: 'shimmer 1.5s infinite',
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
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      backgroundImage: {
        shimmer:
          'linear-gradient(90deg, #1e1508 25%, #2e200e 50%, #1e1508 75%)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
