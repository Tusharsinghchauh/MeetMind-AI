/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "Space Grotesk", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        soft: "0 20px 44px -22px rgba(15, 66, 56, 0.45)",
      },
    },
  },
  plugins: [],
};
