var btoa = require('btoa');

module.exports = function () {
  var users = this.resource('users', {
    id: function (id) {
      var user =  this.one(id);
      
      user.password = {
        reset: function () {
          return user.api.post('/actions/reset_password/' + id);
        }
      };
      
      user.emails = user.api.resource('self').resource('emails', {
        add: function (email, isPrimary) {
          var data = {address: email};
          
          if (isPrimary) data.primary = true;
          
          return this.post(data);
        },
        
        remove: function (email) {
          return this.one(email).remove();
        },
        
        resend: function (email) {
          return this.one(email).resource('resend').create();
        }
      });
      
      return user;
    },
    
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
      
      return this.api.promise(function (resolve, reject) {
        return tokenRequest.then(function (res) {
          resolve(res.access_token);
        }, reject);
      });
    },
    
    self: function () {
      return this.api.get('/self');
    }
  });

  // users.emails;
  // users.password;
  
  return users;
};
