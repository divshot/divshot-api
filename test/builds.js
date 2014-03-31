var Divshot = require('../lib/divshot');
var Mocksy = require('mocksy');
var server = new Mocksy({port: 9999});
var expect = require('expect.js');

describe('builds', function () {
  
  var divshot;
  
  beforeEach(function (done) {
    divshot = new Divshot();
    divshot.host('http://localhost:9999');
    server.start(done);
  });
  
  afterEach(function (done) {
    server.stop(done);
  });
  
  it('provides a builds endpoint', function () {
    return divshot.builds.list().then(function (res) {
      expect(res.body.url).to.equal('/builds');
    });
  });
  
});