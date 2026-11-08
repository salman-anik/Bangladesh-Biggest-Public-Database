/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bdGreen: '#006A4E',
        bdRed: '#F42A41',
      }
    },
  },
  plugins: [],
}
