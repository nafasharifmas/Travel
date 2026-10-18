/**
 * Visitflow — Oceanic Premium Design System
 * ---------------------------------------------------------------------------
 * Two layers of tokens live here:
 *
 * 1. Visitflow core scales (ocean, turquoise, sunset, gold, navy, aqua) —
 *    the canonical palette from the brand specification.
 * 2. Legacy scales (charcoal, espresso, forest, sand, ivory, terracotta,
 *    stone) remapped onto the Visitflow identity. The application grew up on
 *    these names, so remapping keeps every existing component valid and
 *    re-skins the whole product consistently without a risky rename sweep.
 */
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <html class="dark"> drives both `dark:` variants and the dark override layer
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ---------- Visitflow Oceanic Premium core ---------- */
        ocean: {
          50: '#F0F9FF',
          100: '#DCF1FB',
          200: '#B6E2F5',
          300: '#7FCBEB',
          400: '#3AA9D8',
          500: '#006DAA', // primary brand
          600: '#075985', // deep ocean
          700: '#0A4763',
        },
        turquoise: {
          50: '#EBFDFD',
          100: '#D9F7F5',
          200: '#A8ECEA',
          300: '#6FDFDD',
          400: '#2FCFCB',
          500: '#00BFC4', // discovery / active filters
          600: '#009FA6',
          700: '#0A7F86',
        },
        sunset: {
          50: '#FFF4EC',
          100: '#FFE6D5',
          200: '#FFCBA8',
          300: '#FFB07A',
          400: '#FF914D', // conversion action
          500: '#F97A2E',
          600: '#E05F12',
          700: '#B84A0E',
        },
        gold: {
          300: '#F6E3A6',
          400: '#EFD06F',
          500: '#E9BC45', // premium highlight only
          600: '#C79A2C',
          700: '#9E7A1E',
        },
        aqua: {
          50: '#F2FDFC',
          100: '#D9F7F5', // soft aqua surface
          200: '#B7EEEC',
        },

        /* ---------- Remapped legacy scales ---------- */
        // Dark surfaces + headings -> deep navy
        navy: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E3A5F',
          900: '#102A43', // primary heading / navy surface
          950: '#0B1F33',
        },
        charcoal: {
          950: '#0B1F33',
          900: '#102A43',
          850: '#16324F',
          800: '#1E3A5F',
          700: '#2C4A6E',
          600: '#3E6187',
        },
        espresso: {
          950: '#0B1F33',
          900: '#102A43',
          800: '#1E3A5F',
          700: '#2C4A6E',
        },
        // Dark section background -> deep ocean
        forest: {
          950: '#062E45',
          900: '#07405C',
          800: '#075985',
          700: '#0A6E9C',
          600: '#0F86B8',
          100: '#DCF1FB',
          50: '#F0F9FF',
        },
        // Page / soft surfaces
        ivory: {
          50: '#FFFFFF',
          100: '#F8FAFC',
          200: '#F1F5F9',
        },
        // Neutral borders, muted text, body copy
        sand: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
        },
        // Terracotta folded into sunset
        terracotta: {
          400: '#FF914D',
          500: '#F97A2E',
          600: '#E05F12',
          700: '#B84A0E',
        },
        // Override warm default stone with spec-aligned slate neutrals
        stone: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        // Fluid editorial type scale (clamp-based, mobile-first)
        hero: ['clamp(2.375rem, 5.2vw, 4rem)', { lineHeight: '1.06', letterSpacing: '-0.02em' }],
        h1: ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        h2: ['clamp(1.75rem, 3.2vw, 2.5rem)', { lineHeight: '1.14', letterSpacing: '-0.01em' }],
        h3: ['clamp(1.375rem, 2.2vw, 1.75rem)', { lineHeight: '1.22' }],
        h4: ['1.375rem', { lineHeight: '1.3' }],
      },
      borderRadius: {
        btn: '12px',
        card: '18px',
        media: '24px',
        pill: '999px',
      },
      maxWidth: {
        content: '1280px',
      },
      spacing: {
        section: '88px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(16, 42, 67, 0.06), 0 8px 24px -12px rgba(16, 42, 67, 0.12)',
        'card-hover': '0 4px 12px rgba(16, 42, 67, 0.08), 0 20px 40px -16px rgba(16, 42, 67, 0.2)',
        header: '0 1px 0 rgba(16, 42, 67, 0.06), 0 8px 24px -16px rgba(16, 42, 67, 0.28)',
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
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        kenburns: 'kenburns 28s ease-in-out infinite alternate',
        fadeInUp: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        fadeIn: 'fadeIn 0.4s ease-out forwards',
        float: 'float 4s ease-in-out infinite',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
