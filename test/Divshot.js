var expect = require('chai').expect;
var sinon = require('sinon');
var Divshot = require('../lib/Divshot');
var env = require('../lib/env');
var userData = require('./fixtures/user_data');
var User = require('../lib/User');

describe('Divshot', function () {
  var divshot;
  
  beforeEach(function () {
    divshot = createClient();
    sinon.spy(divshot.user, 'authenticate');
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
    expect(divshot.options.apiHost).to.equal(env.API_HOST);
  });
  
  it('instantiates the User functionality', function () {
    expect(divshot.user instanceof User).to.be.ok;
  });
  
  it('accepts a token and ignores email and password', function (done) {
    var d = Divshot.createClient({
      token: 'token'
    });
    
    done();
  });
});

function createClient () {
  return Divshot.createClient({
    email: userData.email,
    password: userData.password
  });
}