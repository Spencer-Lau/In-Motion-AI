/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [ // add paths to all template files (HTML, JS, JSX, TSX, etc.)
    './public/**/*.html', // includes the index.html file
    './src/**/*.{js,jsx,ts,tsx}', // includes the JS/JSX/TS/TSX files inside the src directory
  ],
  theme: {
    extend: { // customize theme here if needed (e.g., colors, fonts, spacing)
    },
  },
  plugins: [
    // add any needed Tailwind CSS plugins
  ],
}