import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
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
    },
  },
  plugins: [],
};
export default config;
