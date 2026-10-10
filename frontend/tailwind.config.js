/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          ink: "#0D1520",
          "ink-light": "#1B2533",
          muted: "#5A6777",
          border: "#DDE3DF",
          canvas: "#F4F7F5",
          panel: "#FFFFFF",
          surface: "#EAEFEB",
          celadon: {
            DEFAULT: "#1A6352",
            hover: "#145143",
            light: "#E7F3EF",
            border: "#A5D3C5",
          },
          amber: {
            DEFAULT: "#B45309",
            hover: "#92400E",
            light: "#FEF3C7",
            border: "#FCD34D",
          },
          rose: {
            DEFAULT: "#BE123C",
            light: "#FFE4E6",
            border: "#FDA4AF",
          }
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        clinical: '0 1px 2px 0 rgba(13, 21, 32, 0.05)',
        'clinical-md': '0 4px 6px -1px rgba(13, 21, 32, 0.07), 0 2px 4px -2px rgba(13, 21, 32, 0.05)',
        'clinical-lg': '0 10px 15px -3px rgba(13, 21, 32, 0.08), 0 4px 6px -4px rgba(13, 21, 32, 0.04)',
      }
    },
  },
  plugins: [],
}
