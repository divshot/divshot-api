'use strict';

//
// Prepares Rapper for use in AngularJS
//
angular.module('divshot', [])
  .provider('divshot', function () {
    var Divshot = require('../divshot');
    var auth = require('./auth.js');
    
    var angularRequest = require('rapper/lib/browser/angular.request');
    var angularPromise = require('rapper/lib/browser/angular.promise');
    
    // Browser setup
    Divshot.prototype.auth = auth.auth;
    Divshot.prototype.authWithCookie = auth.authWithCookie;
    
    var api = new Divshot();
    
    return {
      _host: {},
      
      api: api,
      
      configure: function (host) {
        this._host = host;
      },
      
      $get: function ($q, $http) {
        api._request = angularRequest($http, $q);
        api.promise = angularPromise($q);
        
        return api;
      }
    };
  });
  

// angular.module('divshot', [])
//   .provider('divshot', function () {
//     var Divshot = require('../Divshot');
//     var auth = require('./auth.js');

//     Divshot.prototype.auth = auth.auth;
//     Divshot.prototype.authWithCookie = auth.authWithCookie;
    
//     return {
//       _options: {},
      
//       configure: function (options) {
//         this._options = options;
//       },
      
//       $get: function ($rootScope, $q, $http) {
//         $rootScope.narratorApply = function(fn) {
//           var phase = this.$root.$$phase;
//           if(phase === '$apply' || phase === '$digest') {
//             if(fn && (typeof(fn) === 'function')) {
//               fn();
//             }
//           } else {
//             this.$apply(fn);
//           }
//         };
        
//         // asQ(Http, $rootScope, $q);
//         // asHttp(Http, $http);
//         return Divshot.createClient(this._options);
//       }
//     };
//   });