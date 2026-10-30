/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pearl: {
          DEFAULT: '#FFFCF8',
          50: '#FFFFFF',
          100: '#FFFCF8',
          200: '#FAF6F0',
        },
        blush: {
          DEFAULT: '#F8E5E9',
          50: '#FDF7F8',
          100: '#FBF0F2',
          200: '#F8E5E9',
          300: '#F2D3DA',
          400: '#EABEC8',
          500: '#DE9FAE',
        },
        powder: {
          DEFAULT: '#EFCBD5',
          light: '#F5DCE3',
          dark: '#E2B1BD',
        },
        rose: {
          DEFAULT: '#C98FA4',
          light: '#DBA8BC',
          dark: '#B0758B',
        },
        ivory: {
          DEFAULT: '#F5EFE5',
          50: '#FAF7F0',
          100: '#F5EFE5',
          200: '#ECE3D4',
          300: '#E2D5C2',
          400: '#D6C5AE',
        },
        cocoa: {
          DEFAULT: '#49363B',
          soft: '#634B51',
          muted: '#876D75',
          light: '#AB9199',
          faint: '#D4C4C8',
        },
        mauve: {
          DEFAULT: '#9D7B8A',
          light: '#B598A4',
          dark: '#82606F',
        },
        champagne: {
          DEFAULT: '#E9D8B9',
          light: '#F3E9D5',
          dark: '#D8C39F',
        },
        // Graceful aliases for existing classes
        charcoal: {
          DEFAULT: '#49363B',
          50: '#FDF7F8',
          100: '#F5EFE5',
          200: '#E2D5C2',
          400: '#876D75',
          600: '#634B51',
          800: '#49363B',
          900: '#342428',
        },
        iridescent: {
          pink: '#F8B4C4',
          lavender: '#E2D5F5',
          cyan: '#B6E8EE',
          gold: '#F5E2B8',
          mint: '#D2F0E2',
          peach: '#FBC5A9',
        }
      },
      fontFamily: {
        brand: ['"Borel"', '"Dancing Script"', 'cursive'],
        script: ['"Dancing Script"', '"Borel"', 'cursive'],
        handwriting: ['"Dancing Script"', '"Borel"', 'cursive'],
        cursive: ['"Dancing Script"', '"Borel"', 'cursive'],
        editorial: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Instrument Serif"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Quicksand"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glass-subtle': '0 4px 20px -2px rgba(100, 90, 80, 0.05), 0 2px 6px -1px rgba(100, 90, 80, 0.03)',
        'glass-elevated': '0 20px 40px -10px rgba(80, 70, 60, 0.08), 0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        'bubble-glow': '0 0 25px -4px rgba(220, 205, 245, 0.45)',
        'bubble-hover': '0 0 35px 2px rgba(175, 225, 240, 0.55), 0 10px 25px -5px rgba(235, 180, 200, 0.35)',
      },
      animation: {
        'float-slow': 'float 7s ease-in-out infinite',
        'shimmer': 'shimmer 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
