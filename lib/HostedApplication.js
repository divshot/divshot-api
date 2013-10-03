var util = require('util');
var _defaults = require('lodash.defaults');
var request = require('request');

var HostedApplication = function (user, options) {
  this.defaults = {};
  this.options = _defaults(options, this.defaults);
  this.user = user;
  this.path = '/apps';
};

HostedApplication.prototype.create = function (name, callback) {
  var self = this;
  
  this.user.authenticate(function (err, token) {
    request({
      method: 'POST',
      url: self.options.apiHost + self.path,
      form: {
        name: name
      },
      headers: {
        authorization: 'Bearer ' + token
      }
    }, function (err, r, body) {
      var data = body;
      
      try{
        JSON.parse(data);
      }
      catch (e) {}
      
      callback(err, data);
    });
  });
};

module.exports = HostedApplication;