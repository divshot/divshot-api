module.exports = function (api, divshot) {
  var user = require('./user')(api);
  
  var releases = api.endpoint('releases', {
    lookup: function (hostname, callback) {
      var url = this.url() + '/lookup?host=' + hostname;
      
      return this.http.request(url, 'GET', function (err, response, body) {
        console.log(body);
      });
    }
  });
  
  return releases;
};