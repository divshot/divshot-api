var Rapper = require('rapper');
var divshot = new Rapper(API_HOST);
var user = require('./user');
var apps = require('./apps');
var organizations = require('./organizations');
var releases = require('./releases');
var builds = require('./builds');
var vouchers = require('./vouchers');

var API_HOST = 'https://api.divshot.com';
var DIVSHOT_API_VERSION = '0.5.0';

var Divshot = function () {
  // Instantiate parent
  Rapper.call(this, API_HOST);
  
  this.apiVersion(process.env.DIVSHOT_API_URL || DIVSHOT_API_VERSION);
  
  this.user = user.call(this);
  this.apps = apps.call(this);
  this.organizations = organizations.call(this);
  this.releases = releases.call(this);
  this.builds = builds.call(this);
  this.vouchers = vouchers.call(this);
};

// Inherit methods
Divshot.prototype = Object.create(Rapper.prototype);

Divshot.prototype.token = function (token) {
  if (!token) return this._token;
  
  this._token = token;
  this.header('Authorization', 'Bearer ' + token);
  return this;
};

Divshot.prototype.apiVersion = function (version) {
  if (!version) return this._apiVersion;
  
  this.header('Accepts-Version', version);
  this._apiVersion = version;
  return this;
};

Divshot.prototype.session = function (clientId) {
  this._clientId = clientId;
  this.header('Authorization', 'Session ' + clientId);
  this.xhr('withCredentials', true);
  return this;
};

Divshot.prototype.clientId = function (id) {
  if (!id) return this._clientId;
  
  this._clientId = id;
  return this;
};

Divshot.prototype.username = function (username) {
  if (!username) return this._username;
  
  this._username = username;
  return this;
};

Divshot.prototype.password = function (password) {
  if (!password) return this._password;
  
  this._password = password;
  return this;
};

Divshot.prototype.credentials = function (username, password) {
  if (!username && !password) return {username: this.username(), password: this.password()};
  
  this.username(username);
  this.password(password);
  return this;
};

module.exports = Divshot;