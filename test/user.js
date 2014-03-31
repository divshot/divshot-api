var Divshot = require('../lib/divshot');
var Mocksy = require('mocksy');
var server = new Mocksy({port: 9999});
var expect = require('expect.js');
var btoa = require('btoa');

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
  
  it('sets a user as welcomed', function () {
    return divshot.user.welcomed().then(function (res) {
      expect(res.url).to.equal('/self/welcomed');
      expect(res.method).to.equal('PUT');
    });
  });
  
  it('generates an authentication ticket', function () {
    divshot.clientId(123);
    
    return divshot.user.generateTicket().then(function (res) {
      expect(res.url).to.equal('/token/tickets');
      expect(res.method).to.equal('POST');
      expect(res.headers.authorization).to.equal('Basic ' + btoa(123));
    });
  });
  
  it('checks the status of an authentication ticket', function () {
    divshot.clientId(123);
    
    return divshot.user.checkTicketStatus('ticket_name').then(function (res) {
      expect(res.url).to.equal('/token');
      expect(res.method).to.equal('POST');
      expect(res.headers.authorization).to.equal('Basic ' + btoa(123));
      expect(res.body).to.eql({
        grant_type: 'ticket',
        ticket: 'ticket_name'
      });
    });
  });
  
  it('authenticates a user with a token', function () {
    divshot.credentials('username', 'password');
    
    return divshot.user.tokenAuth().then(function (token) {
      expect(token).to.not.be.ok();
    });
  });
  
  it('returns the token if user is authenticated', function () {
    divshot.token('token');
    return divshot.user.tokenAuth().then(function (token) {
      expect(token).to.equal('token');
    });
  });
  
  it('returns nothing if the session is set', function () {
    divshot.session('client_id');
    return divshot.user.tokenAuth().then(function (token) {
      expect(token).to.not.be.ok();
    });
  });
  
  it('makes request to get current user data', function () {
    return divshot.user.self().then(function (user) {
      expect(user.url).to.equal('/self');
      expect(user.method).to.equal('GET');
    });
  });
  
  it('creates a user endpoint by id', function () {
    var user = divshot.user.id(123);
    return user.get().then(function (res) {
      expect(res.url).to.equal('/users/123');
    });
  });
  
  it('resets the user password', function () {
    return divshot.user.id(123).password.reset().then(function (res) {
      expect(res.url).to.equal('/actions/reset_password/123');
      expect(res.method).to.equal('POST');
    });
  });
  
  describe('emails', function () {
    
    it('adds an email to the user', function () {
      return divshot.user.id(123).emails.add('email@email.com').then(function (res) {
        expect(res.body).to.eql({address: 'email@email.com'});
      });
    });
    
    it('sets the primary email for a user', function () {
      return divshot.user.id(123).emails.add('email@email.com', true).then(function (res) {
        expect(res.body).to.eql({address: 'email@email.com', primary: "true"});
      });
    });
    
    it('removes a user email', function () {
      return divshot.user.id(123).emails.remove('email@email.com').then(function (res) {
        expect(res.url).to.equal('/self/emails/email@email.com');
        expect(res.method).to.equal('DELETE');
      });
    });
    
    it('resends an invite to the user', function () {
      return divshot.user.id(123).emails.resend('email@email.com').then(function (res) {
        expect(res.url).to.equal('/self/emails/email@email.com/resend');
        expect(res.method).to.equal('POST');
      });
    });
    
  });
  
});