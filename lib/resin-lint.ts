import * as Promise from 'bluebird';
const coffeelint: any = require('coffeelint');
const reporter: any = require('coffeelint/lib/reporters/default');
import * as depcheck from 'depcheck';
import * as fs from 'fs';
import * as glob from 'glob';
const merge: any = require('merge');
import * as optimist from 'optimist';
import * as path from 'path';
import * as prettier from 'prettier';
import * as tslint from 'tslint';
import { IConfigurationFile } from 'tslint/lib/configuration';

interface ResinLintConfig {
	configPath: string;
	configFileName: string;
	extensions: string[];
	lang: 'coffeescript' | 'typescript';
	prettierCheck?: boolean;
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
	typescriptPrettier: {
		configPath: path.join(__dirname, '../config/tslint-prettier.json'),
		configFileName: 'tslint.json',
		extensions: ['ts', 'tsx'],
		lang: 'typescript',
	},
};

const prettierConfigPath = path.join(__dirname, '../config/.prettierrc');

/**
 * The linter expects the path to actual source files, for example:
 *   src/
 *   test/
 * but depcheck expects the root of a project directory (where the
 * package.json is). This function takes a path and propagates upwards
 * until it contains a package.json
 */
const getPackageJsonDir = function(dir: string): string {
	const name = findFile('package.json', dir);
	if (name === null) {
		throw new Error('Could not find package.json!');
	}
	return path.dirname(name);
};

const read = function(filepath: string): string {
	const realPath = fs.realpathSync(filepath);
	return fs.readFileSync(realPath).toString();
};

const findFile = function(name: string, dir?: string): string | null {
	dir = dir || process.cwd();
	const filename = path.join(dir, name);
	const parent = path.dirname(dir);
	if (fs.existsSync(filename)) {
		return filename;
	} else if (dir === parent) {
		return null;
	} else {
		return findFile(name, parent);
	}
};

const parseJSON = function(file: string): {} {
	try {
		return JSON.parse(fs.readFileSync(file).toString());
	} catch (err) {
		console.error(`Could not parse ${file}`);
		throw err;
	}
};

const findFiles = function(
	extensions: string[],
	paths: string[] = [],
): string[] {
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

	return errorReport.getExitCode();
};

const lintTsFiles = function(
	files: string[],
	config: {},
	prettierConfig?: prettier.Options,
): number {
	const linter = new tslint.Linter({
		fix: false,
		formatter: 'stylish',
	});

	for (const file of files) {
		const source = read(file);
		if (prettierConfig) {
			const isPrettified = prettier.check(source, prettierConfig);
			if (!isPrettified) {
				console.log(`Error: File ${file} hasn't been formatted with prettier`);
				return 1;
			}
		}
		linter.lint(file, source, config as IConfigurationFile);
	}

	const errorReport = linter.getResult();

	// Print the linter results
	console.log(linter.getResult().output);

	return errorReport.errorCount === 0 ? 0 : 1;
};

const runLint = function(
	resinLintConfig: ResinLintConfig,
	paths: string[],
	config: {},
) {
	let linterExitCode: number | undefined;
	const scripts = findFiles(resinLintConfig.extensions, paths);

	if (resinLintConfig.lang === 'typescript') {
		let prettierConfig: prettier.Options | undefined;
		if (resinLintConfig.prettierCheck) {
			prettierConfig = parseJSON(prettierConfigPath) as prettier.Options;
			prettierConfig.parser = 'typescript';
		}

		linterExitCode = lintTsFiles(scripts, config, prettierConfig);
	}

	if (resinLintConfig.lang === 'coffeescript') {
		linterExitCode = lintCoffeeFiles(scripts, config);
	}

	return process.on('exit', () => process.exit(linterExitCode));
};

export const lint = (passedParams: any) =>
	Promise.try(() => {
		const options = optimist(passedParams)
			.usage('Usage: resin-lint [options] [...]')
			.describe(
				'f',
				'Specify a linting config file to extend and override resin-lint rules',
			)
			.describe('p', 'Print default resin-lint linting rules')
			.describe(
				'i',
				'Ignore linting config files in project directory and its parents',
			)
			.boolean('typescript', 'Lint typescript files instead of coffeescript')
			.boolean('no-prettier', 'Disables the prettier code format checks')
			.boolean('u', 'Run unused import check');

		if (options.argv._.length < 1 && !options.argv.p) {
			options.showHelp();
			process.exit(1);
		}

		return Promise.try<any>(function() {
			if (options.argv.u) {
				return Promise.map(options.argv._, function(dir: string) {
					dir = getPackageJsonDir(dir);
					return Promise.resolve(
						depcheck(path.resolve('./', dir), {
							ignoreMatches: [
								'@types/*', // ignore typescript type declarations
								'supervisor', // isn't used directly from source
								'coffee-script', // Gives false positives
								'coffeescript', // An alias
								'colors', // Generally imported via colors/safe, which doesn't trigger depcheck
								'coffeescope2',
							],
						}),
					)
						.get('dependencies')
						.then(function(deps) {
							if (deps.length > 0) {
								console.log(`${deps.length} unused dependencies:`);
								for (const dep of deps) {
									console.log(`\t${dep}`);
								}
								process.exit(1);
							}
							console.log('No unused dependencies!');
							return console.log();
						});
				});
			}
		})
			.then(function() {
				let configOverridePath;
				// optimist converts all --no-xyz args to a argv.xyz === false
				const prettierCheck = options.argv.prettier !== false;
				const typescriptCheck = options.argv.typescript;
				const resinLintConfiguration = typescriptCheck
					? prettierCheck
						? configurations.typescriptPrettier
						: configurations.typescript
					: configurations.coffeescript;

				if (options.argv.p) {
					console.log(
						fs.readFileSync(resinLintConfiguration.configPath).toString(),
					);
					process.exit(0);
				}

				// TSLint config needs to be loaded with `loadConfigurationFromPath`
				// Coffeelint needs to be loaded as a plain file
				let config: {} = typescriptCheck
					? tslint.Configuration.loadConfigurationFromPath(
							resinLintConfiguration.configPath,
					  )
					: parseJSON(resinLintConfiguration.configPath);

				if (options.argv.f) {
					configOverridePath = fs.realpathSync(options.argv.f);
				}

				if (!options.argv.i && !configOverridePath) {
					configOverridePath = findFile(resinLintConfiguration.configFileName);
				}

				if (configOverridePath) {
					// Extend/override default config
					if (typescriptCheck) {
						const configOverride = tslint.Configuration.loadConfigurationFromPath(
							configOverridePath,
						);
						config = tslint.Configuration.extendConfigurationFile(
							config as IConfigurationFile,
							configOverride,
						);
					} else {
						const configOverride = parseJSON(configOverridePath);
						config = merge.recursive(config, configOverride);
					}
				}

				const paths = options.argv._;

				resinLintConfiguration.prettierCheck = prettierCheck;
				return runLint(resinLintConfiguration, paths, config);
			})
			.return();
	});
