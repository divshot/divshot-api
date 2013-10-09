var _defaults = require('lodash.defaults');
var Narrator = require('narrator');
var user = require('./user');
var apps = require('./apps');

var Divshot = function (options) {
  this.defaults = {};
  this.options = _defaults(options, this.defaults);
  
  this._api = new Narrator({
    host: 'http://api.dev.divshot.com:9393',
    headers: {
      authorization: 'Bearer 9XlWtQwoijzujJFWnHdeZKJ_vriy4YJXNH0KpLZ_'
    }
  });
  
  this.user = user(this._api, options);
  this.apps = apps(this._api);
};

Divshot.createClient = function (options) {
  return new Divshot(options);
};

module.exports = Divshot;
