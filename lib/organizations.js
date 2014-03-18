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