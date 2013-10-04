var Api = require('./Api');

var Apps = function () {
  this.path = '/apps';
};

Api.extend(Apps.prototype);

module.exports = Apps;