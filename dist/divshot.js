!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Divshot=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
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

},{}],2:[function(_dereq_,module,exports){
module.exports = function () {
  var builds = this.resource('builds');
  
  return builds;
};
},{}],3:[function(_dereq_,module,exports){
(function (process){
var Rapper = _dereq_('rapper');
var divshot = new Rapper(API_HOST);
var btoa = _dereq_('Base64').btoa;

var user = _dereq_('./user');
var apps = _dereq_('./apps');
var organizations = _dereq_('./organizations');
var releases = _dereq_('./releases');
var builds = _dereq_('./builds');
var vouchers = _dereq_('./vouchers');

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
}).call(this,_dereq_("/Users/scott/www/divshot/divshot-api/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"./apps":1,"./builds":2,"./organizations":4,"./releases":5,"./user":6,"./vouchers":7,"/Users/scott/www/divshot/divshot-api/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":9,"Base64":8,"rapper":11}],4:[function(_dereq_,module,exports){
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
},{}],5:[function(_dereq_,module,exports){
module.exports = function () {
  var releases = this.resource('releases', {
    lookup: function (hostname) {
      return this.api.get(this.url() + '/lookup?host=' + hostname);
    }
  });
  
  return releases;
};
},{}],6:[function(_dereq_,module,exports){
var btoa = _dereq_('Base64').btoa;

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

},{"Base64":8}],7:[function(_dereq_,module,exports){
module.exports = function () {
  return this.resource('vouchers', {
    redeem: function (code) {
      return this.one(code).one('redeem').put();
    }
  });
};
},{}],8:[function(_dereq_,module,exports){
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

},{}],9:[function(_dereq_,module,exports){
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

},{}],10:[function(_dereq_,module,exports){
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

}).call(this,_dereq_("/Users/scott/www/divshot/divshot-api/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"/Users/scott/www/divshot/divshot-api/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":9}],11:[function(_dereq_,module,exports){
'use strict';

var request = _dereq_('httpify');
var Promise = _dereq_('promise');
var extend = _dereq_('extend');
var Resource = _dereq_('./lib/resource');
var slasher = _dereq_('slasher');

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
},{"./lib/resource":12,"extend":13,"httpify":14,"promise":20,"slasher":30}],12:[function(_dereq_,module,exports){
'use strict';

var extend = _dereq_('extend');
var slasher = _dereq_('slasher');
var path = _dereq_('path');
var Qmap = _dereq_('qmap');

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
},{"extend":13,"path":10,"qmap":22,"slasher":30}],13:[function(_dereq_,module,exports){
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

},{}],14:[function(_dereq_,module,exports){
module.exports = _dereq_('request');
},{"request":15}],15:[function(_dereq_,module,exports){
var request = _dereq_('xhr');

// Wrapper to make the features more similiar between
// request and xhr

module.exports = function (options, callback) {
  callback = callback || function () {};
  
  // Set up for Request module
  if (options.data && !window) options.form = options.data;
  
  // Set up for xhr module
  if (options.form && window) {
    options.body = (typeof options.form === 'object')
      ? JSON.stringify(options.form)
      : options.form;
  }
  
  if (options.data) {
    options.body = (typeof options.data === 'object')
      ? JSON.stringify(options.data)
      : options.data;
  }
  
  if (options.url && window) options.uri = options.url;
  if (window) options.cors = options.withCredentials;
  
  return request(options, callback);
};
},{"xhr":16}],16:[function(_dereq_,module,exports){
var window = _dereq_("global/window")
var once = _dereq_("once")

var messages = {
    "0": "Internal XMLHttpRequest Error",
    "4": "4xx Client Error",
    "5": "5xx Server Error"
}

var XHR = window.XMLHttpRequest || noop
var XDR = "withCredentials" in (new XHR()) ?
        window.XMLHttpRequest : window.XDomainRequest

module.exports = createXHR

function createXHR(options, callback) {
    if (typeof options === "string") {
        options = { uri: options }
    }

    options = options || {}
    callback = once(callback)

    var xhr

    if (options.cors) {
        xhr = new XDR()
    } else {
        xhr = new XHR()
    }

    var uri = xhr.url = options.uri
    var method = xhr.method = options.method || "GET"
    var body = options.body || options.data
    var headers = xhr.headers = options.headers || {}
    var sync = !!options.sync
    var isJson = false

    if ("json" in options) {
        isJson = true
        headers["Content-Type"] = "application/json"
        body = JSON.stringify(options.json)
    }

    xhr.onreadystatechange = readystatechange
    xhr.onload = load
    xhr.onerror = error
    // IE9 must have onprogress be set to a unique function.
    xhr.onprogress = function () {
        // IE must die
    }
    // hate IE
    xhr.ontimeout = noop
    xhr.open(method, uri, !sync)
    if (options.cors) {
        xhr.withCredentials = true
    }
    // Cannot set timeout with sync request
    if (!sync) {
        xhr.timeout = "timeout" in options ? options.timeout : 5000
    }

    if ( xhr.setRequestHeader) {
        Object.keys(headers).forEach(function (key) {
            xhr.setRequestHeader(key, headers[key])
        })
    }

    xhr.send(body)

    return xhr

    function readystatechange() {
        if (xhr.readyState === 4) {
            load()
        }
    }

    function load() {
        var error = null
        var status = xhr.statusCode = xhr.status
        var body = xhr.body = xhr.response ||
            xhr.responseText || xhr.responseXML

        if (status === 0 || (status >= 400 && status < 600)) {
            var message = xhr.responseText ||
                messages[String(xhr.status).charAt(0)]
            error = new Error(message)

            error.statusCode = xhr.status
        }

        if (isJson) {
            try {
                body = xhr.body = JSON.parse(body)
            } catch (e) {}
        }

        callback(error, xhr, body)
    }

    function error(evt) {
        callback(evt, xhr)
    }
}


function noop() {}

},{"global/window":17,"once":18}],17:[function(_dereq_,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window
} else if (typeof global !== "undefined") {
    module.exports = global
} else {
    module.exports = {}
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],18:[function(_dereq_,module,exports){
module.exports = once

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })
})

function once (fn) {
  var called = false
  return function () {
    if (called) return
    called = true
    return fn.apply(this, arguments)
  }
}

},{}],19:[function(_dereq_,module,exports){
'use strict';

var asap = _dereq_('asap')

module.exports = Promise
function Promise(fn) {
  if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new')
  if (typeof fn !== 'function') throw new TypeError('not a function')
  var state = null
  var value = null
  var deferreds = []
  var self = this

  this.then = function(onFulfilled, onRejected) {
    return new Promise(function(resolve, reject) {
      handle(new Handler(onFulfilled, onRejected, resolve, reject))
    })
  }

  function handle(deferred) {
    if (state === null) {
      deferreds.push(deferred)
      return
    }
    asap(function() {
      var cb = state ? deferred.onFulfilled : deferred.onRejected
      if (cb === null) {
        (state ? deferred.resolve : deferred.reject)(value)
        return
      }
      var ret
      try {
        ret = cb(value)
      }
      catch (e) {
        deferred.reject(e)
        return
      }
      deferred.resolve(ret)
    })
  }

  function resolve(newValue) {
    try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.')
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then
        if (typeof then === 'function') {
          doResolve(then.bind(newValue), resolve, reject)
          return
        }
      }
      state = true
      value = newValue
      finale()
    } catch (e) { reject(e) }
  }

  function reject(newValue) {
    state = false
    value = newValue
    finale()
  }

  function finale() {
    for (var i = 0, len = deferreds.length; i < len; i++)
      handle(deferreds[i])
    deferreds = null
  }

  doResolve(fn, resolve, reject)
}


