/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#101B34",
          900: "#0B1426",
          800: "#101B34",
          700: "#1B2A4A",
          600: "#2A3D63",
        },
        paper: {
          DEFAULT: "#FAF7F0",
          soft: "#F3EEE1",
        },
        seal: {
          DEFAULT: "#C79A2B",
          light: "#E4C878",
          dark: "#96751E",
        },
        teal: {
          DEFAULT: "#17685C",
          light: "#3F9C8C",
          dark: "#0E463D",
        },
        slate: {
          ink: "#3A4256",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["'General Sans'", "Inter", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      backgroundImage: {
        grain: "radial-gradient(circle at 1px 1px, rgba(16,27,52,0.06) 1px, transparent 0)",
      },
      opacity: Object.fromEntries(Array.from({ length: 101 }, (_, i) => [i, `${i / 100}`])),
    },
  },
  plugins: [],
};
