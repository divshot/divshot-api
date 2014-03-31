var Divshot = require('../lib/divshot');
var Mocksy = require('mocksy');
var server = new Mocksy({port: 9999});
var expect = require('expect.js');

describe('apps', function () {
  
  var divshot;
  
  beforeEach(function (done) {
    divshot = new Divshot();
    divshot.host('http://localhost:9999');
    server.start(done);
  });
  
  afterEach(function (done) {
    server.stop(done);
  });
  
  it('gets a list of apps', function () {
    return divshot.apps.list().then(function (res) {
      expect(res.url).to.equal('/apps');
      expect(res.method).to.equal('GET');
    });
  });
  
  it('gets an app by id', function () {
    return divshot.apps.id(123).get().then(function (res) {
      expect(res.url).to.equal('/apps/123');
      expect(res.method).to.equal('GET');
    });
  });
  
  describe('single app functions', function () {
    var app;
    
    beforeEach(function () {
      app = divshot.apps.id(123);
    });
    
    // domains
    describe('domains', function () {
      
      it('gets a list of domains for a given app id', function () {
        return app.domains.list().then(function (res) {
          expect(res.url).to.equal('/apps/123/domains');
        });
      });
      
      it('adds a domain', function () {
        return app.domains.add('www.divshot.com').then(function (res) {
          expect(res.url).to.equal('/apps/123/domains/www.divshot.com');
          expect(res.method).to.equal('PUT');
        });
      });
      
      it('removes a domain', function () {
        return app.domains.remove('www.divshot.com').then(function (res) {
          expect(res.url).to.equal('/apps/123/domains/www.divshot.com');
          expect(res.method).to.equal('DELETE');
        });
      });
      
    });
    
    it('updates an apps configuration', function () {
      return app.env('production').configure({
        name: 'name'
      }).then(function (res) {
        expect(res.url).to.equal('/apps/123/env/production/config');
        expect(res.body).to.eql({name: 'name'});
        expect(res.method).to.equal('PUT', 'method');
      });
    });
    
    describe('builds', function (done) {
      
      it('gets a single build by id', function () {
        return app.builds.id(456).get().then(function (res) {
          expect(res.url).to.equal('/apps/123/builds/456');
        });
      });
    
      it('finalizes a build for a given app', function () {
        return app.builds.finalize(456).then(function (res) {
          expect(res.url).to.equal('/apps/123/builds/456/finalize');
        });
      });
      
      it('released to production url', function () {
        return app.builds.id(789).release('production').then(function (res) {
          expect(res.url).to.equal('/apps/123/releases/production');
          expect(res.method).to.equal('POST');
          expect(res.body).to.eql({build: '789'});
        });
      });
      
    });
    
    describe('releases', function (done) {
      
      it('gets app releases', function () {
        return app.releases.list().then(function (res) {
          expect(res.url).to.equal('/apps/123/releases')
        });
      });
      
      it('gets a list of releases for an environment', function () {
        return app.releases.env('production').get().then(function (res) {
          expect(res.url).to.equal('/apps/123/releases/production');
          expect(res.method).to.equal('GET');
        });
      });
      
      it('rolls back a release by environment', function () {
        return app.releases.env('production').rollback().then(function (res) {
          expect(res.url).to.equal('/apps/123/releases/production/rollback');
          expect(res.method).to.equal('POST');
        });
      });
      
      it('rolls back to a given version number', function () {
        return app.releases.env('production').rollback('123').then(function (res) {
          expect(res.body).to.eql({version: '123'});
        });
      });
      
      it('promotes to another environment', function () {
        return app.releases.env('production').promote('staging').then(function (res) {
          expect(res.url).to.equal('/apps/123/releases/production');
          expect(res.method).to.equal('POST');
          expect(res.body).to.eql({environment: 'staging'});
        });
      });
      
    });

  });

  it('gets all apps owned by an organization', function () {
    return divshot.apps.organization('123').then(function (res) {
      expect(res.url).to.equal('/organizations/123/apps');
      expect(res.method).to.equal('GET');
    });
  });
  
});