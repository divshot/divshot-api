var Api = require('./Api');
var _defaults = require('lodash.defaults');
var User = require('./User');
var Apps = require('./Apps');

var Divshot = function (options) {
  this.defaults = {};
  this.options = _defaults(options, this.defaults);
  
  Api.user = this.user = new User({
    email: options.email,
    password: options.password,
    token: options.token
  });
  
  this.apps = new Apps();
};

module.exports = {
  createClient: function (options) {
    return new Divshot(options);
  }
};