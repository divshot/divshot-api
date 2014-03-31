var Divshot = require('../lib/divshot');
var Mocksy = require('mocksy');
var server = new Mocksy({port: 9999});
var expect = require('expect.js');

describe('organizations', function () {
  
  var divshot;
  
  beforeEach(function (done) {
    divshot = new Divshot();
    divshot.host('http://localhost:9999');
    server.start(done);
  });
  
  afterEach(function (done) {
    server.stop(done);
  });
  
  describe('RESTful organizations', function () {
    
    it('list the organizations', function () {
      return divshot.organizations.list().then(function (res) {
        expect(res.url).to.equal('/organizations');
      });
    });
    
    it('gets a single organization', function () {
      return divshot.organizations.id('123').get().then(function (res) {
        expect(res.url).to.equal('/organizations/123');
      });
    });
    
    it('create an organization', function () {
      return divshot.organizations.create({
        name: 'name',
      }).then(function (res) {
        expect(res.body).to.eql({name: 'name'});
      });
    });
    
    it('updates an organization', function () {
      return divshot.organizations.id('123').update({
        name: 'name',
      }).then(function (res) {
        expect(res.body).to.eql({name: 'name'});
      });
    });
    
  });
  
  it('lists apps for an organization', function () {
    return divshot.organizations.id('123').apps.list().then(function (res) {
      expect(res.url).to.equal('/organizations/123/apps');
    });
  });
  
  describe('members', function () {
    
    it('gets organization member list', function () {
      return divshot.organizations.id('123').members.list().then(function (res) {
        expect(res.url).to.equal('/organizations/123/members');
      });
    });
    
    it('invites members to an organization', function () {
      return divshot.organizations.id('123').members.create({
        name: 'email',
        email: 'email'
      }).then(function (res) {
        expect(res.body).to.eql({
          name: 'email',
          email: 'email'
        });
      });
    });

    it('sets the member priveleges on an organization', function () {
      return divshot.organizations.id('123').members.id('456').update({
        admin: false // or true
      }).then(function (res) {
        expect(res.url).to.equal('/organizations/123/members/456');
        expect(res.body).to.eql({admin: 'false'});
      });
    });
    
    it('removes a member from an organization', function () {
      return divshot.organizations.id('123').members.id('456').remove().then(function (res) {
        expect(res.url).to.equal('/organizations/123/members/456');
        expect(res.method).to.equal('DELETE');
      });
    });

  });

});