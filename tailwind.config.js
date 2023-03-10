/** @type {import('tailwindcss').Config} */
module.exports = {
content: ["./views/**/*.hbs"],
  theme: {
    fontFamily: {
      sans: ["Inter", "sans-serif"],
    },
    extend: {
      colors: {
        primary: {
          50: "#ebecf1",
          100: "#d6dae3",
          200: "#adb4c8",
          300: "#848fac",
          400: "#5b6991",
          500: "#324475",
          600: "#28365e",
          700: "#1e2946",
          800: "#141b2f",
          900: "#0a0e17",
        },
        gray: {
          50: "#e8e8e8",
          100: "#d2d2d2",
          200: "#a4a4a4",
          300: "#777777",
          400: "#494949",
          500: "#1c1c1c",
          600: "#161616",
          700: "#111111",
          800: "#0b0b0b",
          900: "#060606",
        },
      },
    },
  },
  plugins: [],
}
