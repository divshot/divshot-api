var Api = require('./Api');

var User = function (credentials) {
  this.path = '/users';
  this.authPath = '/auth/identity/callback';
  this.credentials = credentials;
};

Api.extend(User.prototype);

User.prototype.authenticate = function (callback) {
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
  });
};


module.exports = User;