// var Divshot = require('../lib/divshot');
// var Mocksy = require('mocksy');
// var server = new Mocksy({port: 9999});
// var lab = require('lab');
// var describe = lab.describe;
// var it = lab.it;
// var expect = lab.expect;
// var beforeEach = lab.beforeEach;
// var afterEach = lab.afterEach;

// describe('apps', function () {
//   var divshot;
  
//   beforeEach(function (done) {
//     divshot = new Divshot();
//     divshot.host('http://localhost:9999');
//     server.start(done);
//   });
  
//   afterEach(function (done) {
//     server.stop(done);
//   });
  
//   it('gets a list of apps', function (done) {
//     divshot.apps.list().then(function (res) {
//       expect(res.url).to.equal('/apps');
//       expect(res.method).to.equal('GET');
//       done();
//     });
//   });
  
//   it('gets an app by id', function (done) {
//     divshot.apps.id(123).get().then(function (res) {
//       expect(res.url).to.equal('/apps/123');
//       expect(res.method).to.equal('GET');
//       done();
//     });
//   });
  
//   describe('single app functions', function () {
//     var app;
    
//     beforeEach(function (done) {
//       app = divshot.apps.id(123);
//       server.start(done);
//     });
    
//     afterEach(function (done) {
//       server.stop(done);
//     });
    
//     // domains
    
//     it('gets a list of domains for a given app id', function (done) {
//       app.domains.list().then(function (res) {
//         expect(res.url).to.equal('/apps/123/domains');
//         done();
//       });
//     });
    
//     it('adds a domain', function (done) {
//       app.domains.add('www.divshot.com').then(function (res) {
//         expect(res.url).to.equal('/apps/123/domains/www.divshot.com');
//         expect(res.method).to.equal('PUT');
//         done();
//       });
//     });
    
//     it('removes a domain', function (done) {
//       app.domains.remove('www.divshot.com').then(function (res) {
//         expect(res.url).to.equal('/apps/123/domains/www.divshot.com');
//         expect(res.method).to.equal('DELETE');
//         done();
//       });
//     });
    
//     // environments
    
//     it('updates an apps configuration', function (done) {
//       app.env('production').configure({
//         name: 'name'
//       }).then(function (res) {
//         expect(res.url).to.equal('/apps/123/env/production/config');
//         expect(res.body).to.eql({name: 'name'});
//         expect(res.method).to.equal('PUT');
//         done();
//       });
//     });
    
//     // builds
    
//     it('gets a single build by id', function (done) {
//       app.builds.id(456).get().then(function (res) {
//         expect(res.url).to.equal('/apps/123/builds/456');
//         done();
//       });
//     });
    
//     it('finalizes a build for a given app', function (done) {
//       app.builds.finalize(456).then(function (res) {
//         expect(res.url).to.equal('/apps/123/builds/456/finalize');
//         done();
//       });
//     });
    
//     it('releases an environment for a given app', function (done) {
//       app.builds.id(789).release('production').then(function (res) {
//         expect(res.url).to.equal('/apps/123/releases/production');
//         expect(res.method).to.equal('POST');
//         expect(res.body).to.eql({build: '789'});
//         done();
//       });
//     });
    
//     // releases
    
//   });
  
  
// });