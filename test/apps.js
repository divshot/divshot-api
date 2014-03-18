var Divshot = require('../lib/divshot');
var Mocksy = require('mocksy');
var server = new Mocksy({port: 9999});
var suite = require('tapes');

suite('apps', function (t) {
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
  
  t.suite('single app functions', function (t) {
    var app;
    
    t.beforeEach(function (t) {
      app = divshot.apps.id(123);
      t.end();
    });
    
    // domains
    
    t.test('gets a list of domains for a given app id', function (t) {
      app.domains.list().then(function (res) {
        t.equal(res.url, '/apps/123/domains', 'url');
        t.end();
      });
    });
    
    t.test('adds a domain', function (t) {
      app.domains.add('www.divshot.com').then(function (res) {
        t.equal(res.url, '/apps/123/domains/www.divshot.com', 'url');
        t.equal(res.method, 'PUT', 'method');
        t.end();
      });
    });
    
    t.test('removes a domain', function (t) {
      app.domains.remove('www.divshot.com').then(function (res) {
        t.equal(res.url, '/apps/123/domains/www.divshot.com', 'url');
        t.equal(res.method, 'DELETE', 'method');
        t.end();
      });
    });
    
    // environments
    
    t.test('updates an apps configuration', function (t) {
      app.env('production').configure({
        name: 'name'
      }).then(function (res) {
        t.equal(res.url, '/apps/123/env/production/config', 'url');
        t.deepEqual(res.body, {name: 'name'}, 'body');
        t.equal(res.method, 'PUT', 'method');
        t.end();
      });
    });
    
    // builds
    
    t.test('gets a single build by id', function (t) {
      app.builds.id(456).get().then(function (res) {
        t.equal(res.url, '/apps/123/builds/456', 'url');
        t.end();
      });
    });
    
    t.test('finalizes a build for a given app', function (t) {
      app.builds.finalize(456).then(function (res) {
        t.equal(res.url, '/apps/123/builds/456/finalize', 'url');
        t.end();
      });
    });
    
    t.test('releases an environment for a given app', function (t) {
      app.builds.id(789).release('production').then(function (res) {
        t.equal(res.url, '/apps/123/releases/production', 'url');
        t.equal(res.method, 'POST', 'method');
        t.deepEqual(res.body, {build: '789'}, 'body');
        t.end();
      });
    });
    
    // releases

  });
});






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