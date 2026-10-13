/** @type {import('tailwindcss').Config} */
// Configuración de estilos: modo oscuro por clase y paleta de marca ("marca").
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        marca: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a'
        }
      },
      keyframes: {
        'entrada-suave': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fundido: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      animation: {
        'entrada-suave': 'entrada-suave 0.18s ease-out',
        fundido: 'fundido 0.15s ease-out'
      }
    }
  },
  plugins: []
};
