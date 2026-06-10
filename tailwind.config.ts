import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--c-bg) / <alpha-value>)",
        canvas2: "rgb(var(--c-bg2) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        line: "rgb(var(--c-border) / <alpha-value>)",
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        soft: "rgb(var(--c-muted) / <alpha-value>)",
        sage: {
          DEFAULT: "rgb(var(--c-accent) / <alpha-value>)",
          deep: "rgb(var(--c-accent-deep) / <alpha-value>)",
        },
        gold: "rgb(var(--c-gold) / <alpha-value>)",
        /* Legacy aliases — map old utility names onto theme tokens so
           every page is themed (incl. dark mode) without rewrites. */
        slate: {
          50: "rgb(var(--c-bg2) / <alpha-value>)",
          100: "rgb(var(--c-border) / 0.55)",
          200: "rgb(var(--c-border) / <alpha-value>)",
          300: "rgb(var(--c-border) / <alpha-value>)",
          400: "rgb(var(--c-muted) / 0.75)",
          500: "rgb(var(--c-muted) / <alpha-value>)",
          600: "rgb(var(--c-muted) / <alpha-value>)",
          700: "rgb(var(--c-ink) / 0.85)",
          800: "rgb(var(--c-ink) / <alpha-value>)",
          900: "rgb(var(--c-ink) / <alpha-value>)",
        },
        primary: {
          50: "rgb(var(--c-accent) / 0.10)",
          100: "rgb(var(--c-accent) / 0.18)",
          500: "rgb(var(--c-accent) / <alpha-value>)",
          600: "rgb(var(--c-accent-deep) / <alpha-value>)",
          700: "rgb(var(--c-accent-deep) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "var(--font-hebrew)", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "var(--font-hebrew)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
      },
      boxShadow: {
        card: "0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px -12px rgb(var(--c-shadow) / 0.12)",
        lift: "0 2px 4px rgb(0 0 0 / 0.05), 0 16px 40px -16px rgb(var(--c-shadow) / 0.25)",
      },
      animation: {
        "drift-slow": "drift 22s ease-in-out infinite alternate",
        "drift-slower": "drift 30s ease-in-out infinite alternate-reverse",
        shimmer: "shimmer 3s ease-in-out infinite",
      },
      keyframes: {
        drift: {
          "0%": { transform: "translate3d(-6%, -4%, 0) scale(1)" },
          "100%": { transform: "translate3d(6%, 5%, 0) scale(1.15)" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.65" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
