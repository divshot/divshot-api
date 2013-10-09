module.exports = function (api) {
  var user = require('./user')(api);
  var apps = api.endpoint('apps', {
    // pre: function (api, next) {
    //   console.log('pre hook');
    //   next();
    // }
  });
  
  return apps;
};