/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#07090D',
          900: '#0B0D12', // Canvas Background
          800: '#131722', // Secondary Surfaces / Cards
          700: '#191E2A', // Elevated / Borders
          600: '#22293A',
        },
        ivory: {
          50: '#FCFAF7',
          100: '#F4F0E8', // Primary Soft Ivory Text
          200: '#E4DFD3',
          300: '#C7BFAC',
        },
        cosmic: {
          lavender: '#8B5CF6',
          coral: '#F43F5E',
          cyan: '#06B6D4',
          amber: '#F59E0B',
          mint: '#10B981',
          indigo: '#6366F1',
          sky: '#38BDF8',
          slate: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-lavender': '0 0 25px -5px rgba(139, 92, 246, 0.4)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.4)',
        'glow-coral': '0 0 25px -5px rgba(244, 63, 94, 0.4)',
        'glow-mint': '0 0 25px -5px rgba(16, 185, 129, 0.4)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-gentle': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
