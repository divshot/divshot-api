var Rapper = require('rapper');
var divshot = new Rapper(API_HOST);

var API_HOST = 'https://api.divshot.com';
var DIVSHOT_API_VERSION = '0.5.0';


var Divshot = function () {
  // Instantiate parent
  Rapper.call(this, API_HOST);
  
  this.apiVersion(process.env.DIVSHOT_API_URL || DIVSHOT_API_VERSION);
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

Divshot.prototype.clientId = function () {
  return this._clientId;
};

module.exports = Divshot;