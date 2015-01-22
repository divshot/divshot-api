var Narrator = require('narrator');
var Emitter = require('tiny-emitter');
var extend = require('amp-extend');
var reemitter = require('re-emitter');

var defaults = require('./helpers/defaults');
var user = require('./user');
var apps = require('./apps');
var builds = require('./builds');
var releases = require('./releases');
var organizations = require('./organizations');
var vouchers = require('./vouchers');

var DIVSHOT_API_VERSION = '0.5.0';

var Divshot = function (options) {
  this.defaults = {};
  this.options = defaults(options, this.defaults);
  this.events = new Emitter();
  
  var self = this;
  var apiOptions = {
    host: process.env.DIVSHOT_API_URL || options.host || 'https://api.divshot.com',
    headers: {}
  };
  
  if (process.env.DIVSHOT_API_VERSION || options.version || DIVSHOT_API_VERSION) {
    var version = process.env.DIVSHOT_API_VERSION || options.version || DIVSHOT_API_VERSION;
    apiOptions.headers['Accept-Version'] = version
  }

  if (options.token) {
    apiOptions.headers['authorization'] = 'Bearer ' + options.token
  }
  
  if (options.session) {
    apiOptions.headers['authorization'] = 'Session ' + options.client_id;
  }
  
  this._api = new Narrator(apiOptions);
  
  if (options.session){ this._api.withCredentials(true); }
  
  this.user = user(this._api, this, options);
  this.apps = apps(this._api, this);
  this.builds = builds(this._api, this);
  this.releases = releases(this._api, this);
  this.organizations = organizations(this._api, this);
  this.vouchers = vouchers(this._api, this);
  
  // Forward Narrator events
  reemitter(this._api, this.events, ['response', 'response:success', 'response:error']);
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
