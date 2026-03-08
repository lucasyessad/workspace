import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0B0F1A",
          surface: "rgba(255,255,255,0.03)",
          border: "rgba(255,255,255,0.08)",
        },
        accent: {
          primary: "#818CF8",
          secondary: "#6366F1",
        },
        success: "#4ADE80",
        warning: "#FACC15",
        danger: "#EF4444",
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
