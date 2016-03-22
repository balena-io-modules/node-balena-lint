// Generated by CoffeeScript 1.10.0
(function() {
  var fs, getPath, minimist, path, resolve, spawn;

  fs = require('fs');

  path = require('path');

  minimist = require('minimist');

  resolve = require('resolve').sync;

  spawn = require('child_process').spawn;

  getPath = function(dest) {
    return path.join(__dirname, dest);
  };

  module.exports = function(passed_params) {
    var argv, confgFile, spawn_params;
    argv = minimist(passed_params);
    confgFile = [];
    spawn_params = [];
    spawn_params.push(getPath('./coffeelint_wrapper.js'));
    if ('f' in argv) {
      spawn_params.push('-f', argv['f']);
    } else {
      spawn_params.push('-f', getPath('../coffeelint.json'));
    }
    spawn_params.push.apply(spawn_params, argv['_']);
    return spawn(process.execPath, spawn_params, {
      stdio: 'inherit'
    }).on('close', function(code) {
      return process.exit(code);
    });
  };

}).call(this);
