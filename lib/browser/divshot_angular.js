angular.module('divshot', [])
  .provider('divshot', function () {
    var Divshot = require('../Divshot');
    var Http = require('narrator').Http;
    var asQ = require('narrator/lib/browser/asQ');
    var asHttp = require('narrator/lib/browser/asHttp');
    
    return {
      _options: {},
      
      configure: function (options) {
        this._options = options;
      },
      
      $get: function ($rootScope, $q, $http) {
        $rootScope.narratorApply = function(fn) {
          var phase = this.$root.$$phase;
          if(phase == '$apply' || phase == '$digest') {
            if(fn && (typeof(fn) === 'function')) {
              fn();
            }
          } else {
            this.$apply(fn);
          }
        };
        
        asQ(Http, $rootScope, $q);
        asHttp(Http, $http);
        return Divshot.createClient(this._options);
      }
    };
  });