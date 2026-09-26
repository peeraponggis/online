import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './data/**/*.{js,ts}'],
  safelist: [
    { pattern: /^from-(emerald|lime|teal|cyan|sky|indigo|violet|purple|fuchsia|pink|rose|amber|orange|yellow|slate|stone|zinc)-100$/ },
    { pattern: /^to-(green|cyan|blue|purple|violet|pink|rose|orange|amber|yellow|neutral|gray)-100$/ },
    { pattern: /^to-gray-200$/ },
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
      },
      fontFamily: {
        sans: ['var(--font-sarabun)', 'Sarabun', 'Noto Sans Thai', 'Tahoma', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
