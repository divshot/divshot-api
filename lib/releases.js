module.exports = function (api, divshot, credentials) {
  var user = require('./user')(api);

  var releases = api.endpoint('releases', {
    lookup: function (hostname, callback) {
      var url = this.url() + '/lookup?host=' + hostname;

      return this.http.request(url, 'GET', {proxy: credentials.proxyServer}, callback);
    }
  });

  return releases;
};
