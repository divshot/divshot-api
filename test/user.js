var expect = require('chai').expect;
var sinon = require('sinon');
var Mocksy = require('mocksy');
var User = require('../lib/user');
var Api = require('../lib/api');
var PORT = 1337;
var STUB_HOST = 'http://localhost:' + PORT;
var server = new Mocksy({port: PORT});
var userData = require('./fixtures/user_data');

describe('User endpoint', function () {
  var user;
  
  beforeEach(function (done) {
    user = new User({
      email: userData.email,
      password: userData.password
    });
    
    Api.HOST = STUB_HOST;
    user.HOST = STUB_HOST;
    server.start(done);
  });
  
  afterEach(function (done) {
    server.stop(done);
  });
  
  it('initializes with authPath', function () {
    expect(user.authPath).to.equal('/auth/identity/callback');
  });
  
  it('initializes with credentials', function () {
    expect(user.credentials.email).to.equal(userData.email);
    expect(user.credentials.password).to.equal(userData.password);
  });
  
  it('parses the user token from the location header', function () {
    var token = user._parseTokenFromHeaders({
      location: 'http://localhost.com/#token=my_token'
    });
    
    expect(token).to.equal('my_token');
  });
  
  it('authenticates a user that has no token', function (done) {
    sinon.spy(user, '_parseTokenFromHeaders');
    
    user.authenticate(function (err, token) {
      expect(user._parseTokenFromHeaders.called).to.be.ok;
      done();
    });
  });
  
  it('sets the email and password credentials', function () {
    user.setCredentials({
      email: userData.email + 'asdf',
      password: userData.password + 'asdf'
    });
    
    expect(user.credentials.email).to.equal(userData.email + 'asdf');
    expect(user.credentials.password).to.equal(userData.password + 'asdf');
  });
  
  it('sets the token credentials', function () {
    user.setCredentials({
      token: 'the_token'
    });
    
    expect(user.credentials.token).to.equal('the_token');
  });
});