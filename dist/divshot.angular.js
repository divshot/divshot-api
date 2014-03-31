(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function () {
  var apps = this.resource('apps');

  // Single app
  apps.id = function (id) {
    var app =  this.one(id);

    // Domains
    app.domains = app.resource('domains', {
      add: function (domain) {
        return this.one(domain).update();
      },

      remove: function (domain) {
        return this.one(domain).del();
      }
    });

    app.env = function (environment) {
      return app.resource('env').one(environment, {
        configure: function (config) {
          return this.one('config').update(config);
        }
      });
    };

    // Builds
    app.builds = app.resource('builds', {
      id: function (id) {
        return this.one(id, {
          release: function (environment) {
            return app.resource('releases').resource(environment).create({build: id});
          }
        });
      },

      finalize: function (buildId) {
        return this.one(buildId).one('finalize').update();
      }
    });

    // Releases
    app.releases = app.resource('releases', {
      env: function (environment) {
        return this.resource(environment, {
          rollback: function (version) {
            if (version) return this.resource('rollback').post({version: version});
            return this.resource('rollback').post();
          },

          promote: function (to) {
            return this.post({environment: to});
          }
        });
      }
    });

    return app;
  };

  // Some weird organization thing that I don't remember coding,
  // but it works
  apps.organization = function (id) {
    return this.api.get('/organizations/' + id + '/apps');
  };

  return apps;
};

},{}],2:[function(require,module,exports){
'use strict';

//
// Prepares Rapper for use in AngularJS
//
angular.module('divshot', [])
  .provider('divshot', function () {
    var Divshot = require('../divshot');
    var auth = require('./auth.js');
    
    var angularRequest = require('rapper/lib/browser/angular.request');
    var angularPromise = require('rapper/lib/browser/angular.promise');
    
    // Browser setup
    Divshot.prototype.auth = auth.auth;
    Divshot.prototype.authWithCookie = auth.authWithCookie;
    
    var api = new Divshot();
    
    return {
      _host: {},
      
      api: api,
      
      configure: function (host) {
        this._host = host;
      },
      
      $get: function ($q, $http) {
        api._request = angularRequest($http, $q);
        api.promise = angularPromise($q);
        
        return api;
      }
    };
  });
  

// angular.module('divshot', [])
//   .provider('divshot', function () {
//     var Divshot = require('../Divshot');
//     var auth = require('./auth.js');

//     Divshot.prototype.auth = auth.auth;
//     Divshot.prototype.authWithCookie = auth.authWithCookie;
    
//     return {
//       _options: {},
      
//       configure: function (options) {
//         this._options = options;
//       },
      
//       $get: function ($rootScope, $q, $http) {
//         $rootScope.narratorApply = function(fn) {
//           var phase = this.$root.$$phase;
//           if(phase === '$apply' || phase === '$digest') {
//             if(fn && (typeof(fn) === 'function')) {
//               fn();
//             }
//           } else {
//             this.$apply(fn);
//           }
//         };
        
//         // asQ(Http, $rootScope, $q);
//         // asHttp(Http, $http);
//         return Divshot.createClient(this._options);
//       }
//     };
//   });
},{"../divshot":5,"./auth.js":3,"rapper/lib/browser/angular.promise":18,"rapper/lib/browser/angular.request":19}],3:[function(require,module,exports){
var querystring = require('querystring');

var passwordAuth = function (options) {
  var client = this;
  
  return client.promise(function(resolve, reject) {
    
    // Fetch a token using resource owner password credential method
    
    client.post(client.host() + '/token', 'POST', {
      form: {
        username: client.username(),
        password: client.password(),
        grant_type: 'password'
      },
      headers: {
        Authorization: 'Basic ' + btoa(client.clientId() + ":")
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
};

var popupAuth = function(options, callback) {
  callback = callback || function () {};
  var client = this;
  
  return client.promise(function(resolve, reject) {
    var authOrigin = client.auth_origin || 'https://auth.divshot.com';
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
    };
    
    window.addEventListener('message', tokenListener);
    
    var authorizeUrl = authOrigin + "/authorize?response_type=post_message&client_id=" + client.clientId();
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
};


var auth = function() {
  var callback, options, provider, promise;
  var client = this;
  
  for (var i = 0; i < arguments.length; i++) {
    if (typeof arguments[i] === 'object'){ options = arguments[i]; }
    else if (typeof arguments[i] === 'string'){ provider = arguments[i]; }
    else if (typeof arguments[i] === 'function'){ callback = arguments[i]; }
  }
  
  options = options || {};
  
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
};

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
};

module.exports = {
  auth: auth,
  authWithCookie: cookie
};
},{"querystring":16}],4:[function(require,module,exports){
module.exports = function () {
  var builds = this.resource('builds');
  
  return builds;
};
},{}],5:[function(require,module,exports){
(function (process){
var Rapper = require('rapper');
var divshot = new Rapper(API_HOST);
var btoa = require('Base64').btoa;

var user = require('./user');
var apps = require('./apps');
var organizations = require('./organizations');
var releases = require('./releases');
var builds = require('./builds');
var vouchers = require('./vouchers');

var API_HOST = 'https://api.divshot.com';
var DIVSHOT_API_VERSION = '0.5.0';

var Divshot = function () {
  // Instantiate parent
  Rapper.call(this, API_HOST);
  
  this.apiVersion(process.env.DIVSHOT_API_URL || DIVSHOT_API_VERSION);
  
  this.user = user.call(this);
  this.apps = apps.call(this);
  this.organizations = organizations.call(this);
  this.releases = releases.call(this);
  this.builds = builds.call(this);
  this.vouchers = vouchers.call(this);
};

// Inherit methods
Divshot.prototype = Object.create(Rapper.prototype);

Divshot.prototype.token = function (token) {
  if (!token) return this._token;
  
  this._token = token;
  this.header('Authorization', 'Bearer ' + token);
  return this;
};

Divshot.prototype.apiVersion = function (version) {
  if (!version) return this._apiVersion;
  
  this.header('Accepts-Version', version);
  this._apiVersion = version;
  return this;
};

Divshot.prototype.basicAuthHeader = function (value) {
  this.header('Authorization', 'Basic ' + btoa(value.toString()));
};

Divshot.prototype.session = function (clientId) {
  this._clientId = clientId;
  this.header('Authorization', 'Session ' + clientId);
  this.xhr('withCredentials', true);
  return this;
};

Divshot.prototype.clientId = function (id) {
  if (!id) return this._clientId;
  
  this._clientId = id.toString();
  return this;
};

Divshot.prototype.username = function (username) {
  if (!username) return this._username;
  
  this._username = username;
  return this;
};

Divshot.prototype.password = function (password) {
  if (!password) return this._password;
  
  this._password = password;
  return this;
};

Divshot.prototype.credentials = function (username, password) {
  if (!username && !password) return {username: this.username(), password: this.password()};
  
  this.username(username);
  this.password(password);
  return this;
};

module.exports = Divshot;
}).call(this,require("/Users/scott/www/divshot/divshot-api/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"./apps":1,"./builds":4,"./organizations":6,"./releases":7,"./user":8,"./vouchers":9,"/Users/scott/www/divshot/divshot-api/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":12,"Base64":10,"rapper":17}],6:[function(require,module,exports){
module.exports = function () {
  return this.resource('organizations', {
    id: function (id) {
      var org = this.one(id);
        
      org.apps = org.resource('apps');
      org.members = org.resource('members', {
        id: function (id) {
          return this.one(id);
        }
      });
      
      return org;
    }
  });
};
},{}],7:[function(require,module,exports){
module.exports = function () {
  var releases = this.resource('releases', {
    lookup: function (hostname) {
      return this.api.get(this.url() + '/lookup?host=' + hostname);
    }
  });
  
  return releases;
};
},{}],8:[function(require,module,exports){
var btoa = require('Base64').btoa;

module.exports = function () {
  var users = this.resource('users', {
    id: function (id) {
      var user =  this.one(id);
      
      user.password = {
        reset: function () {
          return user.api.post('/actions/reset_password/' + id);
        }
      };
      
      user.emails = user.api.resource('self').resource('emails', {
        add: function (email, isPrimary) {
          var data = {address: email};
          
          if (isPrimary) data.primary = true;
          
          return this.post(data);
        },
        
        remove: function (email) {
          return this.one(email).remove();
        },
        
        resend: function (email) {
          return this.one(email).resource('resend').create();
        }
      });
      
      return user;
    },
    
    tokenAuth: function () {
      if (this.api.token()) return this.api.asPromise(this.api.token());
      if (this.api.clientId()) return this.api.asPromise(undefined);
      
      var self = this;
      var tokenRequest = this.api.post('/token', {
        form: {
          username: this.api.username(),
          passowrd: this.api.password(),
          grant_type: 'password'
        },
        headers: {
          Authorization: 'Basic ' + btoa(this.api._clientId + ':')
        }
      });
      
      return this.api.promise(function (resolve, reject) {
        return tokenRequest.then(function (res) {
          resolve(res.access_token);
        }, reject);
      });
    },
    
    self: function () {
      return this.api.get('/self');
    },
    
    welcomed: function () {
      return this.api.put('/self/welcomed');
    },
    
    generateTicket: function () {
      this.api.basicAuthHeader(this.api.clientId());
      return this.api.post('/token/tickets');
    },
    
    checkTicketStatus: function (ticket) {
      this.api.basicAuthHeader(this.api.clientId());
      return this.api.post('/token', {
        form: {
          grant_type: 'ticket',
          ticket: ticket
        }
      });
    }
  });

  // users.emails;
  // users.password;
  
  return users;
};

},{"Base64":10}],9:[function(require,module,exports){
module.exports = function () {
  return this.resource('vouchers', {
    redeem: function (code) {
      return this.one(code).one('redeem').put();
    }
  });
};
},{}],10:[function(require,module,exports){
;(function () {

  var object = typeof exports != 'undefined' ? exports : this; // #8: web workers
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  function InvalidCharacterError(message) {
    this.message = message;
  }
  InvalidCharacterError.prototype = new Error;
  InvalidCharacterError.prototype.name = 'InvalidCharacterError';

  // encoder
  // [https://gist.github.com/999166] by [https://github.com/nignag]
  object.btoa || (
  object.btoa = function (input) {
    for (
      // initialize result and counter
      var block, charCode, idx = 0, map = chars, output = '';
      // if the next input index does not exist:
      //   change the mapping table to "="
      //   check if d has no fractional digits
      input.charAt(idx | 0) || (map = '=', idx % 1);
      // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
      output += map.charAt(63 & block >> 8 - idx % 1 * 8)
    ) {
      charCode = input.charCodeAt(idx += 3/4);
      if (charCode > 0xFF) {
        throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
      }
      block = block << 8 | charCode;
    }
    return output;
  });

  // decoder
  // [https://gist.github.com/1020396] by [https://github.com/atk]
  object.atob || (
  object.atob = function (input) {
    input = input.replace(/=+$/, '')
    if (input.length % 4 == 1) {
      throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    for (
      // initialize result and counters
      var bc = 0, bs, buffer, idx = 0, output = '';
      // get next character
      buffer = input.charAt(idx++);
      // character found in table? initialize bit storage and add its ascii value;
      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        // and if not first of each 4 characters,
        // convert the first 8 bits to one ascii character
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      // try to find character in table (0-63, not found => -1)
      buffer = chars.indexOf(buffer);
    }
    return output;
  });

}());

},{}],11:[function(require,module,exports){

},{}],12:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.once = noop;
process.off = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],13:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require("/Users/scott/www/divshot/divshot-api/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"/Users/scott/www/divshot/divshot-api/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":12}],14:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],15:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return obj[k].map(function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],16:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":14,"./encode":15}],17:[function(require,module,exports){
'use strict';

var request = require('httpify');
var Promise = require('promise');
var extend = require('extend');
var Resource = require('./lib/resource');
var slasher = require('slasher');

var Rapper = function (host) {
  this.attributes = {};
  this.headers = {};
  this.xhrs = {};
  this.resources = {};
  
  if (host) this.attributes.host = host;
};

Rapper.prototype._addResource = function (resource) {
  this.resources[resource.url()] = resource;
};

Rapper.prototype.host = function (host) {
  if (!host) return this.attributes.host;
  
  this.attributes.host = host;
  return this;
};

Rapper.prototype._buildUrl = function (url, withHost) {
  if (withHost) return this.attributes.host + slasher(url);
  return slasher(url);
};

Rapper.prototype.header = function (key, value) {
  if (!value) return this.headers[key];
  
  this.headers[key] = value;
  return this;
};

Rapper.prototype.xhr = function (key, value) {
  if (!value) return this.xhrs[key];
  
  this.xhrs[key] = value;
  return this;
};

Rapper.prototype._http = function (url, method, options) {
  var self = this;
  var resource = this.resources[url];
  var requestOptions = {
    url: this._buildUrl(url, true),
    method: method,
    type: 'json'
  };
  
  extend(requestOptions, {
    headers: this.headers
  }, this.xhrs, options);
  
  if (!resource) return this._request(requestOptions);
  
  return this.promise(function (resolve, reject) {
    resource.beforeQueue.drain(function (err) {
      if (err) return reject(err);
      self._request(requestOptions).then(resolve, reject);
    });
  });
};

Rapper.prototype._request = function (requestOptions) {
  return this.promise(function (resolve, reject) {
    request(requestOptions, function (err, response, body) {
      if (err || response.statusCode >= 300 || response.status >= 300) return reject(err || response);
      resolve(JSON.parse(body));
    });
  });
};

// Add helper methods
Rapper.httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
Rapper.httpMethods.forEach(function (method) {
  Rapper.prototype[method.toLowerCase()] = function (url, options, resource) {
    return this._http(url, method, options, resource);
  };
});

Rapper.prototype.resource = function (name, extensions) {
  return Resource._create(name, extensions, {
    api: this,
  });
};

Rapper.prototype.promise = function (resolver) {
  return new Promise(resolver);
};

Rapper.prototype.asPromise = function (value) {
  return this.promise(function (resolve) {
    resolve(value);
  });
};

module.exports = Rapper;
},{"./lib/resource":20,"extend":21,"httpify":11,"promise":11,"slasher":30}],18:[function(require,module,exports){
module.exports = function ($q) {
  return function (callback) {
    var d = $q.defer();
    
    callback(function (data) {
        d.resolve(data);
    }, function (err) {
        d.reject(err);
    });
    
    return d.promise;
  };
};
},{}],19:[function(require,module,exports){
module.exports = function ($http, $q) {
  return function (requestOptions) {
    var d = $q.defer();
    
    if (requestOptions.form) requestOptions.data = requestOptions.form;
    if (requestOptions.type) requestOptions.responseType = requestOptions.type;
    
    $http(requestOptions).success(function (res) {
      d.resolve(res);
    }).error(function (err) {
      d.reject(err);
    });
    
    return d.promise;
};
};
},{}],20:[function(require,module,exports){
'use strict';

var extend = require('extend');
var slasher = require('slasher');
var path = require('path');
var Qmap = require('qmap');

var Resource = function (options, extensions) {
  this.xhrs = {};
  this.beforeQueue = new Qmap(this);
  extend(this, options, extensions);
};

Resource.prototype.url = function (withHost) {
  return this.api._buildUrl(this.name, withHost);
};

Resource.prototype.one = function (name, extensions) {
  return Resource._create(name, extensions, {
      type: 'one',
      api: this.api,
      baseUrl: this.url()
    });
};

Resource.prototype.resource = function (name, extensions) {
  return Resource._create(name, extensions, {
    type: 'many',
    api: this.api,
    baseUrl: this.url()
  });
};

Resource.prototype.xhr = function (key, value) {
  if (!value) return this.xhrs[key];
  
  this.xhrs[key] = value;
  return this;
};

Resource.prototype.before = function () {
  this.beforeQueue.push(arguments);
};


// Mixins
Resource.many = {
  get: function () {
    return this.api.get(this.url(), this.xhrs);
  },
  post: function (body) {
    return this.api.post(this.url(), extend(this.xhrs, {
      form: body
    }));
  },
  
  // Aliases
  list: function () {
    return this.get();
  },
  create: function (body) {
    return this.post(body);
  }
};

Resource.one = {
  get: Resource.many.get,
  put: function (body) {
    return this.api.put(this.url(), extend(this.xhrs, {
      form: body
    }));
  },
  del: function () {
    return this.api.delete(this.url(), this.xhrs);
  },
  
  // Aliases
  update: function (body) {
    return this.put(body);
  },
  remove: function () {
    return this.del();
  },
};

Resource._create = function (name, extensions, options) {
  var ext = {};
  var parsedName = path.join(options.baseUrl || '/', slasher(name));
  var api = options.api;
  
  extend(ext, Resource[options.type || 'many'], extensions);
  
  if (api.resources[parsedName]) return api.resources[parsedName];
  
  var resource = new Resource({
    name: parsedName,
    api: api
  }, ext);
  
  api.resources[resource.url()] = resource;
  
  return resource;
};

module.exports = Resource;
},{"extend":21,"path":13,"qmap":22,"slasher":30}],21:[function(require,module,exports){
var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

function isPlainObject(obj) {
	if (!obj || toString.call(obj) !== '[object Object]' || obj.nodeType || obj.setInterval)
		return false;

	var has_own_constructor = hasOwn.call(obj, 'constructor');
	var has_is_property_of_method = hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !has_own_constructor && !has_is_property_of_method)
		return false;

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for ( key in obj ) {}

	return key === undefined || hasOwn.call( obj, key );
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone,
	    target = arguments[0] || {},
	    i = 1,
	    length = arguments.length,
	    deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && typeof target !== "function") {
		target = {};
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( isPlainObject(copy) || (copyIsArray = Array.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && Array.isArray(src) ? src : [];

					} else {
						clone = src && isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

},{}],22:[function(require,module,exports){
var flatten = require('flat-arguments');
var asArray = require('as-array');
var drainer = require('drainer');
var isArguments = require('lodash.isarguments');

var Qmap = function (context) {
  
  // this._isQueue = true; // TODO: use this so that we can make a queue of queues
  
  this._items = [];
  this._methods = {};
  this._context = context;
};

Qmap.prototype.method = function (name, fn) {
  this._methods[name] = fn;
};

Qmap.prototype.push = function () {
  flatten(arguments)
    .map(unstringify, this)
    .map(contextify, this)
    .forEach(addToItems, this);
  
  function addToItems (arg) {
    this._items.push(arg);
  }
  
  function unstringify (arg) {
    return (typeof arg === 'string')
      ? this._methods[arg]
      : arg;
  }
  
  function contextify (arg) {
    return (this._context)
      ? arg.bind(this._context)
      : arg;
  }
};

Qmap.prototype.drain = function () {
  var drain = drainer(this._items);
  var args = [].slice.call(arguments, 0);
  var callback = args.pop();
  
  // Block having args passed in with callback.
  // If args are passed in, drainer automatically passes them
  // to the next item in the queue. That's bad!
  args.push(function (err) {
    (callback)
      ? callback(err)
      : function () {};
  });
  
  drain.apply(drain, args);
};

module.exports = Qmap;
},{"as-array":23,"drainer":24,"flat-arguments":25,"lodash.isarguments":29}],23:[function(require,module,exports){
var isArgs = require('lodash.isarguments');

module.exports = function (data) {
  if (!data) data = [];
  if (isArgs(data)) data = [].splice.call(data, 0);
  
  return Array.isArray(data)
    ? data
    : [data];
};
},{"lodash.isarguments":29}],24:[function(require,module,exports){
var asArray = require('as-array');

var drainer = function(queue) {
  return function () {
    var defaultArgs = asArray(arguments);
    var callback = defaultArgs.pop();
    
    drain(queue, [], callback, defaultArgs);
  };
};

var drain = function (queue, args, callback, defaultArgs) {
  var fn = queue.shift();
  args = args ? defaultArgs.concat(args) : defaultArgs;
  
  if (!fn) return callback.apply(callback, [null].concat(args));
  
  // Add the queue method callback to the args list
  args.push(function () {
    var passedArgs = [].slice.call(arguments);
    var err = passedArgs.shift();
    
    if (err) return callback(err);
    
    drain(queue, passedArgs, callback, defaultArgs);
  });
  
  // Call the queue method
  fn.apply(fn, args);
};

module.exports = drainer;
},{"as-array":23}],25:[function(require,module,exports){
var asArray = require('as-array');
var flatten = require('flatten');
var isArguments = require('lodash.isarguments');
var isObject = require('lodash.isobject');

var flattenArguments = function () {
  return flatten(argumentsToArray(arguments));
};

function argumentsToArray (args) {
  return asArray(args)
    .map(function (arg) {
      if (!isArguments(arg)) return arg;
      if (isObject(arg)) arg = argumentsToArray(arg);
      
      return asArray(arg);
    });
}

module.exports = flattenArguments;
},{"as-array":23,"flatten":26,"lodash.isarguments":29,"lodash.isobject":27}],26:[function(require,module,exports){
module.exports = function flatten(list, depth) {
  depth = (typeof depth == 'number') ? depth : Infinity;

  return _flatten(list, 1);

  function _flatten(list, d) {
    return list.reduce(function (acc, item) {
      if (Array.isArray(item) && d < depth) {
        return acc.concat(_flatten(item, d + 1));
      }
      else {
        return acc.concat(item);
      }
    }, []);
  }
};

},{}],27:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var objectTypes = require('lodash._objecttypes');

/**
 * Checks if `value` is the language type of Object.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // check if the value is the ECMAScript language type of Object
  // http://es5.github.io/#x8
  // and avoid a V8 bug
  // http://code.google.com/p/v8/issues/detail?id=2291
  return !!(value && objectTypes[typeof value]);
}

module.exports = isObject;

},{"lodash._objecttypes":28}],28:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used to determine if values are of the language type Object */
var objectTypes = {
  'boolean': false,
  'function': true,
  'object': true,
  'number': false,
  'string': false,
  'undefined': false
};

module.exports = objectTypes;

},{}],29:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** `Object#toString` result shortcuts */
var argsClass = '[object Arguments]';

/** Used for native method references */
var objectProto = Object.prototype;

/** Used to resolve the internal [[Class]] of values */
var toString = objectProto.toString;

/**
 * Checks if `value` is an `arguments` object.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.
 * @example
 *
 * (function() { return _.isArguments(arguments); })(1, 2, 3);
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  return value && typeof value == 'object' && typeof value.length == 'number' &&
    toString.call(value) == argsClass || false;
}

module.exports = isArguments;

},{}],30:[function(require,module,exports){
var path = require('path');
var join = path.join;
var normalize = path.normalize;

var slasher = module.exports = function (data) {
  options = arguments[1] || {};
  
  if (typeof data === 'string') return slash(data);
  if (typeof data === 'number') return slash(data+'');
  if (typeof data === 'object') return objectSlash(data, options);
  
  return data;
};

function slash (pathname) {
  return normalize(join('/', pathname));
}

function objectSlash (original, options) {
  var slashed = {};
  var keys = Object.keys(original);
  var len = keys.length;
  var i = 0;
  
  for(i; i < len; i += 1) {
    var originalKey = keys[i];
    
    var key = (options.key === false) ? originalKey : slash(originalKey);
    var value = original[originalKey];
    
    slashed[key] = (options.value === false) ? value : slash(value);
  }
  
  return slashed;
}

module.exports = slasher;

},{"path":13}]},{},[2])