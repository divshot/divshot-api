// process.env.NODE_ENV = 'test';

var Divshot = require('../lib/Divshot');

var divshot = Divshot.createClient({
  email: 'scottcorgan@gmail.com',
  password: 'Rad1alp00p!'
});

divshot.apps.list(function (err, apps) {
  console.log(apps);
});

// divshot.apps.create({
//   name: 'another-app'
// }, function () {
//   console.log(arguments);
// });

// divshot.user.authenticate(function (err, token) {
//   console.log(divshot.user.credentials.token);
// });
