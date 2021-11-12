module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      animation: {
        marquee: 'marquee 4s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      fontFamily :{
        'nunito' : ['Nunito']
      },
      spacing : {
        'nav-h' : 'calc(100vh - 4rem)',
        'nav-w' : 'calc(100% - 3rem)'
      },
      colors : {
        'clight-0' : '#EEEFF2',
        'clight-1' : '#B1B5C4',
        'clight-2' : '#777E91',
        'clight-3' : '#5E6272',
        'cdark-0' : 'rgb(28,30,36)',
        'cdark-1' : 'rgb(18,18,20)',
        'cdark-2' : 'rgb(24,24,28)',
        'cdark-3' : '#141416',
        'cdark-4' : '#121214'
      }
    },
  },
  variants: {
    extend: {
    },
  },
  plugins: [],
}
