/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      container: { center: true, padding: "1rem" },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif']
      },
      colors: {
        brand: {
          DEFAULT: "hsl(var(--brand))",
          fg: "hsl(var(--brand-fg))",
          muted: "hsl(var(--brand-muted))"
        },
        bg: {
          DEFAULT: "hsl(var(--bg))",
          soft: "hsl(var(--bg-soft))",
          card: "hsl(var(--bg-card))"
        },
        textc: {
          DEFAULT: "hsl(var(--text))",
          soft: "hsl(var(--text-soft))",
          muted: "hsl(var(--text-muted))"
        }
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem"
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(0,0,0,.15)"
      }
    }
  },
  plugins: []
}
