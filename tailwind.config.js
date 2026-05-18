/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#e0f7ff",
          100: "#b3eaff",
          200: "#80d8ff",
          300: "#4dc6ff",
          400: "#26b8f5",
          500: "#00B4D8",   // primary teal
          600: "#0096C7",   // hover teal
          700: "#0077B6",   // deep blue
          800: "#023E8A",   // dark navy
          900: "#03045E",   // darkest navy
        },
      },
      fontFamily: {
        sans: ["Inter", "Nunito", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 12px 0 rgba(0,0,0,0.08)",
        "card-hover": "0 6px 24px 0 rgba(0,0,0,0.14)",
        navbar: "0 2px 16px 0 rgba(0,0,0,0.08)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
