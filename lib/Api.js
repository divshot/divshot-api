var request = require('request');
var _defaults = require('lodash.defaults');
var _extend = require('lodash.assign');

var Api = {
  HOST: 'http://api.dev.divshot.com:9393',
  
  endpoint: function (path, objDefinition) {
    var C = objDefinition.initialize || function () {};
    
    _extend(C.prototype, Api, {
      path: '/' + path
    }, objDefinition);
    
    return C;
  },
  
  _request: function (path, method, options, callback) {
    var requestOptions = {
      url: Api.HOST + path,
      method: method
    };
    
    requestOptions = _defaults(options, requestOptions);
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
  },
  
  _authenticatedRequest: function (path, method, options, callback, ignoreAuthentication) {
    var self = this;
    if (!Api.user) {
      return callback('user undefined');
    }
    
    Api.user.authenticate(function (err, token) {
      _defaults(options, {
        headers: {
          authorization: 'Bearer ' + token
        }
      });
      self._request(path, method, options, callback);
    });
  },
  
  _get: function (options, callback) {
    this._authenticatedRequest(this.path, 'GET', options, callback);
  },
  _getById: function (id, options, callback) {
    this._authenticatedRequest(this.path + '/' + id, 'GET', options, callback);
  },
  _post: function (options, callback) {
    this._authenticatedRequest(this.path, 'POST', options, callback);
  },
  _put: function (id, options, callback) {
    this._authenticatedRequest(this.path + '/' + id, 'PUT', options, callback);
  },
  _del: function (id, options, callback) {
    this._authenticatedRequest(this.path + '/' + id, 'DELETE', options, callback);
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