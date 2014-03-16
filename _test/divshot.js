var expect = require('chai').expect;
var sinon = require('sinon');
var Divshot = require('../lib/divshot');
var userData = require('./fixtures/user_data');
var User = require('../lib/user');
var Apps = require('../lib/apps');

describe('Divshot', function() {
  var divshot;
  
  beforeEach(function () {
    divshot = createClient();
  });
  
  afterEach(function () {
    divshot = null;
  });
  
  it('creates and instance of Divshot', function () {
    expect(divshot instanceof Divshot).to.be.ok;
  });
  
  it('sets defaults', function () {
    expect(divshot.options.email).to.equal(userData.email);
    expect(divshot.options.password).to.equal(userData.password);
  });
  
  it('accepts a token and ignores email and password', function () {
    var d = Divshot.createClient({
      token: 'token'
    });
    
    expect(d.options.token).to.equal('token');
  });
  
  it('instantiates a user', function () {
    expect(divshot.user instanceof User).to.be.ok;
  });
  
  it('instantiates the app endpoint', function () {
    expect(divshot.apps instanceof Apps).to.be.ok;
  });
  
  it('can set the Api end point on instantiation', function () {
    var CUSTOM_HOST = 'http://customhost.com';
    
    var d = Divshot.createClient({
      email: userData.email,
      password: userData.password,
      host: CUSTOM_HOST
    });
    
    expect(d.Api.HOST).to.equal(CUSTOM_HOST);
  });
  
});

function createClient () {
  return Divshot.createClient({
    email: userData.email,
    password: userData.password
  });
}