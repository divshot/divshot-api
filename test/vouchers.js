var Divshot = require('../lib/divshot');
var Mocksy = require('mocksy');
var server = new Mocksy({port: 9999});
var expect = require('expect.js');

describe('vouchers', function () {
  
  var divshot;
  
  beforeEach(function (done) {
    divshot = new Divshot();
    divshot.host('http://localhost:9999');
    server.start(done);
  });
  
  it('redeems a voucher', function () {
    return divshot.vouchers.redeem(123).then(function (res) {
      expect(res.body.url).to.equal('/vouchers/123/redeem');
      expect(res.body.method).to.equal('PUT');
    });
  });
  
});