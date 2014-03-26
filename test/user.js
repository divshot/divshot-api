var Divshot = require('../lib/divshot');
var Mocksy = require('mocksy');
var server = new Mocksy({port: 9999});
var expect = require('expect.js');

describe('user', function () {
  
  var divshot;
  
  beforeEach(function (done) {
    divshot = new Divshot();
    divshot.host('http://localhost:9999');
    server.start(done);
  });
  
  afterEach(function (done) {
    server.stop(done);
  });
  
  it('deletes a user account');
  it('sets a user as welcomed');
  
  it('authenticates a user with a token', function (done) {
    divshot.credentials('username', 'password');
    
    divshot.user.tokenAuth().then(function (token) {
      expect(token).to.not.be.ok();
      done();
    });
  });
  
  it('returns the token if user is authenticated', function (done) {
    divshot.token('token');
    divshot.user.tokenAuth().then(function (token) {
      expect(token).to.equal('token');
      done();
    });
  });
  
  it('returns nothing if the session is set', function (done) {
    divshot.session('client_id');
    divshot.user.tokenAuth().then(function (token) {
      expect(token).to.not.be.ok();
      done();
    });
  });
  
  it('makes request to get current user data', function (done) {
    divshot.user.self().then(function (user) {
      expect(user.url).to.equal('/self');
      expect(user.method).to.equal('GET');
      done();
    });
  });
  
  it('creates a user endpoint by id', function (done) {
    var user = divshot.user.id(123);
    user.get().then(function (res) {
      expect(res.url).to.equal('/users/123');
      done();
    });
  });
  
  it('resets the user password', function (done) {
    divshot.user.id(123).password.reset().then(function (res) {
      expect(res.url).to.equal('/actions/reset_password/123');
      expect(res.method).to.equal('POST');
      done();
    });
  });
  
  describe('emails', function (done) {
    
    it('adds an email to the user', function (done) {
      divshot.user.id(123).emails.add('email@email.com').then(function (res) {
        expect(res.body).to.eql({address: 'email@email.com'});
        done();
      });
    });
    
    it('sets the primary email for a user', function (done) {
      divshot.user.id(123).emails.add('email@email.com', true).then(function (res) {
        expect(res.body).to.eql({address: 'email@email.com', primary: "true"});
        done();
      });
    });
    
    it('removes a user email', function (done) {
      divshot.user.id(123).emails.remove('email@email.com').then(function (res) {
        expect(res.url).to.equal('/self/emails/email@email.com');
        expect(res.method).to.equal('DELETE');
        done();
      });
    });
    
    it('resends an invite to the user', function (done) {
      divshot.user.id(123).emails.resend('email@email.com').then(function (res) {
        expect(res.url).to.equal('/self/emails/email@email.com/resend');
        expect(res.method).to.equal('POST');
        done();
      });
    });
    
  });
  
});