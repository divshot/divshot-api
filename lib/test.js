var Divshot = require('./divshot');
var divshot = Divshot.createClient({
  email: 'scott@divshot.com',
  password: 'Rad1alp00p!'
});


// divshot.user.request('http://api.dev.divshot.com:9393/token', 'POST', {
//   form: {
//     username: 'scott@divshot.com',
//     password: 'Rad1alp00p!',
//     grant_type: 'password'
//   },
//   headers: {
//     Authorization: 'Basic NTI1NTc4YTM0MjFhYTk4MTU1MDAwMDA0Og=='
//   }
// }, function (err, response, body) {
//   console.log(body);
// });

// divshot.user.authenticate(function (err, token) {
//   console.log(err, token);
// });

divshot.apps.list(function (err, apps) {
  console.log(err, apps);
});