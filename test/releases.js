var expect = require('expect.js');
var Divshot = require('../lib/divshot');
var Mocksy = require('mocksy');
var server = new Mocksy({port: 9999});

describe('releases', function () {
  
  var divshot;
  
  beforeEach(function (done) {
    divshot = new Divshot();
    divshot.host('http://localhost:9999');
    server.start(done);
  });
  
  afterEach(function (done) {
    server.stop(done);
  });
  
  it('provides a releases endpoint', function () {
    return divshot.releases.list().then(function (res) {
      expect(res.body.url).to.equal('/releases');
    });
  });
  
  it('looks up a release by hostname', function () {
    return divshot.releases.lookup('test.com').then(function (res) {
      expect(res.body.url).to.equal('/releases/lookup?host=test.com');
    });
  });
  
});