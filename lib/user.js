module.exports = function (api, divshot, credentials) {
  
  var emails = api.endpoint('self/emails', {
    add: function (email, callback) {
      return this.http.request(this.url(), 'POST', {
        form: {
          address: email
        }
      }, callback);
    },
    
    primary: function (email, callback) {
      return this.http.request(this.url(), 'POST', {
        form: {
          address: email,
          primary: true
        }
      }, callback);
    },
    
    remove: function (email, callback) {
      return emails.one(email).remove(callback);
    },
    
    resend: function (email, callback) {
      var email =  emails.one(email);
      var url = email.url() + '/resend';
      
      return this.http.request(url, 'POST', callback);
    }
  });
  
  var password = api.endpoint('self').one('password');
  
  var user = api.endpoint('users', {
    credentials: credentials,
    
    emails: emails,
    password: password,
    
    id: function (id) {
      return user.one(id);
    },
    
    authenticate: function (callback) {
      var self = this;
      
      if (this.credentials.token) {
        return callback(null, this.credentials.token);
      }
      
      return this.http._http(this.options.host + '/token', 'POST', {
        form: {
          username: this.credentials.email,
          password: this.credentials.password,
          grant_type: 'password'
        },
        headers: {
          Authorization: 'Basic NTI1NTc4YTM0MjFhYTk4MTU1MDAwMDA0Og==' // TODO: move this elsewhere
        }
      }, function (err, response, body) {
        if (callback && err || body.status) {
          err = err || body.error;
          return callback(err);
        }
        
        if (callback) {
          self.credentials.token = body.access_token;
          callback(err, self.credentials.token);
        }
      });
    },
    
    setCredentials: function (credentials) {
      if (!this.credentials) {
        this.credentials = {};
      }
      
      this.credentials.email = credentials.email;
      this.credentials.password = credentials.password;
      this.credentials.token = credentials.token;
    },
    
    self: function (callback) {
      return this.http.request(this.options.host + '/self', 'GET', callback);
    },
    
    
  });

  return user;
};