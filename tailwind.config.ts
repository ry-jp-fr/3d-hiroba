import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#ff6b3d",
          dark: "#e05528",
          light: "#ffe5d8",
        },
        ink: {
          DEFAULT: "#1b1b1f",
          muted: "#5f5f68",
        },
        paper: "#fbfaf6",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'Hiragino Sans'",
          "'Noto Sans JP'",
          "'Yu Gothic'",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
