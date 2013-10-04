var env = {
  test: {
    API_HOST: 'http://api.dev.divshot.com:9393'
  },
  production: {
    API_HOST: 'https://api.divshot.com'
  }
};

module.exports = env[process.env.NODE_ENV] || env.production;