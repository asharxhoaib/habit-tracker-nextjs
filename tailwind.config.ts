import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f5ff",
          100: "#dbe6ff",
          200: "#b8ccff",
          300: "#8aa8ff",
          400: "#5c7fff",
          500: "#3a56f5",
          600: "#2c3fd1",
          700: "#2331a8",
          800: "#1c2782",
          900: "#171f66",
        },
      },
      keyframes: {
        "confetti-fall": {
          "0%": { transform: "translateY(-20px) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(120px) rotate(360deg)", opacity: "0" },
        },
        "pop-in": {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "confetti-fall": "confetti-fall 900ms ease-out forwards",
        "pop-in": "pop-in 300ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
