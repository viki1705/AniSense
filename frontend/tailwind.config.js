/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          900: '#0F0F1E',
          800: '#1A1A2E',
          700: '#16213E',
        },
        accent: {
          purple: '#9D4EDD',
          cyan: '#00F5FF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
