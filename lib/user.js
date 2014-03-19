var btoa = require('btoa');

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
      
      return pluck(tokenRequest, 'access_token').then(function (token) {
        self.api.token(token);
      });
      
      function pluck (promise, key) {
        return self.api.promise(function (resolve, reject) {
          promise.then(function (res) {
            resolve(res[key]);
          }, reject);
        });
      }
    }
    
  });
  
  // user.emails;
  // user.password;
  
  return user;
};
