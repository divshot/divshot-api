var Divshot = require('../Divshot.js');

var auth = function(callback) {
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
        callback(null, data.user, data.access_token);  
      }
      
      window.removeEventListener('message', tokenListener);
      if (popup) { popup.close() };
    }
    return true;
  }
  
  window.addEventListener('message', tokenListener);
  var popup = window.open(authOrigin + "/authorize?grant_type=post_message&client_id=" + this.options.client_id, "divshotauth", "top=50,left=50,width=480,height=640,status=1,menubar=0,location=0,personalbar=0");
  
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