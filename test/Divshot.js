var Divshot = require('../lib/divshot');
var test = require('tapes');

test('divshot api wrapper set up', function (t) {
  var divshot = new Divshot();
  
  t.beforeEach(function (t) {
    divshot = new Divshot();
    t.end();
  });
  
  t.test('sets the token', function (t) {
    divshot.token('token');
    t.equal(divshot.token(), 'token', 'set the token');
    t.end();
  });

  t.test('sets the token header when the token is set', function (t) {
    divshot.token('token');
    t.equal(divshot.header('Authorization'), 'Bearer token', 'set the bearer token header');
    t.end()
  });
    
  t.test('overrides the host', function (t) {
    divshot.host('host');
    t.equal(divshot.host(), 'host', 'set the host');
    t.end();
  });
    
  t.test('sets the client id on the session header', function (t) {
    divshot.session('client_id');
    t.equal(divshot.header('Authorization'), 'Session client_id', 'set the session header');
    t.equal(divshot.clientId(), 'client_id', 'set the client id');
    t.end();
  });
    
  t.test('forces CORS with credentials if session is set', function (t) {
    divshot.session('client_id');
    t.ok(divshot.xhr('withCredentials'), 'set withCredentials');
    t.end();
  });
  
  t.test('versioning', function (t) {
    t.test('has a default api version of 0.5.0', function (t) {
      t.equal(divshot.apiVersion(), '0.5.0', 'has default');
      t.end();
    });
      
    t.test('sets a custom api version', function (t) {
      divshot.apiVersion('0.6.0');
      t.equal(divshot.apiVersion(), '0.6.0', 'set the version number');
      t.end();
    });
      
    t.test('sets the default api version from the environment', function (t) {
      process.env.DIVSHOT_API_URL = '0.6.0';
      var divshot = new Divshot();
      t.equal(divshot.apiVersion(), '0.6.0', 'set the version number');
      t.end();
    });
      
    t.test('sets the version header for all http requests', function (t) {
      t.equal(divshot.header('Accepts-Version'), divshot.apiVersion(), 'set api version number');
      t.end();
    });
    
    t.end();
  });
  
  t.end();
});