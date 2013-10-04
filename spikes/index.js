var Divshot = require('./Divshot');

var divshot = Divshot.createClient({
  // token: 'lLuJy9MwbKC8QyAA9oKYpDz14054FV8kWmFqdnhj'
  email: 'scott@divshot.com',
  password: 'Rad1alp00p!'
});

// divshot.user.authenticate(function (err, token) {
//   console.log(token);
// });

// divshot.apps.getById('524e0072421aa9387e000029', function (err, app) {
//   console.log(app);
// });

divshot.apps.getAll(function (err, apps) {
  console.log(apps);
});

// divshot.apps.create({
//   name: 'columnio'
// }, function (err, appData) {
//   console.log(appData);
// });