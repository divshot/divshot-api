module.exports = function (api, divshot, credentials) {
  var user = api.endpoint('user', {
    credentials: credentials,
    
    authenticate: function (callback) {
      var self = this;
      
      if (this.credentials.token) {
        return callback(null, this.credentials.token);
      }
      
      this.http._http(this.options.host + '/token', 'POST', {
        form: {
          username: this.credentials.email,
          password: this.credentials.password,
          grant_type: 'password'
        },
        headers: {
          Authorization: 'Basic NTI1NTc4YTM0MjFhYTk4MTU1MDAwMDA0Og==' // TODO: move this elsewhere
        }
      }, function (err, response, body) {
        if (err || body.status) {
          err = err || body.error;
          return callback(err);
        }
        
        self.credentials.token = body.access_token;
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