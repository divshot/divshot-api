module.exports = function () {
  var apps = this.resource('apps');

  // Single app
  apps.id = function (id) {
    var app =  this.one(id);

    // Domains
    app.domains = app.resource('domains', {
      add: function (domain) {
        return this.one(domain).update();
      },

      remove: function (domain) {
        return this.one(domain).del();
      }
    });

    app.env = function (environment) {
      return app.resource('env').one(environment, {
        configure: function (config) {
          return this.one('config').update(config);
        }
      });
    };

    // Builds
    app.builds = app.resource('builds', {
      id: function (id) {
        return this.one(id, {
          release: function (environment) {
            return app.resource('releases').resource(environment).create({build: id});
          }
        });
      },

      finalize: function (buildId) {
        return this.one(buildId).one('finalize').update();
      }
    });

    // Releases
    app.releases = app.resource('releases', {
      env: function (environment) {
        return this.resource(environment, {
          rollback: function (version) {
            if (version) return this.resource('rollback').post({version: version});
            return this.resource('rollback').post();
          },

          promote: function (to) {
            return this.post({environment: to});
          }
        });
      }
    });

    return app;
  };

  // Some weird organization thing that I don't remember coding,
  // but it works
  apps.organization = function (id) {
    return this.api.get('/organizations/' + id + '/apps');
  };

  return apps;
};
