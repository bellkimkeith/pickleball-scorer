/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Pickleball-themed color palette
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        secondary: {
          500: '#3b82f6',
          600: '#2563eb',
        },
        accent: {
          yellow: '#fbbf24',
          orange: '#f97316',
        },
        team1: '#16a34a',
        team2: '#f97316',
      },
    },
  },
  plugins: [],
};
