'use strict';

/* Origin of coffeelint wrapper idea: https://github.com/clutchski/coffeelint */
var path = require('path');
var resolve = require('resolve').sync;

var filepath = resolve('coffeelint', { basedir: process.cwd() });
var coffeelint_cli = path.dirname(filepath) + path.sep + 'commandline.js';

require(coffeelint_cli);
