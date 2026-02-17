/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        uclaBlue: "#2d68c4",
        darkSlate: "#0f172a",
        slateGray: "#64748b",
        lightSlate: "#94a3b8",
        border: "#e2e8f0",
        borderLight: "#f1f5f9",
        tagBg: "#f8fafc",
        background: "#efefef",
      },
      fontFamily: {
        sans: ["Helvetica Neue", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
