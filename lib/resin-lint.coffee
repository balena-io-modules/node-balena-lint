Promise = require('bluebird')
depcheck = require('depcheck')
fs = require('fs')
path = require('path')
glob = require('glob')
merge = require('merge')
optimist = require('optimist')
coffeelint = require('coffeelint')
reporter = require('coffeelint/lib/reporters/default')
tslint = require('tslint')

configurations =
	coffeescript:
		configPath: path.join(__dirname, '../config/coffeelint.json')
		configFileName: 'coffeelint.json'
		extensions: ['coffee']
		lang: 'coffeescript'
	typescript:
		configPath: path.join(__dirname, '../config/tslint.json')
		configFileName: 'tslint.json'
		extensions: ['ts', 'tsx']
		lang: 'typescript'

# The linter expects the path to actual source files, for example:
#		src/
#		test/
#	but depcheck expects the root of a project directory (where the
#	package.json is). This function takes a path and propagates upwards
#	until it contains a package.json
getPackageJsonDir = (dir) ->
	name = findFile('package.json', dir)
	if name is null
		throw new Error('Could not find package.json!')
	return path.dirname(name)

read = (path) ->
	realPath = fs.realpathSync(path)
	fs.readFileSync(realPath).toString()

findFile = (name, dir) ->
	dir = dir or process.cwd()
	filename = path.join(dir, name)
	parent = path.dirname(dir)
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

findFiles = (extensions, paths = []) ->
	files = []
	for p in paths
		if fs.statSync(p).isDirectory()
			files = files.concat(glob.sync("#{p}/**/*.@(#{extensions.join('|')})"))
		else
			files.push(p)
	files.map((p) -> path.join(p))

lintCoffeeFiles = (files, config) ->
	errorReport = new coffeelint.getErrorReport()
	for file in files
		source = read(file)
		errorReport.lint(file, source, config)
	errorReport

	report = new reporter errorReport,
		colorize: process.stdout.isTTY
		quiet: false
	report.publish()

	return  errorReport.getExitCode()

lintTsFiles = (files, config) ->
	parsedConfig = tslint.Configuration.parseConfigFile(config)
	linter = new tslint.Linter(
		fix: false
		formatter: 'stylish'
	)
	for file in files
		source = read(file)
		linter.lint(file, source, parsedConfig)

	errorReport = linter.getResult()

	console.log(linter.getResult().output)

	return if errorReport.errorCount is 0 then 0 else 1

runLint = (resinLintConfig, paths, config) ->
	scripts = findFiles(resinLintConfig.extensions, paths)

	if resinLintConfig.lang is 'typescript'
		linterExitCode = lintTsFiles(scripts, config)

	if resinLintConfig.lang is 'coffeescript'
		linterExitCode = lintCoffeeFiles(scripts, config)

	process.on 'exit', ->
		process.exit(linterExitCode)

module.exports = (passed_params) ->
	try
		options = optimist(passed_params)
			.usage('Usage: resin-lint [options] [...]')
			.describe('f', 'Specify a linting config file to override resin-lint rules')
			.describe('p', 'Print default resin-lint linting rules')
			.describe('i', 'Ignore linting config files in project directory and its parents')
			.describe('typescript', 'Lint typescript files instead of coffeescript')
			.boolean('u', 'Run unused import check')

		if options.argv._.length < 1 and not options.argv.p
			options.showHelp()
			process.exit(1)

		Promise.try ->
			if options.argv.u
				return Promise.map options.argv._, (dir) ->
					dir = getPackageJsonDir(dir)
					Promise.resolve depcheck path.resolve('./', dir),
						ignoreMatches: [
							'@types/*' # ignore typescript type declarations
							'supervisor' # isn't used directly from source
							'coffee-script' # Gives false positives
							'coffeescript' # An alias
							'colors' # Generally imported via colors/safe, which doesn't trigger depcheck
							'coffeescope2'
						]
					.get('dependencies')
					.then (deps) ->
						if deps.length > 0
							console.log("#{deps.length} unused dependencies:")
							console.log("\t#{dep}") for dep in deps
							process.exit(1)
						console.log('No unused dependencies!')
						console.log()
		.then ->

			resinLintConfiguration = if options.argv.typescript then configurations.typescript else configurations.coffeescript

			if options.argv.p
				console.log(fs.readFileSync(resinLintConfiguration.configPath).toString())
				process.exit(0)

			config = parseJSON(resinLintConfiguration.configPath)

			if options.argv.f
				configOverridePath = fs.realpathSync(options.argv.f)

			if not options.argv.i
				configOverridePath ?= findFile(resinLintConfiguration.configFileName)
			if configOverridePath
				# Override default config
				configOverride = parseJSON(configOverridePath)
				config = merge.recursive(config, configOverride)

			paths = options.argv._

			runLint(resinLintConfiguration, paths, config)

	catch err
		console.log(err.stack)
