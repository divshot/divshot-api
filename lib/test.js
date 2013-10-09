var Divshot = require('./divshot');
var divshot = Divshot.createClient({
  email: 'scott@divshot.com',
  password: 'Rad1alp00p!'
  // token: '9XlWtQwoijzujJFWnHdeZKJ_vriy4YJXNH0KpLZ_'
});


divshot.apps.create({
  name: 'another-application'
}, function (err, response) {
  var app = divshot.apps.one(response.id);
  app.get(function (err, appData) {
    console.log(appData);
  });
  
  // divshot.apps.list(function (err, apps) {
  //   console.log(apps);
  // });
});
