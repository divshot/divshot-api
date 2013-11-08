# Divshot Api

Wrapper for the Divshot API. 

## Install

```
npm install divshot --save
```

## Usage

Refer to the [Narrator](https://github.com/scottcorgan/narrator) api for a more in depth understanding of all available methods.

**CommonJS (Node/Browserify)**
```javascript
var Divshot = require('divshot');
```

**Standalone**
```
<script src="/path/to/divshot.standalone.min.js"></div>
```

###Instantiate

```javascript
var api = Divshot.createClient({
  email: 'someone@divshot.com',
  password: 'somepassword123!',
  
  // OR
  
  token: 'your divshot access token'
});
```

###Angular Module

Located at ` /dist/divshot.angular.js `

```javascript
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

```javascript
api.user.authenticate(function (err, token) {

});

api.user.setCredentials({
  email: 'someone@divshot.com',
  password: 'somepassword123!',
  
  // OR
  
  token: 'some_really_long_access_token_from_divshot'
});
```

###Apps

```javascript
// List apps
api.apps.list(function (err, apps) {
  
});

// A specific app
var app = api.apps.id('app name');
app.get(function (err, app) {
  
});
```

### Builds

```javascript
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

```javascript
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

```javascript
app.domains.add('www.domain.com', function (err, response) {
  
});

app.domains.remove('www.domain.com', function (err, response) {
  
});

```


