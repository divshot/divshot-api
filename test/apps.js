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
  
  it('gets a list of apps', function (done) {
    divshot.apps.list().then(function (res) {
      expect(res.url).to.equal('/apps');
      expect(res.method).to.equal('GET');
      done();
    });
  });
  
  it('gets an app by id', function (done) {
    divshot.apps.id(123).get().then(function (res) {
      expect(res.url).to.equal('/apps/123');
      expect(res.method).to.equal('GET');
      done();
    });
  });
  
  describe('single app functions', function () {
    var app;
    
    beforeEach(function () {
      app = divshot.apps.id(123);
    });
    
    // domains
    describe('domains', function () {
      
      it('gets a list of domains for a given app id', function (done) {
        app.domains.list().then(function (res) {
          expect(res.url).to.equal('/apps/123/domains');
          done();
        });
      });
      
      it('adds a domain', function (done) {
        app.domains.add('www.divshot.com').then(function (res) {
          expect(res.url).to.equal('/apps/123/domains/www.divshot.com');
          expect(res.method).to.equal('PUT');
          done();
        });
      });
      
      it('removes a domain', function (done) {
        app.domains.remove('www.divshot.com').then(function (res) {
          expect(res.url).to.equal('/apps/123/domains/www.divshot.com');
          expect(res.method).to.equal('DELETE');
          done();
        });
      });
      
    });
    
    it('update s an apps configuration', function (done) {
      app.env('production').configure({
        name: 'name'
      }).then(function (res) {
        expect(res.url).to.equal('/apps/123/env/production/config');
        expect(res.body).to.eql({name: 'name'});
        expect(res.method).to.equal('PUT', 'method');
        done();
      });
    });
    
    describe('builds', function (done) {
      
      it('gets a single build by id', function (done) {
        app.builds.id(456).get().then(function (res) {
          expect(res.url).to.equal('/apps/123/builds/456');
          done();
        });
      });
    
      it('finalizes a build for a given app', function (done) {
        app.builds.finalize(456).then(function (res) {
          expect(res.url).to.equal('/apps/123/builds/456/finalize');
          done();
        });
      });
      
      it('released to production url', function (done) {
        app.builds.id(789).release('production').then(function (res) {
          expect(res.url).to.equal('/apps/123/releases/production');
          expect(res.method).to.equal('POST');
          expect(res.body).to.eql({build: '789'});
          done();
        });
      });
      
    });
    
    describe('releases', function (done) {
      
      it('gets app releases', function (done) {
        app.releases.list().then(function (res) {
          expect(res.url).to.equal('/apps/123/releases')
          done();
        });
      });
      
      it('gets a list of releases for an environment', function (done) {
        app.releases.env('production').get().then(function (res) {
          expect(res.url).to.equal('/apps/123/releases/production');
          expect(res.method).to.equal('GET');
          done();
        });
      });
      
      it('rolls back a release by environment', function (done) {
        app.releases.env('production').rollback().then(function (res) {
          expect(res.url).to.equal('/apps/123/releases/production/rollback');
          expect(res.method).to.equal('POST');
          done();
        });
      });
      
      it('rolls back to a given version number', function (done) {
        app.releases.env('production').rollback('123').then(function (res) {
          expect(res.body).to.eql({version: '123'});
          done();
        });
      });
      
      it('promotes to another environment', function (done) {
        app.releases.env('production').promote('staging').then(function (res) {
          expect(res.url).to.equal('/apps/123/releases/production');
          expect(res.method).to.equal('POST');
          expect(res.body).to.eql({environment: 'staging'});
          done();
        });
      });
      
    });

  });

  it('gets all apps owned by an organization', function (done) {
    divshot.apps.organization('123').then(function (res) {
      expect(res.url).to.equal('/organizations/123/apps');
      expect(res.method).to.equal('GET');
      done();
    });
  });
  
});