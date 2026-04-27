export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#f0fdf4', // soft green background
          DEFAULT: '#22c55e', // default green
          dark: '#166534',
        },
        secondary: {
          light: '#fdfbf7', // warm white
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
