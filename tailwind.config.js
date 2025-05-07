/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy': {
          800: '#1e293b',
          900: '#0f172a',
        },
      },
    },
  },
  plugins: [],
}