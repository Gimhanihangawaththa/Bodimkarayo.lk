/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e3a8a',
        secondary: '#3b82f6',
        dark: '#1a1a2e',
        light: '#f9fafb',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #6366f1 100%)',
      },
    },
  },
  plugins: [],
}
