/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/tailwindcss-primeui/**/*.{js,ts}",
  ],
  safelist: [],
  theme: {
    extend: {},
  },
  plugins: ["tailwindcss-primeui"],
};
