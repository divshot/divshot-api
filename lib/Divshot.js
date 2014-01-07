var defaults = require('./helpers/defaults');
var Narrator = require('narrator');
var user = require('./user');
var apps = require('./apps');
var builds = require('./builds');
var releases = require('./releases');
var organizations = require('./organizations');

var Divshot = function (options) {
  this.defaults = {};
  this.options = defaults(options, this.defaults);
  
  var apiOptions = {
    host: process.env.DIVSHOT_API_URL || options.host || 'https://api.divshot.com',
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
  this.builds = builds(this._api, this);
  this.releases = releases(this._api, this);
  this.organizations = organizations(this._api, this);
};

Divshot.createClient = function (options) {
  return new Divshot(options);
};

Divshot.prototype.setTokenHeader = function (token, context) {
  var context = context || this._api;
  context.options.headers.authorization = 'Bearer ' + token;
};

Divshot.prototype.setToken = function (token) {
  this.options.token = token;
  this._api.headers.authorization = 'Bearer ' + token;
};

module.exports = Divshot;
