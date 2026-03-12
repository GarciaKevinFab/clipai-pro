/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        bg: '#07090f',
        surface: '#0c1018',
        card: '#111827',
        accent: '#3b82f6',
        accent2: '#6366f1',
        green: '#10b981',
        gold: '#f59e0b',
        pink: '#ec4899',
        red: '#ef4444',
        text: '#f1f5f9',
        muted: '#64748b',
        muted2: '#94a3b8',
      },
    },
  },
  plugins: [],
}
