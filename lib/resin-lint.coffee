fs = require 'fs'
path = require 'path'
glob = require('glob')
merge = require('merge')
optimist = require('optimist')
coffeelint = require('coffeelint')
reporter = require('coffeelint/lib/reporters/default')

CONFIG_PATH = path.join(__dirname, '../config/coffeelint.json')

read = (path) ->
	realPath = fs.realpathSync(path)
	fs.readFileSync(realPath).toString()

findCoffeeScriptFiles = (paths = []) ->
	files = []
	for p in paths
		if fs.statSync(p).isDirectory()
			files = files.concat(glob.sync("#{p}/**/*.coffee"))
		else
			files.push(p)
	files.map((p) -> path.join(p))

lintFiles = (files, config) ->
	errorReport = new coffeelint.getErrorReport()
	for file in files
		source = read(file)
		errorReport.lint(file, source, config)
	return errorReport

module.exports = (passed_params) ->
	files = []

	try
		options = optimist(passed_params)
			.usage('Usage: resin-lint [options] [...]')
			.describe('f', 'Specify a coffeelint config file to override resin-lint rules')
			.describe('p', 'Print default resin-lint coffeelint.json')

		if options.argv._.length < 1 and not options.argv.p
			options.showHelp()
			process.exit(1)

		if options.argv.p
			console.log(fs.readFileSync(CONFIG_PATH).toString())
			process.exit(0)

		config = JSON.parse(fs.readFileSync(CONFIG_PATH))
		if options.argv.f
			# Override default config
			configOverridePath = fs.realpathSync(options.argv.f)
			configOverride = JSON.parse(fs.readFileSync(configOverridePath))
			config = merge(config, configOverride)

		paths = options.argv._
		scripts = findCoffeeScriptFiles(paths)

		errorReport = lintFiles(scripts, config)
		report = new reporter errorReport,
			colorize: process.stdout.isTTY
			quiet: false
		report.publish()

		process.on 'exit', ->
			process.exit(errorReport.getExitCode())
	catch err
		console.log(err.stack)
