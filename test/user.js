var Divshot = require('../lib/divshot');
var test = require('tapes');
var Mocksy = require('mocksy');
var server = new Mocksy({port: 9999});

test('user', function (t) {
  var divshot;
  
  t.beforeEach(function (t) {
    divshot = new Divshot();
    divshot.host('http://localhost:9999');
    server.start(t.end);
  });
  
  t.afterEach(function (t) {
    server.stop(t.end);
  });
  
  t.test('authenticates a user with a token', function (t) {
    divshot.credentials('username', 'password');
    
    divshot.user.tokenAuth().then(function (token) {
      t.equal(token, undefined, 'returned token');
      t.end();
    });
  });
  
  t.test('returns the token if user is authenticated', function (t) {
    divshot.token('token');
    divshot.user.tokenAuth().then(function (token) {
      t.equal(token, 'token', 'returns the current token');
      t.end();
    });
  });
  
  t.test('returns nothing if the session is set', function (t) {
    divshot.session('client_id');
    divshot.user.tokenAuth().then(function (token) {
      t.equal(token, undefined, 'returns nothing');
      t.end();
    });
  });
  
  
  t.end();
});