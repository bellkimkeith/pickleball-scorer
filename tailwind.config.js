/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Court & Paddle palette (lib/theme/tokens.ts holds the same values
        // for SVG fills and other places NativeWind classes cannot reach).
        court: {
          outer: '#2d5a48',
          deep: '#1f4134',
          surface: '#23473a',
          inner: '#2c5c93',
          kitchen: '#3a6aa3',
          line: '#f4f6f2',
          lineText: '#1d3d31',
        },
        ink: {
          DEFAULT: '#f4f6f2',
          muted: '#b9cfc5',
        },
        deep: '#10231c',
        danger: '#ffb4a6',
        ball: '#e9e24a',
        paddle: {
          ochre: '#e3a33b',
          coral: '#e0634a',
          paper: '#f2efe8',
          sky: '#8fc3e6',
          carbon: '#2f3130',
          lilac: '#b9a6e0',
          sand: '#d9c39a',
          teal: '#4fb3a5',
        },

      },
    },
  },
  plugins: [],
};
