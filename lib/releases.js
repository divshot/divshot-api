module.exports = function () {
  var releases = this.resource('releases', {
    lookup: function (hostname) {
      return this.api.get(this.url() + '/lookup?host=' + hostname);
    }
  });
  
  return releases;
};