var btoa = require('btoa');
var _ = require('underpromise');

module.exports = function () {
  var user = this.resource('users', {
    tokenAuth: function () {
      if (this.api.token()) return this.api.asPromise(this.api.token());
      if (this.api.clientId()) return this.api.asPromise(undefined);
      
      var self = this;
      var tokenRequest = this.api.post('/token', {
        form: {
          username: this.api.username(),
          passowrd: this.api.password(),
          grant_type: 'password'
        },
        headers: {
          Authorization: 'Basic ' + btoa(this.api._clientId + ':')
        }
      });
      
      return _.pluck('access_token', tokenRequest).then(function (token) {
        self.api.token(token);
      });
    }
    
  });
  
  // user.emails;
  // user.password;
  
  return user;
};
