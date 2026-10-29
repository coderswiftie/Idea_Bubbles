/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#FAF7F2',
          50: '#FFFFFF',
          100: '#FDFBF7',
          200: '#FAF7F2',
          300: '#F4ECE4',
          400: '#EAE1D6',
        },
        charcoal: {
          DEFAULT: '#242220',
          50: '#F7F6F4',
          100: '#EAE8E3',
          200: '#CEC9C1',
          400: '#8A847C',
          600: '#4D4741',
          800: '#2A2623',
          900: '#1D1A18',
        },
        iridescent: {
          pink: '#F8B4C4',
          lavender: '#D8C5F4',
          cyan: '#9DE3EC',
          gold: '#FCE09B',
          mint: '#BEEAD5',
          peach: '#FBC5A9',
        }
      },
      fontFamily: {
        handwriting: ['"Dancing Script"', '"Caveat"', 'cursive'],
        cursive: ['"Caveat"', '"Dancing Script"', 'cursive'],
        editorial: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Quicksand"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
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
