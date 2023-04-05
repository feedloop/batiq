const { fontFamily } = require("tailwindcss/defaultTheme");
const daisyThemes = require("daisyui/src/colors/themes");

console.log(daisyThemes["[data-theme=light]"]);

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,md,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,md,mdx}",
    "./layouts/**/*.{js,ts,jsx,tsx,md,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", ...fontFamily.sans],
        mono: ["var(--font-inconsolata)", ...fontFamily.mono],
        serif: ["var(--font-lora)", ...fontFamily.serif],
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("daisyui"),
  ],
  daisyui: {
    themes: [
      {
        light: {
          ...daisyThemes["[data-theme=light]"],
          primary: "#33D1FF",
          secondary: "#2CFC8B",
          accent: "#9E92FF",
          "--btn-text-case": "capitalize",
        },
        dark: {
          ...daisyThemes["[data-theme=dark]"],
          primary: "#33D1FF",
          secondary: "#2CFC8B",
          accent: "#9E92FF",
          "--btn-text-case": "capitalize",
        },
      },
    ],
  },
};
