/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        void: "#05060A",
        midnight: "#0B1020",
        ivory: "#F5F2EA",
        gold: {
          DEFAULT: "#D8B86A",
          bright: "#FCE9B8",
          deep: "#A9821F",
        },
        neon: "#7FB0FF",
      },
      fontFamily: {
        display: ['"Fraunces"', '"Noto Serif JP"', '"Playfair Display"', "Georgia", "serif"],
        sans: ['"Space Grotesk"', "Inter", '"Noto Serif JP"', "system-ui", "sans-serif"],
        body: ['"Inter"', '"Noto Serif JP"', "system-ui", "sans-serif"],
      },
      letterSpacing: {
        eyebrow: "0.32em",
      },
      transitionTimingFunction: {
        signature: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      maxWidth: {
        content: "1320px",
      },
    },
  },
  plugins: [],
};
