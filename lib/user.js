var Api = require('./api');

var User = Api.endpoint('users', {
  initialize: function (credentials) {
    this.authPath = '/auth/identity/callback';
    this.credentials = credentials;
  },
  
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
    
    
    this._request(this.authPath, 'GET', {
      form: {
        auth_key: this.credentials.email,
        password: this.credentials.password
      },
      followRedirect: false
    }, function (err, response, body) {
      if (err) {
        return callback(err);
      }
      
      self.credentials.token = self._parseTokenFromHeaders(response.headers);
      callback(err, self.credentials.token);
    });
  }
});

module.exports = User;