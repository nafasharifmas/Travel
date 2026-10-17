/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#0e1b14',
          900: '#16281e',
          800: '#1e382a',
          700: '#274837',
          600: '#345e48',
          100: '#e5ede8',
          50: '#f2f6f4',
        },
        charcoal: {
          950: '#0f0e0d',
          900: '#181615',
          850: '#201e1c',
          800: '#292624',
          700: '#3d3936',
          600: '#5c5652',
        },
        espresso: {
          950: '#0f0e0d',
          900: '#181615',
          800: '#292624',
          700: '#3d3936',
        },
        sand: {
          50: '#fdfbf7',
          100: '#f7f3ec',
          200: '#ebe3d5',
          300: '#dfd4c0',
          400: '#c8b89e',
          500: '#b09d81',
          600: '#948066',
        },
        gold: {
          300: '#f3dc8e',
          400: '#e5c158',
          500: '#d4af37',
          600: '#b89427',
          700: '#91731c',
        },
        terracotta: {
          400: '#e07653',
          500: '#c85a38',
          600: '#b54826',
          700: '#9e3b1c',
        },
        ivory: {
          50: '#fefdfb',
          100: '#faf8f5',
          200: '#f5f0e6',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        display: ['Playfair Display', 'Cormorant Garamond', 'serif'],
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        kenburns: {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '50%': { transform: 'scale(1.08) translate(-1%, -1%)' },
          '100%': { transform: 'scale(1) translate(0, 0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        kenburns: 'kenburns 28s ease-in-out infinite alternate',
        fadeInUp: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
