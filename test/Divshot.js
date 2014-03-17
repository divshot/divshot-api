var Divshot = require('../lib/divshot');
var tape = require('tape');
var async = require('async');
var extend = require('extend');




var suite = function (name, setupRunner, options) {
  var endNoop = function (t) {t.end();};
  var afterEach = [];
  var beforeEach = [];
  var tests = tests || [];
  
  // Transfer options to nested suites
  if (options) {
    beforeEach = options.beforeEach || [endNoop];
    afterEach = options.afterEach || [endNoop];
  }
  
  tape(name, function (t) {
    var originalTest = t.test.bind(t);
    
    t.beforeEach = function (fn) {
      beforeEach.push(fn);
    };
    
    t.afterEach = function (fn) {
      afterEach.push(fn);
    };
    
    t.test = function (name, fn) {
      tests.push({
        name: name,
        fn: fn
      });
    };
    
    t.suite = function (name, setupRunner) {
      suite(name, setupRunner, extend(options, {
        beforeEach: beforeEach,
        afterEach: afterEach
      }));
    };
    
    // Run it all
    setupRunner(t);    
    process.nextTick(runTests);
    
    function runTests () {
      async.eachSeries(tests, function (testItem, done) {
        
        runBeforeEach(runTest);
        
        function runTest () {
          originalTest(testItem.name, function (runner) {
            var originalEnd = runner.end.bind(runner);
            
            runner.end = function () {
              runAfterEach(function () {
                done();
                originalEnd();
              });
            };
            
            testItem.fn(runner);
          });
        }
      }, t.end.bind(t));
      
      function runBeforeEach (done) {
        async.eachSeries(beforeEach, function (before, done) {
          before({end: done})
        }, done);
      }
      
      function runAfterEach (done) {
        async.eachSeries(afterEach, function (after, done) {
          after({end: done})
        }, done);
      }
    }
  });
  
};




suite('something', function (t) {
  
  t.beforeEach(function (t) {
    console.log('===================before each=======================');
    t.end();
  });
  
  t.test('does something', function (t) {
    t.ok(true, 'test 1');
    t.end();
  });
  
  t.test('does somethiasdfasng', function (t) {
    t.ok(true, 'test 2');
    t.end();
  });
  
  t.suite('another thing', function (t) {
    
    t.beforeEach(function (t) {
      console.log('===================NESTED: before each=======================');
      t.end();
    });
    
    t.afterEach(function (t) {
      console.log('===================NESTED: after each=======================');
      t.end();
    });
    
    t.test('testing this', function (t) {
      t.ok(true);
      t.end();
    });
    
    t.suite('double nested', function (t) {
      
      t.beforeEach(function (t) {
        console.log('===================DOUBLE NESTED: before each=======================');
        t.end();
      });
      
      t.afterEach(function (t) {
        console.log('===================DOUBLE NESTED: after each=======================');
        t.end();
      });
      
      t.test('nested testing', function (t) {
        t.ok(true);
        t.end();
      });
    });
    
    t.test('nested testing this ya', function (t) {
      t.ok(true);
      t.end();
    });
  });
  
});







// test('divshot api wrapper set up', function (t) {
//   var divshot;
  
//   t.beforeEach = function (fn) {
//     fn(function () {
//       divshot.token('token');
//       t.equal(divshot.token(), 'token', 'set the token');
//       t.end();
//     });
//   }
  
//   t.beforeEach(function (done) {
//     divshot = new Divshot();
//     console.log('beforeEach')
//     done();
//   });
// });
















// var lab = require('lab');
// var describe = lab.describe;
// var it = lab.it;
// var expect = lab.expect;
// var beforeEach = lab.beforeEach;
// var afterEach = lab.afterEach;

// describe('divshot api wrapper set up', function () {
//   var divshot;
  
//   beforeEach(function (done) {
//     divshot = new Divshot();
//     done();
//   });
  
//   it('sets the token', function (done) {
//     divshot.token('token');
//     expect(divshot.token()).to.equal('token');
//     done();
//   });
  
//   it('sets the token header when the token is set', function (done) {
//     divshot.token('token');
//     expect(divshot.header('Authorization')).to.equal('Bearer token');
//     done();
//   });
  
//   it('overrides the host', function (done) {
//     divshot.host('host');
//     expect(divshot.host()).to.equal('host');
//     done();
//   });
  
//   it('sets the client id on the session header', function (done) {
//     divshot.session('client_id');
//     expect(divshot.header('Authorization')).to.equal('Session client_id');
//     expect(divshot.clientId()).to.equal('client_id');
//     done();
//   });
  
//   it('forces CORS with credentials if session is set', function (done) {
//     divshot.session('client_id');
//     expect(divshot.xhr('withCredentials')).to.equal(true);
//     done();
//   });
  
//   it('has a default api version of 0.5.0', function (done) {
//     expect(divshot.apiVersion()).to.equal('0.5.0');
//     done();
//   });
  
//   it('sets a custom api version', function (done) {
//     divshot.apiVersion('0.6.0');
//     expect(divshot.apiVersion()).to.equal('0.6.0');
//     done();
//   });
  
//   it('sets the default api version from the environment', function (done) {
//     process.env.DIVSHOT_API_URL = '0.6.0';
//     var divshot = new Divshot();
//     expect(divshot.apiVersion()).to.equal('0.6.0');
//     done();
//   });
  
//   it('sets the version header for all http requests', function (done) {
//     expect(divshot.header('Accepts-Version')).to.equal(divshot.apiVersion());
//     done();
//   });
  
// });

// function requireNoCache (pathname) {
//   delete require.cache[pathname];
//   return require(pathname);
// }