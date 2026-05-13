// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // ¡Esto es clave!
  theme: {
    extend: {},
  },
  plugins: [],
}