module.exports = function (api, divshot) {
  var user = require('./user')(api);
  
  var apps = api.endpoint('apps', {
    hooks: {
      pre: function (next) {
        this.getEndpoint('users').authenticate(function (err, token) {
          if (token) divshot.setTokenHeader(token, apps);
          next();
        });
      },
      
    },
    
    _buildsFor: function (app) {
      return app.endpoint('builds', {
        id: function (id) {
          return this.one(id, {
            finalize: function (callback) {
              return this.http.request(this.url() + '/finalize', 'PUT', function (err, response, body) {
                if (callback) callback(null, response);
              });
            },
            
            release: function (environment, callback) {
              return this.http.request(app.url() + '/releases/' + environment, 'POST', {
                form: {
                  build: this.options.id
                }
              }, function (err, response, body) {
                if (callback) callback(err, response);
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
              return this.http.request(this.url() + '/rollback', 'POST', function (err, response, body) {
                if (callback) callback(err, response);
              });
            },
            
            rollbackTo: function (version, callback) {
              return this.http.request(this.url() + '/rollback', 'POST', {
                form: {
                  version: version
                }
              }, function (err, response, body) {
                if (callback) callback(err, response);
              });
            },
            
            promote: function (environment, callback) {
              return this.http.request(this.url(), 'POST', {
                form: {
                  environment: environment
                }
              }, function (err, response, body) {
                if (callback) callback(err, body)
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
        _domainRequest: function (domain, method, payload, callback) {
          
          return this.http.request(this.url() + '/' + domain, method, payload, function (err, response, body) {
            if (callback) callback(err, response);
          });
        },
        
        add: function (domain, payload, callback) {
          return this._domainRequest(domain, 'PUT', {form: payload}, callback);
        },
        
        remove: function (domain, callback) {
          return this._domainRequest(domain, 'DELETE', {}, callback);
        }
      });
      
      // PUT /apps/:app_id/env/:env/config
      app.env = function (env) {
        return app.endpoint('env').one(env, {
          
          config: function (configData, callback) {
            var url = this.url() + '/config';
            
            return this.http.request(url, 'PUT', {
              form: {
                config: configData
              }
            }, function (err, response, body) {
              callback(err, response);
            });
          },
          
          purgeCache: function (done) {
            
            return this.http.request(this.url() + '/cache', 'DELETE', done);
          }
        });
      };
      
      // Webhooks
      app.webhooks = app.endpoint('hooks');
      app.webhooks.remove = function (id, callback) {
        return app.webhooks.http.request(app.webhooks.url() + '/' + id, 'DELETE', {}, callback);
      };
      app.webhooks.pause = function (hook, callback) {
        return app.webhooks.one(hook.id).update({active: false}, callback);
      };
      app.webhooks.resume = function (hook, callback) {
        return app.webhooks.one(hook.id).update({active: true}, callback);
      };
      
      app.subscription = {
        updateCard: function (card, callback) {
          var url = app.url() + '/subscription/card';
          
          return app.http.request(url, 'PUT', {
            form: {
              card: card
            }
          }, callback);
        }
      };
      
      app.stats = function (done) {
        return app.endpoint('stats').list(done);
      };
      
      app.purgeCache = function (done) {
        
        return this.http.request(this.url() + '/cache', 'DELETE', done);
      };
      
      return app;
    },
    
    organization: function (orgId, callback) {
      var url = this.options.host + '/organizations/' + orgId + '/apps';
      return this.http.request(url, 'GET', callback);
    },
    
    create: function (name, callback) {
      return this.http.request(this.url(), 'POST', {
        form: {
          name: name
        }
      }, callback);
    },
    
    createFromObject: function (payload, callback) {
      return this.http.request(this.url(), 'POST', {form:payload}, callback);
    },

    remove: function (callback) {
      return this.http.request(this.url(), 'DELETE', {}, callback);
    }
  });
  
  return apps;
};