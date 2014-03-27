module.exports = function (api, divshot) {  
  var vouchers = api.endpoint('vouchers');
  
  vouchers.redeem = function (code, callback) {
    return this.http.request(this.url() + '/' + code + '/redeem', 'PUT', callback);
  }
  
  return vouchers;
};