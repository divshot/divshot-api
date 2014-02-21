var Divshot = require('../Divshot.js');
var querystring = require('querystring');

var auth = function(callback, options) {
  var options = options || {};
  var authOrigin = this.options.auth_origin || 'https://auth.divshot.com';
  var client = this;
  var interval = null;
  
  // Look for a Divshot authentication cookie already set on this domain
  if (options.cookie) {
    var cookie = querystring.decode(document.cookie, '; ');
    
    if (cookie['__dsat']) {
      var token = atob(cookie['__dsat']);
      client.setToken(token);
      client.user.self().then(function(user) {
        callback(null, user, token);
      }, function(err) {
        callback(JSON.parse(err.responseText));
      });
      
      return null;
    }
  }
  
  var tokenListener = function(e) {
    if (e.origin == authOrigin) {
      if (interval){ window.clearInterval(interval); }
      
      var data = e.data;
      if (data.error) {
        callback(data, null, null);
      } else {
        client.setToken(data.token);
        callback(null, data.user, data.access_token);
      }
      
      window.removeEventListener('message', tokenListener);
      if (popup) { popup.close() };
    }
    return true;
  }
  
  window.addEventListener('message', tokenListener);
  var popup = window.open(authOrigin + "/authorize?response_type=post_message&client_id=" + this.options.client_id, "divshotauth", "centerscreen=yes,chrome=yes,width=480,height=640,status=yes,menubar=no,location=no,personalbar=no");
  
  interval = window.setInterval(function() {
    try {
      if (!popup || popup == null || popup.closed) {
        window.clearInterval(interval);
        callback({error: 'access_denied', error_description: 'The user closed the authentication window before the process was completed.'}, null);
      }
    } catch (e) {}
  }, 500);
  
  return null; // TODO: Make this a promise
}

module.exports = auth;