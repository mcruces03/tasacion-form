/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        oliva: {
          50: '#f9fae8',
          100: '#f2f4c4',
          200: '#e4ea8e',
          300: '#d0dc56',
          400: '#b8c730',
          500: '#a0af1f',
          600: '#7d8b16',
          700: '#5e6914',
          800: '#4b5416',
          900: '#3f4617',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          150: '#e8eef4',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
        },
      },
    },
  },
  plugins: [],
}
