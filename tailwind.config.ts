import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6e0147',
        'primary-light': '#8a1660',
        'primary-dark': '#520135',
        accent: '#E8A838',
        bg: '#f8f9fb',
        card: '#ffffff',
        text: '#1a1a2e',
        muted: '#6b7d8e',
        border: '#e5e7eb',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      backgroundColor: {
        default: '#f8f9fb',
      },
    },
  },
  plugins: [],
}
export default config
