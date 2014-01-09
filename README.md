# Divshot Api

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

## Install

```
npm install divshot --save
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
  email: 'someone@divshot.com',
  password: 'somepassword123!',
  
  // OR
  
  token: 'your divshot access token'
});
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

```

#### User password

```js
// Change password
divshot.user.password.update({
  password: 'Password123',
  password_confirm: 'Password123'
}).then(function (res) {
  
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

// A specific app
var app = api.apps.id('app name');
app.get().then(function (app) {
  
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


