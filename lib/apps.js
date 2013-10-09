module.exports = function (api, divshot) {
  var user = require('./user')(api);
  
  var apps = api.endpoint('apps', {
    hooks: {
      pre: function (next) {
        this.getEndpoint('user').authenticate(function (err, token) {
          divshot.setTokenHeader(token, apps);
          next();
        });
      }
    }
  });
  
  return apps;
};