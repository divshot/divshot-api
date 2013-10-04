var assert = require('assert');
var env = require('./env');
var _defaults = require('lodash.defaults');
var User = require('./User');
var HostedApplication = require('./HostedApplication');

var Divshot = function (options) {
  this.defaults = {
    apiHost: env.API_HOST,
    token: null
  };
  
  this.options = _defaults(options, this.defaults);
  this.user = new User(this.options);
  this.apps = new HostedApplication(this.user, this.options);
};

Divshot.createClient = function (options) {
  if (!options.token) {
    assert.notEqual(options.email, undefined, 'User email is required.');
    assert.notEqual(options.password, undefined, 'User email is required.');
  }
  
  return new Divshot(options);
};



module.exports = Divshot;