function Handler(onFulfilled, onRejected, resolve, reject){
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null
  this.onRejected = typeof onRejected === 'function' ? onRejected : null
  this.resolve = resolve
  this.reject = reject
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, onFulfilled, onRejected) {
  var done = false;
  try {
    fn(function (value) {
      if (done) return
      done = true
      onFulfilled(value)
    }, function (reason) {
      if (done) return
      done = true
      onRejected(reason)
    })
  } catch (ex) {
    if (done) return
    done = true
    onRejected(ex)
  }
}

},{"asap":21}],20:[function(_dereq_,module,exports){
'use strict';

//This file contains then/promise specific extensions to the core promise API

var Promise = _dereq_('./core.js')
var asap = _dereq_('asap')

module.exports = Promise

/* Static Functions */

function ValuePromise(value) {
  this.then = function (onFulfilled) {
    if (typeof onFulfilled !== 'function') return this
    return new Promise(function (resolve, reject) {
      asap(function () {
        try {
          resolve(onFulfilled(value))
        } catch (ex) {
          reject(ex);
        }
      })
    })
  }
}
ValuePromise.prototype = Object.create(Promise.prototype)

var TRUE = new ValuePromise(true)
var FALSE = new ValuePromise(false)
var NULL = new ValuePromise(null)
var UNDEFINED = new ValuePromise(undefined)
var ZERO = new ValuePromise(0)
var EMPTYSTRING = new ValuePromise('')

Promise.from = Promise.cast = function (value) {
  if (value instanceof Promise) return value

  if (value === null) return NULL
  if (value === undefined) return UNDEFINED
  if (value === true) return TRUE
  if (value === false) return FALSE
  if (value === 0) return ZERO
  if (value === '') return EMPTYSTRING

  if (typeof value === 'object' || typeof value === 'function') {
    try {
      var then = value.then
      if (typeof then === 'function') {
        return new Promise(then.bind(value))
      }
    } catch (ex) {
      return new Promise(function (resolve, reject) {
        reject(ex)
      })
    }
  }

  return new ValuePromise(value)
}
Promise.denodeify = function (fn, argumentCount) {
  argumentCount = argumentCount || Infinity
  return function () {
    var self = this
    var args = Array.prototype.slice.call(arguments)
    return new Promise(function (resolve, reject) {
      while (args.length && args.length > argumentCount) {
        args.pop()
      }
      args.push(function (err, res) {
        if (err) reject(err)
        else resolve(res)
      })
      fn.apply(self, args)
    })
  }
}
Promise.nodeify = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments)
    var callback = typeof args[args.length - 1] === 'function' ? args.pop() : null
    try {
      return fn.apply(this, arguments).nodeify(callback)
    } catch (ex) {
      if (callback === null || typeof callback == 'undefined') {
        return new Promise(function (resolve, reject) { reject(ex) })
      } else {
        asap(function () {
          callback(ex)
        })
      }
    }
  }
}

