var Divshot = require('../Divshot.js');
var auth = require('./auth.js');

Divshot.prototype.auth = auth.auth;
Divshot.prototype.authWithCookie = auth.authWithCookie;

module.exports = Divshot;