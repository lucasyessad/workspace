import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50:  "var(--brand-50,  #e8f5ee)",
          100: "var(--brand-100, #c5e8d3)",
          200: "var(--brand-200, #9ed9b5)",
          300: "var(--brand-300, #6dc897)",
          400: "var(--brand-400, #3fb877)",
          500: "var(--brand-500, #18753c)",
          600: "var(--brand-600, #115d2f)",
          700: "var(--brand-700, #0b4a24)",
          800: "var(--brand-800, #073618)",
          900: "var(--brand-900, #04220e)",
        },
        energy: {
          A: "#00a84f",
          B: "#52b748",
          C: "#c8d200",
          D: "#f7e400",
          E: "#f0a500",
          F: "#e8500a",
          G: "#cc0000",
        },
      },
      borderRadius: {
        DEFAULT: "4px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
