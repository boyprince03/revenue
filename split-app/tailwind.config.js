/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          400: '#E6C968',
          500: '#D4AF37', // 經典金
          600: '#B59024',
        },
        dark: {
          900: '#121212',
          800: '#1A1A1A', // 卡片黑
          100: '#F5F5F5', // 背景灰
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // 建議引入 Inter 字體更有質感
      }
    },
  },
  plugins: [],
}