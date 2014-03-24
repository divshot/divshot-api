var Divshot = require('../lib/divshot');
var expect = require('expect.js');

describe('divshot api wrapper set up', function (t) {
  var divshot;
  
  beforeEach(function () {
    divshot = new Divshot();
  });
  
  it('sets the token', function () {
    divshot.token('token');
    expect(divshot.token()).to.equal('token');
  });

  it('sets the token header when the token is set', function () {
    divshot.token('token');
    expect(divshot.header('Authorization')).to.equal('Bearer token');
  });
    
  it('overrides the host', function () {
    divshot.host('host');
    expect(divshot.host()).to.equal('host');
  });
    
  it('sets the client id on the session header', function () {
    divshot.session('client_id');
    expect(divshot.header('Authorization')).to.equal('Session client_id');
    expect(divshot.clientId()).to.equal('client_id');
  });
    
  it('forces CORS with credentials if session is set', function () {
    divshot.session('client_id');
    expect(divshot.xhr('withCredentials')).to.be.ok();
  });
  
  it('credentials', function () {
    divshot.credentials('username', 'password');
    
    expect(divshot.credentials()).to.eql({
      username: 'username',
      password: 'password'
    });
    
    divshot.username('username1');
    expect(divshot.username()).to.equal('username1');
    
    divshot.password('password1');
    expect(divshot.password()).to.equal('password1');
  });
  
  describe('versioning', function () {
    it('has a default api version of 0.5.0', function () {
      expect(divshot.apiVersion()).to.equal('0.5.0');
    });
      
    it('sets a custom api version', function () {
      divshot.apiVersion('0.6.0');
      expect(divshot.apiVersion()).to.equal('0.6.0');
    });
      
    it('sets the default api version from the environment', function () {
      process.env.DIVSHOT_API_URL = '0.6.0';
      var divshot = new Divshot();
      expect(divshot.apiVersion()).to.equal('0.6.0');
    });
      
    it('sets the version header for all http requests', function () {
      expect(divshot.header('Accepts-Version')).to.equal(divshot.apiVersion());
    });
  });
});