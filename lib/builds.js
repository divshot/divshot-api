module.exports = function (api, divshot, credentials) {
  var user = require('./user')(api);

  var builds = api.endpoint('builds', {
    hooks: {
      pre: function (next) {
        this.getEndpoint('users').authenticate(function (err, token) {
          if (token) divshot.setTokenHeader(token, builds);
          next();
        });
      }
    },

    lookup: function (host, callback) {
      var url = this.url() + '/lookup';

      return this.http.request(url, 'GET', {
        form: {
          host: host
        },
        proxy: credentials.proxyServer
      }, function (err, response, body) {
        if (callback) callback(err, body);
      });
    }
  });

  return builds;
};
