// process.env.NODE_ENV = 'test';

var Divshot = require('../lib/Divshot');

var divshot = Divshot.createClient({
  // email: 'scottcorgan@gmail.com',
  // password: 'Rad1alp00p!'
  token: 'Z3X_9lvvPykmc3Y01zrC8itfQARQJXyMearFCoq8'
});

divshot.apps.id('5268023d8c41b200150007c8').releases.list().then(function (res) {
  console.log(res);
});

// divshot.user.self().then(function (user) {
//   var orgId = user.organizations[0].id;

//   divshot.organizations.id(orgId).apps.list().then(function (apps) {
//     console.log(apps);
//   });
// });




// divshot.apps.list(function (err, apps) {
//   console.log(apps);
// });

// process.env.API_HOST + '/releases/lookup?host=' + hostname;
// divshot.releases.lookup('development.scottcorgan.divshot.io', function (err, release) {
  // console.log(arguments);
// });

// divshot.apps.id('5268023d8c41b200150007c8').releases.env('development').get(function (err, response) {
//   console.log(arguments);
// });

// divshot.apps.id('5268023d8c41b200150007c8').env('development').config({
//   auth: 'scottcorgan:Rad1alp00p!'
// }, function (err, response) {
//   console.log(arguments);
// });

// divshot.apps.create({
//   name: 'another-app'
// }, function () {
//   console.log(arguments);
// });

// divshot.user.authenticate(function (err, token) {
//   console.log(divshot.user.credentials.token);
// });
