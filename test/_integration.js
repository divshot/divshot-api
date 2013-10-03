process.env.NODE_ENV = 'test';

var Divshot = require('../lib/Divshot');

var divshot = Divshot.createClient({
  email: 'scott@divshot.com',
  password: 'Rad1alp00p!'
});

// divshot.apps.getAll(function (err, apps) {
//   console.log(apps);
// });

// divshot.apps.create('another-app', function () {
//   console.log(arguments);
// });

// divshot.user.authenticate(function (err, token) {
//   console.log(divshot.options.token);
// });
