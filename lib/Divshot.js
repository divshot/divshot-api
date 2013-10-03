var assert = require('assert');
var env = require('./env');
var _defaults = require('lodash.defaults');
var User = require('./User');

var Divshot = function (options) {
  var self = this;
  
  this.defaults = {
    apiHost: env.API_HOST,
    token: null
  };
  this.options = _defaults(options, this.defaults);
  this.user = new User(this.options);
  
  if (!this.options.token) {
    this.user.authenticate(function (err, token) {
      self.options.token = token;
    });
  }
};

Divshot.createClient = function (options) {
  assert.notEqual(options.email, undefined, 'User email is required.');
  assert.notEqual(options.password, undefined, 'User email is required.');
  
  return new Divshot(options);
};



module.exports = Divshot;