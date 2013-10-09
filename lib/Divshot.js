var _defaults = require('lodash.defaults');
var Narrator = require('narrator');
var user = require('./user');
var apps = require('./apps');

var Divshot = function (options) {
  this.defaults = {};
  this.options = _defaults(options, this.defaults);
  
  var apiOptions = {
    host: 'http://api.dev.divshot.com:9393',
    headers: {}
  };
  
  if (options.token) {
    apiOptions.headers = {
      authorization: 'Bearer ' + options.token
    };
  }
  
  this._api = new Narrator(apiOptions);
  this.user = user(this._api, this, options);
  this.apps = apps(this._api, this);
};

Divshot.createClient = function (options) {
  return new Divshot(options);
};

Divshot.prototype.setTokenHeader = function (token, context) {
  var context = context || this._api;
  context.options.headers.authorization = 'Bearer ' + token;
};

module.exports = Divshot;
