/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        tool: ['IBM Plex Sans', 'sans-serif'],
      },
      colors: {
        accent: '#4f85e5',
        cyan: '#61afef',
      },
    },
  },
  plugins: [],
}
