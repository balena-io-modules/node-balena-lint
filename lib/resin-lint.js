'use strict';

var fs = require('fs');
var path = require('path');
var minimist = require('minimist');
var resolve = require('resolve').sync;
var spawn = require('child_process').spawn;

function getPath(dest) {
    return path.join(__dirname, dest);
}

/**
 * Spawns 'coffeelint -f coffeelint.json <parameters>'
 *
 * If '-f' is passed as a parameter, then the internal 'coffeelint.json'
 * is overridden with the one specified.
 *
 * passed_params: The command-line parameters passed to 'resin-coffeelint'
 */
module.exports = function (passed_params) {
    var argv = minimist(passed_params);
    var configFile = [];
    var spawn_params = [];


    /* Prepare parameters for 'coffeelint' exec */
    spawn_params.push(getPath('./coffeelint_wrapper.js'));
    if (!argv['f']) {
        spawn_params.push('-f', getPath('../coffeelint.json'));
    }
    [].push.apply(spawn_params, passed_params);

    spawn(process.execPath, spawn_params, { stdio: 'inherit' });
};
