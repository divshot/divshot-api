var expect = require('chai').expect;
var Apps = require('../lib/apps');

describe('Apps endpoint', function () {
  var apps;
  
  beforeEach(function () {
    apps = new Apps();
  });
  
  it('instantiates with a path', function () {
    expect(apps.path).to.equal('/apps');
  });
});