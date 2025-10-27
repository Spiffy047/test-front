/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#030213',
          foreground: '#ffffff',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#d4183d',
        info: '#3b82f6',
      },
    },
  },
  plugins: [],
}