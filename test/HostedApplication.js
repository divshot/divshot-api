var expect = require('chai').expect;
var sinon = require('sinon');
var stubRequire = require('proxyquire');
var userData = require('./fixtures/user_data');
var User = stubRequire('../lib/User', {
  request: function (options, callback) {
    callback(null, {
      headers: {
        location: 'asdf#token=my_token'
      }
    }, 'body');
  }
});
var HostedApplication = stubRequire('../lib/HostedApplication', {
  request: function (options, callback) {
    callback(null, {}, {});
  }
});

describe('Hosted Application', function () {
  var app;
  
  beforeEach(function () {
    app = new HostedApplication(new User(userData), userData);
    
  });
  
  afterEach(function () {
    app = null;
  });
  
  it('sets the api path', function () {
    expect(app.path).to.equal('/apps');
  });
  
  it('creates an application', function () {
    var callbackSpy = sinon.spy();
    app.create('test-app', callbackSpy);
    
    expect(callbackSpy.called).to.be.ok;
  });
  
});