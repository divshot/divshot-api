var Divshot = require('../Divshot.js');
var querystring = require('querystring');

var auth = function(callback, options) {
  var options = options || {};
  options.mode = options.mode || 'popup';
  
  var authOrigin = this.options.auth_origin || 'https://auth.divshot.com';
  var client = this;
  var interval = null;
  
  var tokenListener = function(e) {
    if (e.origin == authOrigin) {
      if (interval){ window.clearInterval(interval); }
      
      var data = e.data;
      if (data.error) {
        callback(data, null, null);
      } else {
        client.setToken(data.token);
        if (options.store) {
          document.cookie = "__dsat=" + btoa(data.token) + ";max-age=" + (60 * 60 * 24 * 7).toString();
        }
        callback(null, data.user, data.access_token);
      }
      
      if (child && child.close) { child.close(); }
    }
    return true;
  }
  
  window.addEventListener('message', tokenListener);
  
  var authorizeUrl = authOrigin + "/authorize?response_type=post_message&client_id=" + this.options.client_id
  if (options.provider) { authorizeUrl += "&provider=" + options.provider; }
  
  var child;
  if (options.mode == 'iframe') {
    child = document.createElement('iframe');
    child.className = 'divshot-auth-frame';
    child.src = authorizeUrl;
    child.width = 480;
    child.height = 640;
  } else if (options.mode == 'popup') {
    child = window.open(authorizeUrl, "divshotauth", "centerscreen=yes,chrome=yes,width=480,height=640,status=yes,menubar=no,location=no,personalbar=no");
  } else {
    throw "Unknown auth mode. Must be 'iframe' or 'popup'";
  }
    
  interval = window.setInterval(function() {
    try {
      if (!child || child == null || child.closed) {
        window.clearInterval(interval);
        callback({error: 'access_denied', error_description: 'The user closed the authentication window before the process was completed.'}, null);
      }
    } catch (e) {}
  }, 500);
  
  return child; // TODO: Make this a promise
}

var cookie = function() {
  var cookie = querystring.decode(document.cookie, '; ');
  var client = this;
  
  if (cookie['__dsat']) {
    var token = atob(cookie['__dsat']);
    client.setToken(token);
    return true;
  } else {
    return false;
  }
}

module.exports = {
  auth: auth,
  authWithCookie: cookie
};