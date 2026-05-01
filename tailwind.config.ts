import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#f9faf5",
        surface: "#f9faf5",
        "surface-dim": "#dadad6",
        "surface-bright": "#f9faf5",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f4ef",
        "surface-container": "#eeeeea",
        "surface-container-high": "#e8e8e4",
        "surface-container-highest": "#e2e3de",
        "surface-variant": "#e2e3de",
        outline: "#727971",
        "outline-variant": "#c1c8bf",
        primary: "#406749",
        "primary-container": "#8fb996",
        "primary-fixed": "#c1edc8",
        "primary-fixed-dim": "#a6d1ad",
        secondary: "#59579a",
        "secondary-container": "#b7b4fe",
        "secondary-fixed": "#e3dfff",
        "secondary-fixed-dim": "#c3c0ff",
        tertiary: "#944748",
        "tertiary-container": "#f49595",
        "tertiary-fixed": "#ffdad9",
        "tertiary-fixed-dim": "#ffb3b2",
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-background": "#1a1c1a",
        "on-surface": "#1a1c1a",
        "on-surface-variant": "#424942",
        "on-primary": "#ffffff",
        "on-primary-container": "#244a2f",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#464385",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#712c2e"
      },
      boxShadow: {
        soft: "0 4px 20px rgba(0, 0, 0, 0.06)",
        lift: "0 18px 32px rgba(26, 28, 26, 0.12)"
      },
      borderRadius: {
        card: "1.5rem",
        shell: "2rem",
        pill: "9999px"
      },
      spacing: {
        "margin-page": "24px",
        gutter: "16px",
        "stack-sm": "12px",
        "stack-md": "20px",
        "stack-lg": "32px"
      }
    }
  },
  plugins: []
};

export default config;
