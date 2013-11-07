# Divshot Api

Wrapper for the Divshot API

## Install

```
npm install divshot --save
```

## Usage

####Instantiate

```javascript
var api = Divshot.createClient({
  token: 'your divshot access token'
});
```

####Apps

```
// List apps
api.apps.list(function (err, apps) {
  
});

// A specific app
var app = api.apps.id('app name');
app.get(function (err, app) {
  
});

// App builds
app.builds.list(function (err, builds) {
  
});

app.builds.id('build id').get(function (err, build) {
  // Specific build by id
});

app.builds.id('build id').finalize(function (err, response) {
  
});

app.builds.id('build id').release('production', function (err, response) {
  
});

// App releases
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

// App domains
app.domains.add('www.domain.com', function (err, response) {
  
});

app.domains.remove('www.domain.com', function (err, response) {
  
});

```