Promise.all = function () {
  var args = Array.prototype.slice.call(arguments.length === 1 && Array.isArray(arguments[0]) ? arguments[0] : arguments)

  return new Promise(function (resolve, reject) {
    if (args.length === 0) return resolve([])
    var remaining = args.length
    function res(i, val) {
      try {
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          var then = val.then
          if (typeof then === 'function') {
            then.call(val, function (val) { res(i, val) }, reject)
            return
          }
        }
        args[i] = val
        if (--remaining === 0) {
          resolve(args);
        }
      } catch (ex) {
        reject(ex)
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i])
    }
  })
}

/* Prototype Methods */

Promise.prototype.done = function (onFulfilled, onRejected) {
  var self = arguments.length ? this.then.apply(this, arguments) : this
  self.then(null, function (err) {
    asap(function () {
      throw err
    })
  })
}

Promise.prototype.nodeify = function (callback) {
  if (callback === null || typeof callback == 'undefined') return this

  this.then(function (value) {
    asap(function () {
      callback(null, value)
    })
  }, function (err) {
    asap(function () {
      callback(err)
    })
  })
}

Promise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected);
}


Promise.resolve = function (value) {
  return new Promise(function (resolve) { 
    resolve(value);
  });
}

Promise.reject = function (value) {
  return new Promise(function (resolve, reject) { 
    reject(value);
  });
}

