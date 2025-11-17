/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Thèmes personnalisés
        music: {
          primary: "#9333EA",
          secondary: "#A855F7",
        },
        coaching: {
          primary: "#0D9488",
          secondary: "#14B8A6",
        },
        section: {
          light: "#F8FAFC",
          dark: "#1E293B",
        },

        // Palette principale
        primary: {
          50: "#F3F0FF",
          100: "#E9E3FF",
          200: "#D4CAFD",
          300: "#B8A5FA",
          400: "#9B82F5",
          500: "#9333EA",
          600: "#7B28D9",
          700: "#6522BD",
          800: "#4F1C9B",
          900: "#3B1773",
        },
        accent: {
          50: "#EFFAF9",
          100: "#DEF5F3",
          200: "#BEEAE7",
          300: "#93DAD5",
          400: "#5DC4BC",
          500: "#0D9488",
          600: "#0B7E73",
          700: "#096B61",
          800: "#07544D",
          900: "#053F3A",
        },
        neutral: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
        warning: {
          100: "#FEF3C7",
          600: "#92400E",
        },
        info: {
          100: "#DBEAFF",
          800: "#1E3A8A",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
      },
      animation: {
        wave: "wave 3s ease-in-out infinite",
        ripple: "ripple 1.5s linear infinite",
        "fade-in": "fadeIn 0.5s ease-out",
      },
      keyframes: {
        wave: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        ripple: {
          "0%": { transform: "scale(0.8)", opacity: 1 },
          "100%": { transform: "scale(1.5)", opacity: 0 },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
      boxShadow: {
        soft: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        medium:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        hard: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "inherit",
            a: {
              color: "#0D9488",
              "&:hover": {
                color: "#14B8A6",
              },
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
