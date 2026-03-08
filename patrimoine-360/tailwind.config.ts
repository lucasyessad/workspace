import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Navy institutional palette (inspired by mont-fort.com)
        navy: {
          50: "#f0f3f9",
          100: "#dce3f0",
          200: "#bcc9e3",
          300: "#8da4cf",
          400: "#6079b5",
          500: "#3d569c",
          600: "#2f4483",
          700: "#28386b",
          800: "#243059",
          900: "#1a2340",
          950: "#0f1628",
        },
        // Gold accent palette
        gold: {
          50: "#fdf9ef",
          100: "#faf0d5",
          200: "#f4deaa",
          300: "#edc974",
          400: "#e5b044",
          500: "#dc9a28",
          600: "#c47a1e",
          700: "#a35b1b",
          800: "#85481d",
          900: "#6e3c1b",
          950: "#3e1e0b",
        },
        // Semantic colors
        success: {
          DEFAULT: "#22c55e",
          50: "#f0fdf4",
          100: "#dcfce7",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
        },
        warning: {
          DEFAULT: "#f59e0b",
          50: "#fffbeb",
          100: "#fef3c7",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        danger: {
          DEFAULT: "#ef4444",
          50: "#fef2f2",
          100: "#fee2e2",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
        },
        // Legacy accent (for compatibility)
        accent: {
          primary: "#818CF8",
          secondary: "#6366F1",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "display-xl": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-lg": ["2.75rem", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.015em", fontWeight: "700" }],
        "heading-xl": ["1.75rem", { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "600" }],
        "heading-lg": ["1.5rem", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" }],
        "heading": ["1.25rem", { lineHeight: "1.35", letterSpacing: "-0.005em", fontWeight: "600" }],
        "body-lg": ["1.0625rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body": ["0.9375rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.5", fontWeight: "400" }],
        "caption": ["0.75rem", { lineHeight: "1.5", fontWeight: "500" }],
        "overline": ["0.6875rem", { lineHeight: "1.4", letterSpacing: "0.08em", fontWeight: "600" }],
      },
      spacing: {
        "4.5": "1.125rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "18": "4.5rem",
        "22": "5.5rem",
        "sidebar": "16.5rem",
        "sidebar-collapsed": "4.5rem",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        "premium-xs": "0 1px 2px 0 rgba(15, 22, 40, 0.05)",
        "premium-sm": "0 1px 3px 0 rgba(15, 22, 40, 0.08), 0 1px 2px -1px rgba(15, 22, 40, 0.08)",
        "premium": "0 4px 6px -1px rgba(15, 22, 40, 0.08), 0 2px 4px -2px rgba(15, 22, 40, 0.06)",
        "premium-md": "0 8px 16px -4px rgba(15, 22, 40, 0.1), 0 4px 6px -2px rgba(15, 22, 40, 0.05)",
        "premium-lg": "0 16px 32px -8px rgba(15, 22, 40, 0.12), 0 8px 16px -4px rgba(15, 22, 40, 0.08)",
        "gold-glow": "0 4px 16px -2px rgba(220, 154, 40, 0.25)",
        "navy-glow": "0 4px 16px -2px rgba(26, 35, 64, 0.4)",
        "dark-sm": "0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)",
        "dark-md": "0 8px 16px -4px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
        "dark-lg": "0 16px 32px -8px rgba(0, 0, 0, 0.5), 0 8px 16px -4px rgba(0, 0, 0, 0.3)",
        "inner-light": "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
      },
      backgroundImage: {
        "gradient-gold": "linear-gradient(135deg, #e5b044 0%, #dc9a28 50%, #c47a1e 100%)",
        "gradient-navy": "linear-gradient(135deg, #1a2340 0%, #0f1628 100%)",
        "gradient-premium": "linear-gradient(135deg, #1a2340 0%, #2f4483 50%, #3d569c 100%)",
        "gradient-surface": "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
        "gradient-hero": "radial-gradient(ellipse at 50% 0%, rgba(220,154,40,0.08) 0%, transparent 60%)",
        "gradient-sidebar": "linear-gradient(180deg, #1a2340 0%, #0f1628 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
