var querystring = require('querystring');

var passwordAuth = function (options) {
  var client = this;
  var options = options;
  
  // var promise = new Promise(function(resolve, reject) {
  var promise = client._api.createPromise(function(resolve, reject) {
    // Fetch a token using resource owner password credential method
    client.user.http.request(client.user.options.host + '/token', 'POST', {
      form: {
        username: options.email,
        password: options.password,
        grant_type: 'password'
      },
      headers: {
        Authorization: 'Basic ' + btoa(client.options.client_id + ":")
      }
    }, function (err, response, body) {
      if (err) {
        try {
          reject(JSON.parse(err.responseText));
        } catch(e) {
          reject({
            error: 'unknown_error',
            error_description: err.responseText
          });
        }
      } else if (body.error) {
        reject(body);
      } else {
        resolve(body);
      }
    });
  });
  
  return promise;
}

var popupAuth = function(options) {
  var client = this;
  
  var promise = client._api.createPromise(function(resolve, reject) {
    var authOrigin = client.options.auth_origin || 'https://auth.divshot.com';
    var interval = null;
    
    var tokenListener = function(e) {
      if (e.origin === authOrigin) {
        if (interval){ window.clearInterval(interval); }
        
        var data = e.data;
        
        if (data.error) reject(data);
        else resolve(data);
        
        if (child && child.close) child.close();
      }
      
      return true;
    }
    
    window.addEventListener('message', tokenListener);
    
    var authorizeUrl = authOrigin + "/authorize?response_type=post_message&client_id=" + client.options.client_id
    if (options.provider) { authorizeUrl += "&provider=" + options.provider; }

    var child = window.open(authorizeUrl, "divshotauth", "centerscreen=yes,chrome=yes,width=480,height=640,status=yes,menubar=no,location=no,personalbar=no");
      
    interval = window.setInterval(function() {
      try {
        if (!child || child == null || child.closed) {
          window.clearInterval(interval);
          callback({error: 'access_denied', error_description: 'The user closed the authentication window before the process was completed.'}, null);
        }
      } catch (e) {}
    }, 500);
  });
  
  return promise; // TODO: Make this a promise
}


var auth = function() {
  var callback, options, provider, promise;
  var client = this;
  
  for (var i = 0; i < arguments.length; i++) {
    if (typeof arguments[i] === 'object'){ options = arguments[i] }
    else if (typeof arguments[i] === 'string'){ provider = arguments[i] }
    else if (typeof arguments[i] === 'function'){ callback = arguments[i] }
  }
  
  options = options || {}
  
  if (provider === 'password' && options.email && options.password) {
    promise = passwordAuth.call(client, options);
  } else {
    options.provider = provider;
    promise = popupAuth.call(client, options);
  }
  
  promise.then(function(res) {
    if (callback) callback(null, res);
    if (options.store) document.cookie = "__dsat=" + btoa(res.access_token) + ";max-age=" + (60 * 60 * 24 * 7).toString();
    client.setToken(res.access_token);
  }, function(err) {
    if (callback) callback(err);  
  });
  
  return promise;
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