var expect = require('chai').expect;
var sinon = require('sinon');
var stubRequire = require('proxyquire');
var User = stubRequire('../lib/User', {
  request: function (options, callback) {
    callback(null, {
      headers: {
        location: 'asdf#token=my_token'
      }
    }, 'body');
  }
});
var userData = require('./fixtures/user_data');

describe('User', function () {
  var user;
  
  beforeEach(function () {
    user = new User(userData);
  });
  
  afterEach(function () {
    user = null;
  });
  
  it('has the api path for auth', function () {
    expect(user.options.authPath).to.equal('/auth/identity/callback');
  });
  
  it('parses the token from the api location header', function () {
    var headers1 = {
      location: 'http://redirect.com/#token=my_token'
    };
    var headers2 = {};
    
    var token1 = user._parseTokenFromHeaders(headers1);
    var token2 = user._parseTokenFromHeaders(headers2);
    
    expect(token1).to.equal('my_token');
    expect(token2).to.be.undefined;
  });
  
  it('authenticates and sets the user token from the api', function (done) {
    user.authenticate(function(err, token) {
      expect(user.options.token).to.equal('my_token');
      expect(token).to.equal('my_token');
      done();
    });
  });
});