/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f3e8ff',
          100: '#e2c4ff',
          200: '#c77dff',
          300: '#a855f7',
          400: '#9b30ff',
          500: '#7b00ff',
          600: '#6200ea',
          700: '#4d00c4',
          800: '#3d0099',
          900: '#270060',
          950: '#120030',
        },
        surface: {
          950: '#080810',
          900: '#0a0a0f',
          800: '#0f0f1a',
          700: '#111120',
          600: '#16162a',
          500: '#1e1e35',
        },
      },
      fontFamily: {
        display: ['"Familjen Grotesk"', '"DM Sans"', 'Chivo', 'sans-serif'],
        body:    ['"Plus Jakarta Sans"', 'Outfit', 'sans-serif'],
        mono:    ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
