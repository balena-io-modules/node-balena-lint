# Origin of coffeelint wrapper idea: https://github.com/clutchski/coffeelint
path = require 'path'
resolve = require('resolve').sync

filepath = resolve('coffeelint', basedir: __dirname)
coffeelint_cli = path.join(path.dirname(filepath), 'commandline.js')

require(coffeelint_cli)
