var _defaults = require('lodash.defaults');
var request = require('request');

var User = function (options) {
  var self = this;
  
  this.defaults = {
    authPath: '/auth/identity/callback'
  };
  this.options = _defaults(options, this.defaults);
};

User.prototype._parseTokenFromHeaders = function (headers) {
  var location;
  var token;
  
  if (location = headers.location) {
    token = location.split('#')[1].split('=')[1];
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
    self.options.token = self._parseTokenFromHeaders(r.headers);
    callback(null, self.options.token);
  });
};

module.exports = User;