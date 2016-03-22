fs = require 'fs'
path = require 'path'
minimist = require 'minimist'
resolve = require('resolve').sync
spawn = require('child_process').spawn

getPath = (dest) ->
	path.join(__dirname, dest)

# Spawns 'coffeelint -f coffeelint.json <parameters>'
#
# If '-f' is passed as a parameter, then the internal 'coffeelint.json'
# is overridden with the one specified.
#
# passed_params: The command-line parameters passed to 'resin-lint'
module.exports = (passed_params) ->
	argv = minimist(passed_params)
	confgFile = []
	spawn_params = []

	# Prepare parameters for 'coffeelint' execution
	spawn_params.push(getPath('./coffeelint_wrapper.js'))
	if 'f' of argv
		spawn_params.push('-f', argv['f'])
	else
		spawn_params.push('-f', getPath('../coffeelint.json'))

	spawn_params.push(argv['_']...)
	spawn(process.execPath, spawn_params, stdio: 'inherit')
	.on 'close', (code) ->
		process.exit(code)
