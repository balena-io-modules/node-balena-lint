fs = require('fs')
path = require('path')
glob = require('glob')
merge = require('merge')
optimist = require('optimist')
coffeelint = require('coffeelint')
reporter = require('coffeelint/lib/reporters/default')

CONFIG_PATH = path.join(__dirname, '../config/coffeelint.json')

read = (path) ->
	realPath = fs.realpathSync(path)
	fs.readFileSync(realPath).toString()

findFile = (name, dir) ->
	dir = dir or process.cwd()
	filename = path.join(dir, name)
	parent = path.resolve(dir, '../')
	if fs.existsSync(filename)
		return filename
	else if dir is parent
		return null
	else
		findFile(name, parent)

parseJSON = (file) ->
	try
		JSON.parse(fs.readFileSync(file).toString())
	catch err
		console.error("Could not parse #{file}")
		throw err

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
	try
		options = optimist(passed_params)
			.usage('Usage: resin-lint [options] [...]')
			.describe('f', 'Specify a coffeelint config file to override resin-lint rules')
			.describe('p', 'Print default resin-lint coffeelint.json')
			.describe('i', 'Ignore coffeelint.json files in project directory and its parents')

		if options.argv._.length < 1 and not options.argv.p
			options.showHelp()
			process.exit(1)

		if options.argv.p
			console.log(fs.readFileSync(CONFIG_PATH).toString())
			process.exit(0)

		config = parseJSON(CONFIG_PATH)

		if options.argv.f
			configOverridePath = fs.realpathSync(options.argv.f)

		configOverridePath ?= findFile('coffeelint.json') if not options.argv.i
		if configOverridePath
			# Override default config
			configOverride = parseJSON(configOverridePath)
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
