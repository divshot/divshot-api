var Divshot = require('../lib/divshot');
var Mocksy = require('mocksy');
var server = new Mocksy({port: 9999});
var test = require('tapes');

test('apps', function (t) {
  var divshot;
  
  t.beforeEach(function (t) {
    divshot = new Divshot();
    divshot.host('http://localhost:9999');
    server.start(t.end);
  });
  
  t.afterEach(function (t) {
    server.stop(t.end);
  });
  
  t.test('gets a list of apps', function (t) {
    divshot.apps.list().then(function (res) {
      t.equal(res.url, '/apps', 'url');
      t.equal(res.method, 'GET', 'method');
      t.end();
    });
  });
  
  t.test('gets an app by id', function (t) {
    divshot.apps.id(123).get().then(function (res) {
      t.equal(res.url, '/apps/123', 'url');
      t.equal(res.method, 'GET', 'method');
      t.end();
    });
  });
  
  t.test('single app functions', function (t) {
    var app;
    
    t.beforeEach(function (t) {
      app = divshot.apps.id(123);
      t.end();
    });
    
    // domains
    t.test('domains', function (t) {
      t.plan(5);
      
      app.domains.list().then(function (res) {
        t.equal(res.url, '/apps/123/domains', 'gets a list of domains for a given app id');
      });
      
      app.domains.add('www.divshot.com').then(function (res) {
        t.equal(res.url, '/apps/123/domains/www.divshot.com', 'url for adding a domain');
        t.equal(res.method, 'PUT', 'method for adding a domain');
      });
      
      app.domains.remove('www.divshot.com').then(function (res) {
        t.equal(res.url, '/apps/123/domains/www.divshot.com', 'url for removing domain');
        t.equal(res.method, 'DELETE', 'method for removing domain');
      });
    });
    
    // environments
    t.test('update s an apps configuration', function (t) {
      t.plan(3);
      
      app.env('production').configure({
        name: 'name'
      }).then(function (res) {
        t.equal(res.url, '/apps/123/env/production/config', 'url');
        t.deepEqual(res.body, {name: 'name'}, 'body');
        t.equal(res.method, 'PUT', 'method');
      });
    });
    
    t.test('builds', function (t) {
      t.plan(5);
    
      app.builds.id(456).get().then(function (res) {
        t.equal(res.url, '/apps/123/builds/456', 'gets a single build by id');
      });
    
      app.builds.finalize(456).then(function (res) {
        t.equal(res.url, '/apps/123/builds/456/finalize', 'finalizes a build for a given app');
      });
    
      app.builds.id(789).release('production').then(function (res) {
        t.equal(res.url, '/apps/123/releases/production', 'released to production url');
        t.equal(res.method, 'POST', 'released to production method');
        t.deepEqual(res.body, {build: '789'}, 'released to production body');
      });
    });
    
    t.test('releases', function (t) {
      t.plan(9);
      
      app.releases.list().then(function (res) {
        t.equal(res.url, '/apps/123/releases', 'release url')
      });
      
      app.releases.env('production').get().then(function (res) {
        t.equal(res.url, '/apps/123/releases/production', 'release environment');
        t.equal(res.method, 'GET', 'gets release by environment');
      });
      
      app.releases.env('production').rollback().then(function (res) {
        t.equal(res.url, '/apps/123/releases/production/rollback', 'rolls back a release by environment');
        t.equal(res.method, 'POST', 'sends a POST request to rollback release');
      });
      
      app.releases.env('production').rollback('123').then(function (res) {
        t.deepEqual(res.body, {version: '123'}, 'rolls back to a given version number');
      });
      
      app.releases.env('production').promote('staging').then(function (res) {
        t.equal(res.url, '/apps/123/releases/production', 'url for promoting a release');
        t.equal(res.method, 'POST', 'post request to promote a release')
        t.deepEqual(res.body, {environment: 'staging'}, 'passes name of environment to promote');
      });
    });
    
    t.end();
  });

  t.test('gets all apps owned by an organization', function (t) {
    divshot.apps.organization('123').then(function (res) {
      t.equal(res.url, '/organizations/123/apps', 'url to get app list')
      t.equal(res.method, 'GET', 'sends a get request');
      t.end();
    });
  });

  t.end();
});