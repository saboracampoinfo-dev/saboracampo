import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Colores principales
        primary: {
          DEFAULT: "#D06428",
          50: "#FDF5F0",
          100: "#FBEBE1",
          200: "#F7D7C3",
          300: "#F3C3A5",
          400: "#EFAF87",
          500: "#D06428",
          600: "#B85420",
          700: "#8F4119",
          800: "#662E12",
          900: "#3D1B0B",
          950: "#1F0E06",
        },
        secondary: {
          DEFAULT: "#1A371F",
          50: "#E8F5EA",
          100: "#D1EBD5",
          200: "#A3D7AB",
          300: "#75C381",
          400: "#47AF57",
          500: "#1A371F",
          600: "#152C19",
          700: "#102113",
          800: "#0B160D",
          900: "#060B07",
          950: "#030503",
        },
        dark: {
          DEFAULT: "#111111",
          50: "#F5F5F5",
          100: "#E8E8E8",
          200: "#D1D1D1",
          300: "#BABABA",
          400: "#A3A3A3",
          500: "#6B6B6B",
          600: "#555555",
          700: "#3D3D3D",
          800: "#262626",
          900: "#111111",
          950: "#080808",
        },
        light: {
          DEFAULT: "#F8FAFD",
          50: "#FFFFFF",
          100: "#FFFFFF",
          200: "#FFFFFF",
          300: "#FFFFFF",
          400: "#FDFDFE",
          500: "#F8FAFD",
          600: "#D9E4F5",
          700: "#BACFED",
          800: "#9BB9E5",
          900: "#7CA4DD",
          950: "#6896D8",
        },
        // Aliases para modo claro/oscuro
        background: {
          light: "#F8FAFD",
          dark: "#111111",
        },
        foreground: {
          light: "#111111",
          dark: "#F8FAFD",
        },
        // Colores semánticos
        success: {
          light: "#1A371F",
          dark: "#47AF57",
        },
        warning: {
          light: "#D06428",
          dark: "#F3C3A5",
        },
        error: {
          light: "#DC2626",
          dark: "#FCA5A5",
        },
        info: {
          light: "#2563EB",
          dark: "#93C5FD",
        },
      },
      backgroundColor: {
        base: "var(--bg-base)",
        surface: "var(--bg-surface)",
        elevated: "var(--bg-elevated)",
      },
      textColor: {
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        tertiary: "var(--text-tertiary)",
      },
      borderColor: {
        DEFAULT: "var(--border-color)",
      },
    },
  },
  plugins: [],
};

export default config;
