# Divshot API

Wrapper for the Divshot API. 

### Contents

* [Instantiate](#instantiate)
* [Angular Module](#angular-module)
* [User](#user)
  * [Password](#user-password)
  * [Emails](#user-emails)
* [Organizations](#organizations)
  * [Members](#organization-members)
* [Apps](#apps)
  * [Builds](#builds)
  * [Releases](#releases)
  * [Domains](#domains)
  * [Environment Configuration](#app-environment-configuration)
  * [Subscription](#subscription)
  * [Webhooks](#webhooks)

## Install

NPM

```
npm install divshot-api --save
```

Bower


```
bower install divshot --save
```

## Usage

Refer to the [Narrator](https://github.com/scottcorgan/narrator) api for a more in depth understanding of all available methods.

**CommonJS (Node/Browserify)**

```js
var Divshot = require('divshot');
```

**Standalone**
```
<script src="/path/to/divshot.standalone.min.js"></div>
```

###Instantiate

```js
var api = Divshot.createClient({
  client_id: '123abc', // MUST be specified
  
  email: 'someone@divshot.com',
  password: 'somepassword123!',
  
  // OR
  
  token: 'your divshot access token'
});
```

###Browser Authentication

The Divshot API wrapper provides a simple, popup-based authentication mechanism for
easily authenticating a user without requiring the handling of usernames or passwords.
To use browser authentication, simply instantiate a client and call the `auth` method:

**divshot.auth(type, options, callback)**

This method returns a promise but takes an optional callback. `type` should be either
`password` or `github` (defaults to `password`).

```js
var api = Divshot.createClient({client_id: 'abc123'});

divshot.auth().then(function(response) {
  response.user; // user details
  response.access_token; //access token
}, function (error) {
  // do something with an error
});
```

#### Password Authentication

If you need to accept an email and password directly, you can do so as in the following example.
Passwords **MUST NOT** be stored and should only come from direct user input (e.g. a form field).

```js
divshot.auth('password', {email: 'abby@example.com', password: 'test123'}).then(function(response) {
  // works just as above
}, function (error) {
  // ditto
});
```

#### Cookie Token Storage

For convenience, the `auth` method allows you to store a cookie with an encoded access token
to keep the user logged into Divshot. Simply pass the `store: true` option to `auth`:

```js
api.auth({store: true}, function(error, token, user){
  // ...
});
```

This will automatically create a cookie on the current domain to store the access token for one
week. On subsequent page loads you can use the `authWithCookie()` method to authenticate a client
based on the cookie. This method will return `true` if a cookie was found and `false` otherwise.

```js
if (api.authWithCookie()) {
  // cookie found, api is now authenticated and can
  // make calls to retrieve protected resources
} else {
  // no cookie found, display an auth button etc
}
```

###Angular Module

Located at ` /dist/divshot.angular.js `

```js
angular.module('myApp', ['divshot'])
  .config(function (divshotProvider) {
    divshotProvider.configure({
      token: 'divshot_api_access_token'
    });
  }).
  controller('SomeCtrl', function ($scope, divshot) {
    
    $scope.apps = divshot.apps.list();
    
  });
```

#### Custom XHR arguments

Custom XHR arguments can be set to be sent with each request. Refer to Angular's [$http](http://docs.angularjs.org/api/ng/service/$http#usage) documentation for which arguments are supported.

```js
angular.module('myApp', ['divshot'])
  .config(function (divshotProvider) {
    divshotProvider.configure({
      token: 'divshot_api_access_token'
    });
  }).
  controller('SomeCtrl', function ($scope, divshot) {
    divshot.withCredentials(true);
    // or
    divshot.xhr('withCredentials', true);
  });
```

###User

By default, the ` authenticate ` method will be called on each request as a pre hook. If a token is provided, this does not create another http request.

```js
api.user.authenticate(function (err, token) {
  
});

api.user.setCredentials({
  email: 'someone@divshot.com',
  password: 'somepassword123!',
  
  // OR
  
  token: 'some_really_long_access_token_from_divshot'
});

// User data
api.user.self().then(function (user) {
  
});
// OR
api.user.id(userId).get().then(function (user) {
  
});

// Update user
var user = api.user.id(userId);
user.update({
  name: 'First Last'
}).then(function (user) {
  
});

// Set welcomed for new users
api.user.setWelcomed().then(function () {

});

// Delete account
api.user.deleteAcccount(user@email.com).then(function () {
  
});

```

#### User password

```js
// Change password
divshot.user.password.update({
  password: 'Password123',
  password_confirm: 'Password123'
}).then(function (res) {
  
});

// Reset password if forgotten
divshot.password.reset(userId).then(function (res) {
  
});
```

#### User Emails

```js
// Add email
divshot.user.emails.add('something@aol.com').then(function (res) {
  
});

// Set primary email
divshot.user.emails.primary('something@aol.com').then(function (res) {
  
});

// Remove email
divshot.user.emails.remove('something@aol.com').then(function (res) {
  
});

// Resend email
divshot.user.emails.resend('something@aol.com').then(function (res) {
  
});
```

### Organizations

```js
// Users orgs
divshot.organizations.list().then(function (orgs) {
  
});

// A single organization
divshot.organizations.id(someOrgId).get().then(function (org) {
  
});

// Apps from an organization
divshot.organizations.id(someOrgId).apps.list().then(function (apps) {
  
});

// Create organization
divshot.organizations.create({
  name: 'name',
  nick: 'nick',
  billing_email: 'someone@aol.com',
  gravatar_email: 'someone@aol.com'
}).then(function (res) {
  
});

// Update organization
divshot.organizations.id(someOrgId).update({
  name: 'name',
  billing_email: 'someone@aol.com',
  gravatar_email: 'someone@aol.com',
  etc: 'other stuff'
}).then(function (res) {
  
});
```

### Organization Members

```js
// Get org members
divshot.organizations.id(someOrg).members.list().then(function (members) {
  
});

// Invite members to organization
divshot.organizations.id(someOrg).members.create({
  name: email,
  email: email
}).then(function (res) {
  
});

// Update a member in organiztion
divshot.organizations.id(someOrg).members.id(memberid).update({
  admin: false // or true
}).then(function (res) {
  
});

// Remove a member from an organization
divshot.organizations.id(someOrg).members.id(memberId).remove().then(function () {
  
});

```

### Apps

```js
// List apps
api.apps.list().then(function (apps) {
  
});

// Create an app
api.apps.create('app-name').then(function (app) {
  
});

// Create an app from object
api.apps.createFromObject(params).then(function (app) {
  
});

// A specific app
var app = api.apps.id('app name');
app.get().then(function (app) {
  
});

// Delete an app
app.remove().then(function (res) {

});
```

### Builds

```js
app.builds.list(function (err, builds) {
  
});

app.builds.id('build id').get(function (err, build) {
  // Specific build by id
});

app.builds.id('build id').finalize(function (err, response) {
  
});

app.builds.id('build id').release('production', function (err, response) {
  
});
```

###Releases

```js
app.releases.list(function (err, releases) {
  
});

app.releases.env('production').get(function (err, release) {
  // Release by environment
});

app.releases.env('production').rollback(function (err, response) {
  
});

// Rollback to specific version
app.releases.env('production').rollbackTo('v12').then(function () {
  
});

app.releases.env('production').promote('staging', function (err, callback) {
  // Here, "staging" is the from environment
  // and "production" is the to-environment
});
```

###Domains

```js
// List domains for an app
app.domains.list().then(function(domains) {
  
});

// Add a domain
app.domains.add('www.domain.com').then(function (response) {
  
});

// Remove a domain
app.domains.remove('www.domain.com').then(function (response) {
  
});

```

### Subscription

Update data associated with an App's subscription

```js
app.subscription.update('card number').then(function (res) {
  
});
```

### Webhooks

Manipulate webhooks associated with your app

```js
app.webhooks.list().then(function (response) {

});

app.webhooks.create({url: 'some-url.com', active: true}).then(function () {

});

app.webhooks.resume(hook).then(function () {

});

app.webhooks.pause(hook).then(function () {

});

app.webhooks.remove(hookId).then(function () {

});
```

###App Environment Configuration

```js
app.env('development').config({
  auth: 'username:password'
}, function (err, response) {
  
});
```

## Build

```
grunt build
```


