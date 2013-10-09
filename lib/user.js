module.exports = function (api, credentials) {
  var user = api.endpoint('user', {
    credentials: credentials,
    authPath: '/token',
    
    _parseTokenFromHeaders: function (headers) {
      var location = headers.location;
      var token;
      
      if (location && location.indexOf('#') > -1) {
        try{
          token = location.split('#')[1].split('=')[1];
        }
        catch (e) {}
      }
      
      return token;
    },
    
    authenticate: function (callback) {
      var self = this;
     
      
      if (this.credentials.token) {
        return callback(null, this.credentials.token);
      }
      
      this.request(this.host + this.authPath, 'POST', {
        form: {
          username: this.credentials.email,
          password: this.credentials.password,
          grant_type: 'password'
        },
        headers: {
          Authorization: 'Basic NTI1NTc4YTM0MjFhYTk4MTU1MDAwMDA0Og=='
        }
      }, function (err, response, body) {
        if (err || body.status) {
          err = err || body.error;
          return callback(err);
        }
        self.credentials.token = body.access_token;
        self.credentials.token_type = body.token_type;
        
        callback(err, self.credentials.token);
      });
    },
    
    setCredentials: function (credentials) {
      if (!this.credentials) {
        this.credentials = {};
      }
      
      this.credentials.email = credentials.email;
      this.credentials.password = credentials.password;
      this.credentials.token = credentials.token;
    }
  });
  
  return user;
};