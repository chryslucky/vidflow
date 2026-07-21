/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        vf: {
          black: '#050505',
          dark: '#0c0c0c',
          card: '#141414',
          card2: '#1a1a1a',
          border: '#222222',
          border2: '#2a2a2a',
          gray: '#777777',
          light: '#bbbbbb',
          white: '#f0f0f0',
          red: '#e50914',
          redH: '#ff1a25',
          redD: '#b30710',
        }
      },
    },
  },
  plugins: [],
}