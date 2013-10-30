module.exports = function (api, divshot) {
  var user = require('./user')(api);
  
  var apps = api.endpoint('apps', {
    hooks: {
      pre: function (next) {
        this.getEndpoint('user').authenticate(function (err, token) {
          divshot.setTokenHeader(token, apps);
          next();
        });
      },
      
    },
    
    _buildsFor: function (app) {
      return app.endpoint('builds', {
        id: function (id) {
          return this.one(id, {
            finalize: function (callback) {
              this.http.request(this.url() + '/finalize', 'PUT', function (err, response, body) {
                callback(null, response);
              });
            },
            
            release: function (environment, callback) {
              this.http.request(app.url() + '/releases/' + environment, 'POST', {
                form: {
                  build: this.options.id
                }
              }, function (err, response, body) {
                callback(err, response);
              });
            }
          });
        }
      });
    },
    
    _releasesFor: function (app) {
      return app.endpoint('releases', {
        env: function (id) {
          return this.one(id, {
            rollback: function (callback) {
              this.http.request(this.url() + '/rollback', 'POST', function (err, response, body) {
                callback(err, response);
              });
            },
            
            promote: function (environment, callback) {
              this.http.request(this.url(), 'POST', {
                form: {
                  environment: environment
                }
              }, function (err, response, body) {
                callback(err, body)
              });
            }
          });
        },
      });
    },
    
    id: function (id) {
      var app = this.one(id);
      app.builds = this._buildsFor(app);
      app.releases = this._releasesFor(app);
      
      app.domains = app.endpoint('domains', {
        _domainRequest: function (domain, method, callback) {
          this.http.request(this.url() + '/' + domain, method, function (err, response, body) {
            callback(err, response);
          });
        },
        
        add: function (domain, callback) {
          this._domainRequest(domain, 'PUT', callback);
        },
        
        remove: function (domain, callback) {
          this._domainRequest(domain, 'DELETE', callback);
        }
      });
      
      return app;
    }
  });
  
  return apps;
};