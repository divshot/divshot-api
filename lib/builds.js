module.exports = function (api, divshot) {
  var user = require('./user')(api);
  
  var builds = api.endpoint('builds', {
    hooks: {
      pre: function (next) {
        this.getEndpoint('user').authenticate(function (err, token) {
          divshot.setTokenHeader(token, builds);
          next();
        });
      }
    },
    
    lookup: function (host, callback) {
      var url = this.url() + '/lookup';
      
      this.http.request(url, 'GET', {
        form: {
          host: host
        }
      }, function (err, response, body) {
        callback(err, body);
      });
    }
  });
  
  return builds;
};