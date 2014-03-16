var Divshot = require('../lib/divshot');
var lab = require('lab');
var describe = lab.describe;
var it = lab.it;
var expect = lab.expect;
var beforeEach = lab.beforeEach;
var afterEach = lab.afterEach;

describe('divshot api wrapper set up', function () {
  var divshot;
  
  beforeEach(function (done) {
    divshot = new Divshot();
    done();
  });
  
  it('sets the token', function (done) {
    divshot.token('token');
    expect(divshot.token()).to.equal('token');
    done();
  });
  
  it('sets the token header when the token is set', function (done) {
    divshot.token('token');
    expect(divshot.header('Authorization')).to.equal('Bearer token');
    done();
  });
  
  it('overrides the host', function (done) {
    divshot.host('host');
    expect(divshot.host()).to.equal('host');
    done();
  });
  
  it('sets the client id on the session header', function (done) {
    divshot.session('client_id');
    expect(divshot.header('Authorization')).to.equal('Session client_id');
    expect(divshot.clientId()).to.equal('client_id');
    done();
  });
  
  it('forces CORS with credentials if session is set', function (done) {
    divshot.session('client_id');
    expect(divshot.xhr('withCredentials')).to.equal(true);
    done();
  });
  
  it('has a default api version of 0.5.0', function (done) {
    expect(divshot.apiVersion()).to.equal('0.5.0');
    done();
  });
  
  it('sets a custom api version', function (done) {
    divshot.apiVersion('0.6.0');
    expect(divshot.apiVersion()).to.equal('0.6.0');
    done();
  });
  
  it('sets the default api version from the environment', function (done) {
    process.env.DIVSHOT_API_URL = '0.6.0';
    var divshot = new Divshot();
    expect(divshot.apiVersion()).to.equal('0.6.0');
    done();
  });
  
  it('sets the version header for all http requests', function (done) {
    expect(divshot.header('Accepts-Version')).to.equal(divshot.apiVersion());
    done();
  });
  
});

function requireNoCache (pathname) {
  delete require.cache[pathname];
  return require(pathname);
}