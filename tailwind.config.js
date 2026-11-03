/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        resq: {
          bg: '#F5F7FA',
          surface: '#FFFFFF',
          text: '#172033',
          muted: '#69758A',
          border: '#E4E9F1',
          primary: '#315CE8',
          'primary-hover': '#2548BF',
          'primary-light': '#EFF3FD',
          navy: '#14213D',
          emergency: '#E65353',
          'emergency-hover': '#CE3E3E',
          'emergency-light': '#FDF2F2',
          success: '#119B8A',
          'success-hover': '#0E8072',
          'success-light': '#EDF8F6',
          warning: '#E59516',
          'warning-light': '#FEF9EE',
          dark: '#0F1626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(20, 33, 61, 0.04), 0 1px 3px 0 rgba(20, 33, 61, 0.02)',
        'card': '0 2px 6px 0 rgba(20, 33, 61, 0.04), 0 1px 2px 0 rgba(20, 33, 61, 0.02)',
        'dropdown': '0 4px 16px -2px rgba(20, 33, 61, 0.08), 0 2px 6px -1px rgba(20, 33, 61, 0.04)',
      }
    },
  },
  plugins: [],
}
