module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily :{
        'nunito' : ['Nunito']
      },
      spacing : {
        'nav-h' : 'calc(100vh - 4rem)',
        'nav-w' : 'calc(100% - 3rem)'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
