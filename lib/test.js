var FormData = require('form-data');
var fs = require('fs');
var path = require('path');
var async = require('async');
var Divshot = require('./divshot');

var divshot = Divshot.createClient({
  // email: 'scott@divshot.com',
  // password: 'Rad1alp00p!'
  token: '9XlWtQwoijzujJFWnHdeZKJ_vriy4YJXNH0KpLZ_'
});



// 52572ae5421aa92b83000008
divshot.builds.lookup('development.scotts-app.divshot.io', function (err, builds) {
  console.log(builds);
});
 
return;



var app = divshot.apps.id('52572ae5421aa92b83000008');

// 1. Create build [POST]
app.builds.create({
  message: 'hey'
}, function (err, buildObj) {
  var build = app.builds.id(buildObj.id);
  build.get(function (err, buildData) {
    
    // 2. Upload Files [POST]
    var form = new FormData();
    form.append('key', path.join(buildData.loadpoint.prefix,'index.html'));
    form.append('AWSAccessKeyId', buildData.loadpoint.fields.AWSAccessKeyId);
    form.append('policy', buildData.loadpoint.fields.policy);
    form.append('signature', buildData.loadpoint.fields.signature);
    form.append('file', fs.createReadStream(path.join(__dirname, 'index.html')));
    form.submit(buildData.loadpoint.url, function (err, response) {
      if (response.statusCode >= 200) {
        
        // 3. Finalize [PUT]
        build.finalize(function (err, response) {
          // if (response.statusCode) {
            
            // 4. Release [POST]
            build.release('development', function (err, response) {
              
            });
            
          // }
        });
      }
    });
  });
});























// divshot.apps.one('asdf').get(function (err, apps) {
//   console.log(err, apps);
// });

// divshot.apps.create({
//   name: 'another-application'
// }, function (err, response) {
//   if (err) {
//     return console.log('ERROR:', err);
//   }
  
//   var app = divshot.apps.one(response.id);
//   app.get(function (err, appData) {
//     console.log(appData);
//   });
  
//   // divshot.apps.list(function (err, apps) {
//   //   console.log(apps);
//   // });
// });
