var http = require('http');
var expect = require('chai').expect;
var sinon = require('sinon');
// var stupRequire = require('proxyquire');
var Api = require('../lib/Api');
var PORT = '9387';
var STUB_HOST = 'http://localhost:' + PORT;

Api.HOST = STUB_HOST;

describe('Api base', function() {
  var server;
  
  beforeEach(function (done) {
    createServer(function (_server) {
      server = _server;
      done();
    });
  });
  
  afterEach(function (done) {
    stopServer(server, done);
  });
  
  it('sets the api host', function () {
    expect(Api.HOST).to.be.ok;
  });
  
  describe('endpoint()', function() {
    var Endpoint;
    var intializer = function (asdf) {};
    
    beforeEach(function () {
      Endpoint = Api.endpoint('endpoint', {
        initialize: intializer,
        someMethod: function () {}
      });
    });
    
    afterEach(function () {
      Endpoint = null;
    });
    
    it('extends for a new endpoint', function () {
      expect(Endpoint.prototype.HOST).to.be.ok;
    });
    
    it('automagially sets the path', function () {
      expect(Endpoint.prototype.path).to.equal('/endpoint');
    });
    
    it('sets the prototype from the object definition', function () {
      expect(Endpoint.prototype.someMethod).to.be.a('function');
    });
    
    it('uses the intialize method as the constructor', function () {
      expect(Endpoint.toString()).to.equal(intializer.toString());
    });
  });
  
  describe('_request()', function () {
    var reqBody, reqResponse, reqErr;
    
    beforeEach(function (done) {
      Api._request('/path', 'GET', {}, function (err, response, body) {
        reqErr = err;
        reqResponse = response;
        reqBody = body;
        done();
      });
    });
    
    it('makes a request to the given path with the given method', function (done) {
      expect(reqErr).to.not.be.defined;
      expect(reqBody.url).to.equal('/path');
      expect(reqBody.method).to.equal('GET');
      done();
    });
    
    it('calls back with an error if it makes a request to a stopped server', function (done) {
      server.close(function () {
        Api._authenticatedRequest('/path', 'GET', {}, function (err) {
          expect(err).to.be.ok;
          done();
        });
      });
    });
  });
  
  describe('_authenticatedRequest()', function () {
    var reqBody, reqResponse, reqErr;
    
    beforeEach(function (done) {
      Api.user = {
        authenticate: function (callback) {
          callback(null, 'token');
        }
      };
      
      Api._authenticatedRequest('/path', 'GET', {}, function (err, response, body) {
        reqErr = err;
        reqResponse = response;
        reqBody = body;
        done();
      });
    });
    
    it('fails if the user is undefined', function (done) {
      Api.user = null;
      
      Api._authenticatedRequest('/path', 'GET', {}, function (err, response, body) {
        expect(err).to.be.ok;
        done();
      });
    });
    
    it('authenticates the request with a header authorization', function () {
      expect(reqBody.headers.authorization).to.equal('Bearer token');
    });
  });
  
  describe('RESTful methods', function() {
    
    beforeEach(function () {
      Api.path = '/test';
      
      Api.user = {
        authenticate: function (callback) {
          callback(null, 'token');
        }
      };
    });
    
    it('performs a GET request', function (done) {
      Api._get({}, function (err, response, body) {
        expect(body.method).to.equal('GET');
        done();
      });
    });
    
    it('performs a GET request by id', function (done) {
      Api._getById('id', {}, function (err, response, body) {
        expect(body.method).to.equal('GET');
        expect(body.url).to.equal('/test/id');
        done();
      });
    });
    
    it('performs a POST request', function (done) {
      Api._post({}, function (err, response, body) {
        expect(body.method).to.equal('POST');
        done();
      });
    });
    
    it('performs a PUT request by id', function (done) {
      Api._put('id', {}, function (err, response, body) {
        expect(body.method).to.equal('PUT');
        expect(body.url).to.equal('/test/id');
        done();
      });
    });
    
    it('performs a DELETE request by id', function (done) {
      Api._del('id', {}, function (err, response, body) {
        expect(body.method).to.equal('DELETE');
        expect(body.url).to.equal('/test/id');
        done();
      });
    });
  });

  describe('Deafault api calls', function() {
    
    beforeEach(function () {
      Api.path = '/test';
      
      Api.user = {
        authenticate: function (callback) {
          callback(null, 'token');
        }
      };
    });
    
    it('gets a list of all items', function (done) {
      Api.getAll(function (err, items) {
        expect(items.method).to.equal('GET');
        expect(items.url).to.equal('/test');
        done();
      });
    });
    
    it('gets an item by the id', function (done) {
      Api.getById('id', function (err, items) {
        expect(items.method).to.equal('GET');
        expect(items.url).to.equal('/test/id');
        done();
      });
    });
    
    it('creates and item with a payload', function (done) {
      Api.create({
        email: 'asdf@asdf.com'
      }, function (err, response) {
        expect(response.method).to.equal('POST');
        expect(response.body).to.eql({
          email: 'asdf@asdf.com'
        });
        
        done();
      });
    });
    
  });
  
});

var formidable = require('formidable');

function createServer(callback) {
  var server = http.createServer(function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
     res.writeHead(200, {'Content-Type': 'application/json'});
       res.end(JSON.stringify({
         headers: req.headers,
         url: req.url,
         method: req.method,
         body: fields,
         files: files
       }));
    });
  });
  
  server.listen(PORT, function () {
    callback(server);
  });
}

function stopServer(server, callback) {
  try{
    server.close(function () {
      callback();
    });
  }
  catch(e) {
    callback();
  }
}