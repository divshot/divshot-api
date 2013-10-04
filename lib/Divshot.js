var _defaults = require('lodash.defaults');
var Api = require('./api');
var User = require('./user');
var Apps = require('./apps');

var Divshot = function (options) {
  this.defaults = {};
  this.options = _defaults(options, this.defaults);
  
  this.Api = Api;
  this.Api.HOST = (options.host) ? options.host : this.Api.HOST;
  
  this.Api.user = this.user = new User({
    email: options.email,
    password: options.password,
    token: options.token
  });
  
  this.apps = new Apps();
};

Divshot.createClient = function (options) {
  return new Divshot(options);
};

module.exports = Divshot;
