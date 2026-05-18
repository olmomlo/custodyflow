/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      colors: {
        padre: {
          bg: '#d1fae5',
          bgHover: '#a7f3d0',
          border: '#6ee7b7',
          text: '#047857',
          accent: '#10b981',
          deep: '#065f46',
        },
        madre: {
          bg: '#ede9fe',
          bgHover: '#ddd6fe',
          border: '#c4b5fd',
          text: '#6d28d9',
          accent: '#8b5cf6',
          deep: '#5b21b6',
        },
        festivo: '#dc2626',
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 4px -1px rgb(0 0 0 / 0.06)',
        card: '0 4px 12px -2px rgb(0 0 0 / 0.06), 0 2px 6px -1px rgb(0 0 0 / 0.04)',
        modal: '0 20px 50px -10px rgb(0 0 0 / 0.2), 0 8px 20px -4px rgb(0 0 0 / 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'pop': 'pop 0.15s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(0.96)' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
