var request = require('request');
var _defaults = require('lodash.defaults');
var _extend = require('lodash.assign');

var Api = {
  extend: function (obj) {
    _extend(obj, Api);
  },
  
  host: 'http://api.dev.divshot.com:9393',
  _request: function (path, method, options, callback) {
    if (!Api.user) {
      return callback('user undefined');
    }
    
    var requestOptions = {
      url: Api.host + path,
      method: method
    };
    
    Api.user.authenticate(function (err, token) {
      requestOptions = _defaults(options, requestOptions, {
        headers: {
          authorization: 'Bearer ' + token
        }
      });
      
      request(requestOptions, function (err, response, body) {
        var data = body;
        
        try {
          data = JSON.parse(data);
        }
        catch (e) {}
        finally {
          callback(err, response, data);
        }
      });
    });
    
  },
  _get: function (options, callback) {
    this._request(this.path, 'GET', options, callback);
  },
  _getById: function (id, options, callback) {
    this._request(this.path + '/' + id, 'GET', options, callback);
  },
  _post: function (options, callback) {
    this._request(this.path, 'POST', options, callback);
  },
  _put: function (options, callback) {
    this._request(this.path, 'GET', options, callback);
  },
  _del: function (options, callback) {
    this._request(this.path, 'DELETE', options, callback);
  },
  
  getAll: function (callback) {
    this._get({}, function (err, response, body) {
      callback(err, body);
    });
  },
  
  getById: function (id, callback) {
    this._getById(id, {}, function (err, response, body) {
      callback(err, body);
    });
  },
  
  create: function (payload, callback) {
    this._post({
      form: payload
    }, function (err, response, body) {
      callback(err, body);
    });
  },
  
  update: function (id, payload, callback) {},
  
  remove: function (id, callback) {}
};

module.exports = Api;