var Divshot = require('../lib/divshot');
var Mocksy = require('mocksy');
var server = new Mocksy({port: 9999});
var test = require('tapes');

test('organizations', function (t) {
  var divshot;
  
  t.beforeEach(function (t) {
    divshot = new Divshot();
    divshot.host('http://localhost:9999');
    server.start(t.end);
  });
  
  t.afterEach(function (t) {
    server.stop(t.end);
  });
  
  t.test('RESTful organizations', function (t) {
    t.plan(4);
    
    divshot.organizations.list().then(function (res) {
      t.equal(res.url, '/organizations', 'organizations list url');
    });
    
    divshot.organizations.id('123').get().then(function (res) {
      t.equal(res.url, '/organizations/123', 'get single organization');
    });
    
    divshot.organizations.create({
      name: 'name',
    }).then(function (res) {
      t.deepEqual(res.body, {
        name: 'name',
      }, 'creates an organization');
    });

    divshot.organizations.id('123').update({
      name: 'name',
    }).then(function (res) {
      t.deepEqual(res.body, {
        name: 'name',
      }, 'updates an organization');
    });
  });
  
  t.test('list apps for an organization', function (t) {
    divshot.organizations.id('123').apps.list().then(function (res) {
      t.equal(res.url, '/organizations/123/apps', 'organization apps list url');
      t.end();
    });
  });
  
  t.test('members', function (t) {
    t.plan(6);
     
    divshot.organizations.id('123').members.list().then(function (res) {
      t.equal(res.url, '/organizations/123/members', 'get organization member list');
    });

    divshot.organizations.id('123').members.create({
      name: 'email',
      email: 'email'
    }).then(function (res) {
      t.deepEqual(res.body, {
        name: 'email',
        email: 'email'
      }, 'invites members to an organization');
    });

    divshot.organizations.id('123').members.id('456').update({
      admin: false // or true
    }).then(function (res) {
      t.equal(res.url, '/organizations/123/members/456', 'url for member update');
      t.deepEqual(res.body, {admin: 'false'}, 'updates a member to remove admin priveleges');
    });

    divshot.organizations.id('123').members.id('456').remove().then(function (res) {
      t.equal(res.url, '/organizations/123/members/456', 'url for deleting organization member');
      t.equal(res.method, 'DELETE', 'method for deleting organization member');
    });
  });
  
  t.end();
});