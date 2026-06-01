/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Loksewa AI brand palette
        primary: {
          50: "#eef9f3",
          100: "#d6f1e2",
          200: "#aee3c6",
          300: "#7dd0a3",
          400: "#4dbb81",
          500: "#2ea667",
          600: "#1f8852",
          700: "#1a6c43",
          800: "#175638",
          900: "#13472f",
        },
        accent: {
          50: "#fef7ed",
          100: "#fdedd3",
          200: "#fbd8a5",
          300: "#f8bd6d",
          400: "#f59936",
          500: "#f37b14",
          600: "#e35e0a",
          700: "#bc450b",
          800: "#963910",
          900: "#793211",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        display: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
