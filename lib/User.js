var _defaults = require('lodash.defaults');
var request = require('request');

var User = function (options) {
  this.defaults = {
    authPath: '/auth/identity/callback'
  };
  this.options = _defaults(options, this.defaults);
};

User.prototype._parseTokenFromHeaders = function (headers) {
  var location = headers.location;
  var token;
  
  if (location && location.indexOf('#') > -1) {
    try{
      token = location.split('#')[1].split('=')[1];
    }
    catch (e) {}
  }
  
  return token;
};

User.prototype.authenticate = function (callback) {
  var self = this;
  
  if (this.options.token) {
    return callback(null, this.options.token);
  }
  
  request({
    method: 'GET',
    url: this.options.apiHost + this.options.authPath,
    followRedirect: false,
    form: {
      auth_key: this.options.email,
      password: this.options.password
    }
  }, function (err, r, body) {
    self.options.token = self._parseTokenFromHeaders(r.headers) || null;
    callback(err, self.options.token);
  });
};

module.exports = User;