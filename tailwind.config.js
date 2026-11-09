/** @type {import('tailwindcss').Config} */
const config = {
  // Updated content paths for Next.js App Router + components
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    // Keep src/ during migration period
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brown: { 50:'#F8F3EC',100:'#EFE4D6',200:'#DCC8B0',500:'#7A5238',700:'#4A3527',800:'#3A2A1F',900:'#2E2019',950:'#1E1510' },
        saffron:{ 50:'#FFF4EA',100:'#FFE3CC',400:'#F28B47',500:'#E8722A',600:'#C95F1D',700:'#A24A13' },
        gold:   { 300:'#E4C77A',400:'#D6B25C',500:'#C99A3C' },
        wa:'#25D366',
      },
      fontFamily: {
        // Use CSS variables set by next/font/local in layout.jsx
        sans:    ['var(--font-manrope)','Anek Malayalam','system-ui','sans-serif'],
        display: ['var(--font-fraunces)','Anek Malayalam','serif'],
        anek:    ['var(--font-anek)','Manrope','sans-serif'],
      },
      boxShadow: {
        soft:'0 8px 30px -12px rgba(46,32,25,.25)',
        ring:'0 0 0 1px rgba(74,53,39,.08)',
      },
      backgroundImage: {
        'temple-grad':'linear-gradient(135deg,#2E2019 0%,#4A3527 45%,#7A5238 100%)',
      },
    },
  },
  plugins: [],
}

export default config
