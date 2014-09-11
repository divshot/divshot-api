module.exports = function (api, divshot, credentials) {
  var vouchers = api.endpoint('vouchers');

  vouchers.redeem = function (code, callback) {
    return this.http.request(this.url() + '/' + code + '/redeem', 'PUT', {proxy: credentials.proxyServer}, callback);
  }

  return vouchers;
};
