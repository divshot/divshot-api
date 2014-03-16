var urlJoin = require('url-join');

module.exports = function () {
  var apps = this.resource('apps');
  
  apps.id = function (id) {
    var app =  this.one(id);
    
    app.domains = app.resource('domains', {
      add: function (domain) {
        return this.api.put(urlJoin(this.url(), domain));
      },
      
      remove: function (domain) {
        return this.api.delete(urlJoin(this.url(), domain));
      }
    });
    
    app.env = function (environment) {
      return app.resource('env').one(environment, {
        configure: function (config) {
          return this.one('config').update(config);
        }
      });
    };
    
    app.builds = app.resource('builds', {
      id: function (id) {
        return this.one(id, {
          release: function (environment) {
            return this.api.post(urlJoin(app.url(), 'releases', environment), {
              form: {
                build: id
              }
            });
          }
        });
      },
      
      finalize: function (buildId) {
        return this.api.put(urlJoin(this.url(), buildId, 'finalize'));
      }
    });
    
    return app;
  };
  
  return apps;
};