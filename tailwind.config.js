/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'findtell': {
          'navy': '#1e3a8a',      // Deep blue from logo
          'blue': '#0ea5e9',      // Cyan blue from logo
          'purple': '#a855f7',    // Purple/magenta from logo
          'gray': '#6b7280',      // Gray from "FIND & TELL" text
        },
        'brand': {
          'primary': '#1e3a8a',   // Navy blue
          'secondary': '#0ea5e9', // Cyan
          'accent': '#a855f7',    // Purple
          'text': '#6b7280',      // Gray
        },
      },
      fontFamily: {
        'findtell': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
