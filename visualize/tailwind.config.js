/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bdgreen: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#006a4e',
          600: '#005840',
          700: '#004734',
        },
        bdred: {
          500: '#f42a41',
          600: '#d91e33',
        }
      }
    },
  },
  plugins: [],
};
