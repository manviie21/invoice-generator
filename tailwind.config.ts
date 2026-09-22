import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#faf6f0",
        dark: "#140f12",
        coral: {
          DEFAULT: "#e86c54",
          hover: "#d35a43",
          light: "rgba(232, 108, 84, 0.12)",
        },
        blush: "#f2c4bb",
        lilac: "#ece3f4",
        peach: "#fde9dc",
        mint: "#d7efe6",
        butter: "#fef2ce",
        navy: {
          900: "#0f1f38",
          800: "#142444",
          700: "#1c325e",
        },
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Cormorant Garamond", "serif"],
        sans: ["var(--font-dm-sans)", "DM Sans", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 24px rgba(20, 15, 18, 0.05)",
        card: "0 2px 12px rgba(20, 15, 18, 0.04)",
        glow: "0 8px 30px rgba(232, 108, 84, 0.18)",
      },
    },
  },
  plugins: [],
} satisfies Config;
