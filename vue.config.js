module.exports ={
  configureWebpack: (config) => {
    config.externals = {
      "v-graphin": 'vGraphin'
    }
  }
}