Promise.race = function (values) {
  return new Promise(function (resolve, reject) { 
    values.map(function(value){
      Promise.cast(value).then(resolve, reject);
    })
  });
}

},{"./core.js":19,"asap":21}],21:[function(_dereq_,module,exports){
(function (process){

// Use the fastest possible means to execute a task in a future turn
// of the event loop.

// linked list of tasks (single, with head node)
var head = {task: void 0, next: null};
var tail = head;
var flushing = false;
var requestFlush = void 0;
var isNodeJS = false;

function flush() {
    /* jshint loopfunc: true */

    while (head.next) {
        head = head.next;
        var task = head.task;
        head.task = void 0;
        var domain = head.domain;

        if (domain) {
            head.domain = void 0;
            domain.enter();
        }

        try {
            task();

        } catch (e) {
            if (isNodeJS) {
                // In node, uncaught exceptions are considered fatal errors.
                // Re-throw them synchronously to interrupt flushing!

                // Ensure continuation if the uncaught exception is suppressed
                // listening "uncaughtException" events (as domains does).
                // Continue in next event to avoid tick recursion.
                if (domain) {
                    domain.exit();
                }
                setTimeout(flush, 0);
                if (domain) {
                    domain.enter();
                }

                throw e;

            } else {
                // In browsers, uncaught exceptions are not fatal.
                // Re-throw them asynchronously to avoid slow-downs.
                setTimeout(function() {
                   throw e;
                }, 0);
            }
        }

        if (domain) {
            domain.exit();
        }
    }

    flushing = false;
}

if (typeof process !== "undefined" && process.nextTick) {
    // Node.js before 0.9. Note that some fake-Node environments, like the
    // Mocha test runner, introduce a `process` global without a `nextTick`.
    isNodeJS = true;

    requestFlush = function () {
        process.nextTick(flush);
    };

} else if (typeof setImmediate === "function") {
    // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
    if (typeof window !== "undefined") {
        requestFlush = setImmediate.bind(window, flush);
    } else {
        requestFlush = function () {
            setImmediate(flush);
        };
    }

} else if (typeof MessageChannel !== "undefined") {
    // modern browsers
    // http://www.nonblocking.io/2011/06/windownexttick.html
    var channel = new MessageChannel();
    channel.port1.onmessage = flush;
    requestFlush = function () {
        channel.port2.postMessage(0);
    };

} else {
    // old browsers
    requestFlush = function () {
        setTimeout(flush, 0);
    };
}

function asap(task) {
    tail = tail.next = {
        task: task,
        domain: isNodeJS && process.domain,
        next: null
    };

    if (!flushing) {
        flushing = true;
        requestFlush();
    }
};

module.exports = asap;


}).call(this,_dereq_("/Users/scott/www/divshot/divshot-api/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"/Users/scott/www/divshot/divshot-api/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":9}],22:[function(_dereq_,module,exports){
var flatten = _dereq_('flat-arguments');
var asArray = _dereq_('as-array');
var drainer = _dereq_('drainer');
var isArguments = _dereq_('lodash.isarguments');

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
},{"as-array":23,"drainer":24,"flat-arguments":25,"lodash.isarguments":29}],23:[function(_dereq_,module,exports){
var isArgs = _dereq_('lodash.isarguments');

module.exports = function (data) {
  if (!data) data = [];
  if (isArgs(data)) data = [].splice.call(data, 0);
  
  return Array.isArray(data)
    ? data
    : [data];
};
},{"lodash.isarguments":29}],24:[function(_dereq_,module,exports){
var asArray = _dereq_('as-array');

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
},{"as-array":23}],25:[function(_dereq_,module,exports){
var asArray = _dereq_('as-array');
var flatten = _dereq_('flatten');
var isArguments = _dereq_('lodash.isarguments');
var isObject = _dereq_('lodash.isobject');

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
},{"as-array":23,"flatten":26,"lodash.isarguments":29,"lodash.isobject":27}],26:[function(_dereq_,module,exports){
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

},{}],27:[function(_dereq_,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var objectTypes = _dereq_('lodash._objecttypes');

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

},{"lodash._objecttypes":28}],28:[function(_dereq_,module,exports){
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

},{}],29:[function(_dereq_,module,exports){
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

},{}],30:[function(_dereq_,module,exports){
var path = _dereq_('path');
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

},{"path":10}]},{},[3])
(3)
});