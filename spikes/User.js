var Api = require('./Api');

var User = Api.endpoint('users', {
  initialize: function (credentials) {
    this.authPath = '/auth/identity/callback';
    this.credentials = credentials
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
      var location = response.headers.location;
      var token;
      
      if (location && location.indexOf('#') > -1) {
        try{
          token = location.split('#')[1].split('=')[1];
        }
        catch (e) {}
      }
      
      self.credentials.token = token;
      callback(err, self.credentials.token);
    }, true);
  }
});

module.exports = User;