/** @type {import('tailwindcss').Config} */

// NAVIAR brand tokens (naviar.css :root). Intermediate steps interpolate between them.
const forest = {
  50: '#eef3f0',
  100: '#dde8e2',
  200: '#c3d5cc',
  300: '#9bb8aa',
  400: '#5f8a7b',
  500: '#245448',
  600: '#153b33',
  700: '#0b2c26',
  800: '#082520',
  900: '#061c18',
};

const brass = {
  50: '#f4f1ea',
  100: '#ede3cf',
  200: '#e2cfa6',
  300: '#d8b978',
  400: '#c9a05c',
  500: '#b88a44',
  600: '#866229',
  700: '#6e5022',
  800: '#57401b',
  900: '#3f2e14',
};

module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './lib/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#071e19',
        'ink-soft': '#243a34',
        paper: '#fcfbf7',
        warm: '#f4f1ea',
        mist: '#eef3f0',
        muted: '#52635e',
        line: 'rgba(7,30,25,.14)',
        'line-strong': 'rgba(7,30,25,.28)',
        'brass-text': '#866229',
        primary: forest,
        secondary: forest,
        accent: brass,
        danger: {
          50: '#fdf2f2',
          100: '#fbe3e3',
          200: '#f3c4c4',
          500: '#c23b3b',
          600: '#a83232',
          700: '#8c2929',
          900: '#4d1616',
        },
        // Categorical chart slots, validated with the dataviz palette checker (light surface).
        viz: {
          1: '#0f8060',
          2: '#b88a44',
          3: '#3d74c4',
        },
      },
      fontFamily: {
        display: ['Sora', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '2px',
        sm: '2px',
        md: '2px',
        lg: '2px',
        xl: '2px',
        '2xl': '2px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(7,30,25,.06)',
        md: '0 4px 12px -2px rgba(7,30,25,.10)',
        lg: '0 12px 32px -8px rgba(7,30,25,.14)',
        xl: '0 24px 64px rgba(7,30,25,.12)',
      },
      maxWidth: {
        content: '1200px',
        reading: '44rem',
      },
      transitionDuration: {
        fast: '160ms',
        medium: '280ms',
      },
    },
  },
  plugins: [],
};
