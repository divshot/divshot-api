var expect = require('chai').expect;
var stubRequire = require('proxyquire');
var Endpoint = stubRequire('../lib/Endpoint', {
  request: function () {}
});

