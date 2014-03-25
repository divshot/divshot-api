#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var browserify = require('browserify');
var minify = require('minify');

var ENTRY_FILE = path.resolve(__dirname, '../lib/divshot.js');
var DIST_FILE = path.resolve(__dirname, '../dist/divshot.js');
var DIST_FILE_MIN = path.resolve(__dirname, '../dist/divshot.min.js');

console.log('Bundling ...');

browserify(ENTRY_FILE)
  .bundle({
    standalone: 'Divshot'
  })
  .pipe(fs.createWriteStream(DIST_FILE)).on('close', optimize);

function optimize () {
  var contents = fs.readFileSync(DIST_FILE, 'utf8');
  fs.writeFileSync(DIST_FILE_MIN, contents);
  
  console.log('Minifying ...\n')
  minify.optimize(DIST_FILE_MIN, {
    callback: function (minifiedContents) {
      fs.writeFileSync(DIST_FILE_MIN, minifiedContents);
    }
  });
}
