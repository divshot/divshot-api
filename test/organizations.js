var Divshot = require('../lib/divshot');
var Mocksy = require('mocksy');
var server = new Mocksy({port: 9999});
var expect = require('expect.js');

describe('organizations', function (done) {
  
  var divshot;
  
  beforeEach(function (done) {
    divshot = new Divshot();
    divshot.host('http://localhost:9999');
    server.start(done);
  });
  
  afterEach(function (done) {
    server.stop(done);
  });
  
  describe('RESTful organizations', function (done) {
    
    it('list the organizations', function (done) {
      divshot.organizations.list().then(function (res) {
        expect(res.url).to.equal('/organizations');
        done();
      });
    });
    
    it('gets a single organization', function (done) {
      divshot.organizations.id('123').get().then(function (res) {
        expect(res.url).to.equal('/organizations/123');
        done();
      });
    });
    
    it('create an organization', function (done) {
      divshot.organizations.create({
        name: 'name',
      }).then(function (res) {
        expect(res.body).to.eql({name: 'name'});
        done();
      });
    });
    
    it('updates an organization', function (done) {
      divshot.organizations.id('123').update({
        name: 'name',
      }).then(function (res) {
        expect(res.body).to.eql({name: 'name'});
        done();
      });
    });
    
  });
  
  it('lists apps for an organization', function (done) {
    divshot.organizations.id('123').apps.list().then(function (res) {
      expect(res.url).to.equal('/organizations/123/apps');
      done();
    });
  });
  
  describe('members', function (done) {
    
    it('gets organization member list', function (done) {
      divshot.organizations.id('123').members.list().then(function (res) {
        expect(res.url).to.equal('/organizations/123/members');
        done();
      });
    });
    
    it('invites members to an organization', function (done) {
      divshot.organizations.id('123').members.create({
        name: 'email',
        email: 'email'
      }).then(function (res) {
        expect(res.body).to.eql({
          name: 'email',
          email: 'email'
        });
        done();
      });
    });

    it('sets the member priveleges on an organization', function (done) {
      divshot.organizations.id('123').members.id('456').update({
        admin: false // or true
      }).then(function (res) {
        expect(res.url).to.equal('/organizations/123/members/456');
        expect(res.body).to.eql({admin: 'false'});
        done();
      });
    });
    
    it('removes a member from an organization', function (done) {
      divshot.organizations.id('123').members.id('456').remove().then(function (res) {
        expect(res.url).to.equal('/organizations/123/members/456');
        expect(res.method).to.equal('DELETE');
        done();
      });
    });

  });

});