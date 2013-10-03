var Divshot = require('../lib/Divshot');

var divshot = Divshot.createClient({
  email: 'scott@divshot.com',
  password: 'Rad1alp00p!'
});

divshot.user.authenticate(function (err, token) {
  console.log(divshot.options.token);
});
