module.exports = function (api, divshot) {
  var user = require('./user')(api);
  var organizations = api.endpoint('organizations', {
    hooks: {
      pre: function (next) {
        this.getEndpoint('users').authenticate(function (err, token) {
          if (token) divshot.setTokenHeader(token, organizations);
          next();
        });
      },
      
    },
    
    id: function (id) {
      var org = this.one(id);
      
      org.apps = org.endpoint('apps');
      org.members = org.endpoint('members', {
        id: function (id) {
          return this.one(id);
        }
      });
      
      return org;
    }
  });
  
  return organizations;
};