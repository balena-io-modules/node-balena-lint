import * as Promise from 'bluebird';
const coffeelint: any = require('coffeelint');
const reporter: any = require('coffeelint/lib/reporters/default');
import * as depcheck from 'depcheck';
import * as fs from 'fs';
import * as glob from 'glob';
const merge: any = require('merge');
import * as optimist from 'optimist';
import * as path from 'path';
import * as tslint from 'tslint';

interface ResinLintConfig {
	configPath: string;
	configFileName: string;
	extensions: string[];
	lang: 'coffeescript' | 'typescript';
}

const configurations: { [key: string]: ResinLintConfig } = {
	coffeescript: {
		configPath: path.join(__dirname, '../config/coffeelint.json'),
		configFileName: 'coffeelint.json',
		extensions: ['coffee'],
		lang: 'coffeescript',
	},
	typescript: {
		configPath: path.join(__dirname, '../config/tslint.json'),
		configFileName: 'tslint.json',
		extensions: ['ts', 'tsx'],
		lang: 'typescript',
	},
};

/**
 * The linter expects the path to actual source files, for example:
 *   src/
 *   test/
 * but depcheck expects the root of a project directory (where the
 * package.json is). This function takes a path and propagates upwards
 * until it contains a package.json
 */
const getPackageJsonDir = function(dir: string): string {
	let name = findFile('package.json', dir);
	if (name === null) {
		throw new Error('Could not find package.json!');
	}
	return path.dirname(name);
};

const read = function(path: string): string {
	let realPath = fs.realpathSync(path);
	return fs.readFileSync(realPath).toString();
};

const findFile = function(name: string, dir?: string): string | null {
	dir = dir || process.cwd();
	let filename = path.join(dir, name);
	let parent = path.dirname(dir);
	if (fs.existsSync(filename)) {
		return filename;
	} else if (dir === parent) {
		return null;
	} else {
		return findFile(name, parent);
	}
};

const parseJSON = function(file: string): string {
	try {
		return JSON.parse(fs.readFileSync(file).toString());
	} catch (err) {
		console.error(`Could not parse ${file}`);
		throw err;
	}
};

const findFiles = function(extensions: string[], paths: string[] = []): string[] {
	let files: string[] = [];
	for (const p of paths) {
		if (fs.statSync(p).isDirectory()) {
			files = files.concat(glob.sync(`${p}/**/*.@(${extensions.join('|')})`));
		} else {
			files.push(p);
		}
	}

	return files.map(p => path.join(p));
};

const lintCoffeeFiles = function(files: string[], config: {}): number {
	const errorReport = new coffeelint.getErrorReport();

	for (const file of files) {
		const source = read(file);
		errorReport.lint(file, source, config);
	}

	const report = new reporter(errorReport, {
		colorize: process.stdout.isTTY,
		quiet: false,
	});

	report.publish();

	return  errorReport.getExitCode();
};

const lintTsFiles = function(files: string[], config: {}): number {
	const parsedConfig = tslint.Configuration.parseConfigFile(config);
	const linter = new tslint.Linter({
		fix: false,
		formatter: 'stylish',
	});

	for (const file of files) {
		const source = read(file);
		linter.lint(file, source, parsedConfig);
	}

	const errorReport = linter.getResult();

	// Print the linter results
	console.log(linter.getResult().output);

	return errorReport.errorCount === 0 ? 0 : 1;
};

const runLint = function(resinLintConfig: ResinLintConfig, paths: string[], config: {}) {
	let linterExitCode: number | undefined;
	const scripts = findFiles(resinLintConfig.extensions, paths);

	if (resinLintConfig.lang === 'typescript') {
		linterExitCode = lintTsFiles(scripts, config);
	}

	if (resinLintConfig.lang === 'coffeescript') {
		linterExitCode = lintCoffeeFiles(scripts, config);
	}

	return process.on('exit', () => process.exit(linterExitCode));
};

export const lint = function(passedParams: any) {
	try {
		const options = optimist(passedParams)
			.usage('Usage: resin-lint [options] [...]')
			.describe('f', 'Specify a linting config file to override resin-lint rules')
			.describe('p', 'Print default resin-lint linting rules')
			.describe('i', 'Ignore linting config files in project directory and its parents')
			.boolean('typescript', 'Lint typescript files instead of coffeescript')
			.boolean('u', 'Run unused import check');

		if ((options.argv._.length < 1) && !options.argv.p) {
			options.showHelp();
			process.exit(1);
		}

		return Promise.try<any>(function() {
			if (options.argv.u) {
				return Promise.map(options.argv._, function(dir: string) {
					dir = getPackageJsonDir(dir);
					return Promise.resolve(depcheck(path.resolve('./', dir), {
						ignoreMatches: [
							'@types/*', // ignore typescript type declarations
							'supervisor', // isn't used directly from source
							'coffee-script', // Gives false positives
							'coffeescript', // An alias
							'colors', // Generally imported via colors/safe, which doesn't trigger depcheck
							'coffeescope2',
						],
					}))
					.get('dependencies')
					.then(function(deps) {
						if (deps.length > 0) {
							console.log(`${deps.length} unused dependencies:`);
							for (let dep of deps) {
								console.log(`\t${dep}`);
							}
							process.exit(1);
						}
						console.log('No unused dependencies!');
						return console.log();
					});
				});
			}}).then(function() {

			let configOverridePath;
			const resinLintConfiguration = options.argv.typescript ? configurations.typescript : configurations.coffeescript;

			if (options.argv.p) {
				console.log(fs.readFileSync(resinLintConfiguration.configPath).toString());
				process.exit(0);
			}

			let config = parseJSON(resinLintConfiguration.configPath);

			if (options.argv.f) {
				configOverridePath = fs.realpathSync(options.argv.f);
			}

			if (!options.argv.i && !configOverridePath) {
				configOverridePath = findFile(resinLintConfiguration.configFileName);
			}

			if (configOverridePath) {
				// Override default config
				const configOverride = parseJSON(configOverridePath);
				config = merge.recursive(config, configOverride);
			}

			const paths = options.argv._;

			return runLint(resinLintConfiguration, paths, config);
		}).return();

	} catch (err) {
		return console.log(err.stack);
	}
};
