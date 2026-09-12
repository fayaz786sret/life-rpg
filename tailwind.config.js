/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef3e2',
          100: '#fde8c5',
          200: '#fbd08b',
          300: '#f9b851',
          400: '#f7a017',
          500: '#e08c0d',
          600: '#c47808',
          700: '#a66405',
          800: '#885002',
          900: '#6a3c00',
        },
        dark: {
          950: '#0a0a0f',
          900: '#141420',
          800: '#1e1e2e',
          700: '#2a2a3e',
          600: '#363654',
        }
      },
      fontFamily: {
        display: ['"Press Start 2P"', 'cursive'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'level-up': 'levelUp 0.6s ease-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        levelUp: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '50%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(240, 180, 80, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(240, 180, 80, 0.8)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
