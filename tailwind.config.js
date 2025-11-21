/** @type {import('tailwindcss').Config} */
module.exports = {
  // Point to ALL your apps and libs so Tailwind scans them for classes
  content: [
    './apps/**/*.{js,ts,jsx,tsx}',
    './libs/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          900: '#064e3b',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          800: '#1e293b',
          900: '#0f172a',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // <--- ADD THIS
  ],
};