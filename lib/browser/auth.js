var Divshot = require('../Divshot.js');

var auth = function(callback) {
  var authOrigin = this.options.auth_origin || 'https://auth.divshot.com';
  var client = this;
  var interval = null;
  
  var tokenListener = function(e) {
    if (e.origin == authOrigin) {
      data = JSON.parse(e.data);
      if (data.error) {
        callback(data, null);
      } else {
        if (interval){ window.clearInterval(interval); }
        client.setToken(data.token);
        callback(null, data.user);  
      }
    }
    window.removeEventListener('message', tokenListener);
    return true;
  }
  
  window.addEventListener('message', tokenListener);
  var popup = window.open(authOrigin + "/authorize?type=popup&client_id=525578a3421aa98155000004", "divshotauth", "top=50,left=50,width=480,height=640,status=1,menubar=0,location=0,personalbar=0");
  
  interval = window.setInterval(function() {
    try {
      if (!popup || popup == null || popup.closed) {
        window.clearInterval(interval);
        callback({error: 'user_denied', error_description: 'The user closed the authentication window before the process was completed.'}, null);
      }
    } catch (e) {}
  }, 500);
  
  return null; // TODO: Make this a promise
}

module.exports = auth;