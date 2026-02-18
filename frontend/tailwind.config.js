/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4fbf8",
          100: "#dff3ea",
          500: "#0e8a6a",
          700: "#0b5b47",
          900: "#08382d"
        }
      },
      animation: {
        pop: "pop .3s ease-out"
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(0.95)", opacity: "0.6" },
          "100%": { transform: "scale(1)", opacity: "1" }
        }
      }
    }
  },
  plugins: []
};
