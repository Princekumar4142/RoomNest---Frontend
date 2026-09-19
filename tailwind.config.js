/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Deep trustworthy slate navy for high contrast, readability, and serious product feel
        ink: {
          DEFAULT: "#0F172A",
          900: "#0B1120",
          800: "#0F172A",
          700: "#1E293B",
          600: "#334155",
          500: "#475569",
        },
        // Clean crisp background with slate undertone
        paper: {
          DEFAULT: "#F8FAFC",
          soft: "#F1F5F9",
          card: "#FFFFFF",
        },
        // Emerald for verification, zero brokerage, trust, and affordability
        seal: {
          DEFAULT: "#059669",
          light: "#10B981",
          dark: "#047857",
        },
        // Vibrant University Blue / Indigo for interactive buttons and links
        teal: {
          DEFAULT: "#2563EB",
          light: "#3B82F6",
          dark: "#1D4ED8",
        },
        // Warm Amber for ratings and student highlights
        amber: {
          DEFAULT: "#D97706",
          light: "#F59E0B",
          dark: "#B45309",
        },
        slate: {
          ink: "#475569",
        },
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "'Inter'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        grain: "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.04) 1px, transparent 0)",
        "hero-glow": "radial-gradient(circle at 20% 20%, rgba(37,99,235,0.06), transparent 50%), radial-gradient(circle at 80% 20%, rgba(5,150,105,0.06), transparent 50%)",
        "cta-gradient": "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
        "emerald-gradient": "linear-gradient(135deg, #059669 0%, #047857 100%)",
        "blue-gradient": "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(15, 23, 42, 0.05)",
        card: "0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)",
        "card-hover": "0 12px 28px -6px rgba(15, 23, 42, 0.12), 0 6px 12px -4px rgba(15, 23, 42, 0.06)",
        glow: "0 4px 20px -4px rgba(37, 99, 235, 0.25)",
        "glow-seal": "0 4px 20px -4px rgba(5, 150, 105, 0.25)",
      },
      opacity: Object.fromEntries(Array.from({ length: 101 }, (_, i) => [i, `${i / 100}`])),
    },
  },
  plugins: [],
};
