import { Options as PrettierOptions } from 'prettier';

import { promises as fs } from 'fs';
import * as glob from 'glob';
import * as optimist from 'optimist';
import * as path from 'path';
import * as tslint from 'tslint';
import { promisify } from 'util';

const exists = async (filename: string) => {
	try {
		await fs.access(filename);
		return true;
	} catch {
		return false;
	}
};

const globAsync = promisify(glob);

interface LintConfig {
	configPath: string;
	configFileName: string;
	extensions: string[];
	lang: 'coffeescript' | 'typescript';
	prettierCheck?: boolean;
	testsCheck?: boolean;
}

const configurations: { [key: string]: LintConfig } = {
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
const getPackageJsonDir = async (dir: string): Promise<string> => {
	const name = await findFile('package.json', dir);
	if (name === null) {
		throw new Error('Could not find package.json!');
	}
	return path.dirname(name);
};

const read = async (filepath: string): Promise<string> => {
	const realPath = await fs.realpath(filepath);
	return fs.readFile(realPath, 'utf8');
};

const findFile = async (name: string, dir?: string): Promise<string | null> => {
	dir = dir || process.cwd();
	const filename = path.join(dir, name);
	if (await exists(filename)) {
		return filename;
	}
	const parent = path.dirname(dir);
	if (dir === parent) {
		return null;
	}
	return findFile(name, parent);
};

const parseJSON = async (file: string): Promise<{}> => {
	try {
		return JSON.parse(await fs.readFile(file, 'utf8'));
	} catch (err) {
		console.error(`Could not parse ${file}`);
		throw err;
	}
};

const findFiles = async (
	extensions: string[],
	paths: string[] = [],
): Promise<string[]> => {
	const files: string[] = [];
	await Promise.all(
		paths.map(async (p) => {
			if ((await fs.stat(p)).isDirectory()) {
				files.push(
					...(await globAsync(`${p}/**/*.@(${extensions.join('|')})`)),
				);
			} else {
				files.push(p);
			}
		}),
	);

	return files.map((p) => path.join(p));
};

const lintCoffeeFiles = async (
	files: string[],
	config: {},
): Promise<number> => {
	const coffeelint: any = require('coffeelint');
	const errorReport = new coffeelint.getErrorReport();

	await Promise.all(
		files.map(async (file) => {
			const source = await read(file);
			errorReport.lint(file, source, config);
		}),
	);

	const reporter: any = require('coffeelint/lib/reporters/default');
	const report = new reporter(errorReport, {
		colorize: process.stdout.isTTY,
		quiet: false,
	});

	report.publish();

	return errorReport.getExitCode();
};

const lintTsFiles = async function (
	files: string[],
	config: {},
	prettierConfig: PrettierOptions | undefined,
	autoFix: boolean,
): Promise<number> {
	const prettier = prettierConfig ? await import('prettier') : undefined;
	const linter = new tslint.Linter({
		fix: autoFix,
		formatter: 'stylish',
	});

	const exitCodes = await Promise.all(
		files.map(async (file) => {
			let source = await read(file);
			const previousFixCount = linter.getResult().fixes?.length ?? 0;
			linter.lint(
				file,
				source,
				config as tslint.Configuration.IConfigurationFile,
			);
			if (prettier) {
				const afterFixCount = linter.getResult().fixes?.length ?? 0;
				if (previousFixCount !== afterFixCount) {
					// If fixes were applied they were written directly to the file and we need to read it again
					source = await read(file);
				}

				if (autoFix) {
					const newSource = prettier.format(source, prettierConfig);
					if (source !== newSource) {
						source = newSource;
						await fs.writeFile(file, source);
					}
				} else {
					const isPrettified = prettier.check(source, prettierConfig);
					if (!isPrettified) {
						console.log(
							`Error: File ${file} hasn't been formatted with prettier`,
						);
						return 1;
					}
				}
			}
			return 0;
		}),
	);
	const failureCode = exitCodes.find((exitCode) => exitCode !== 0);
	if (failureCode) {
		return failureCode;
	}

	const errorReport = linter.getResult();

	// Print the linter results
	console.log(linter.getResult().output);

	return errorReport.errorCount === 0 ? 0 : 1;
};

const lintMochaTestFiles = async function (files: string[]): Promise<number> {
	const { lintMochaTests } = await import('./mocha-tests-lint');
	const res = await lintMochaTests(files);
	if (res.isError) {
		console.error('Mocha tests check FAILED!');
		console.error(res.message);
		return 1;
	}
	return 0;
};

const runLint = async function (
	lintConfig: LintConfig,
	paths: string[],
	config: {},
	autoFix: boolean,
) {
	let linterExitCode: number | undefined;
	const scripts = await findFiles(lintConfig.extensions, paths);

	if (lintConfig.lang === 'typescript') {
		let prettierConfig: PrettierOptions | undefined;
		if (lintConfig.prettierCheck) {
			prettierConfig = (await parseJSON(prettierConfigPath)) as PrettierOptions;
			prettierConfig.parser = 'typescript';
		}

		linterExitCode = await lintTsFiles(
			scripts,
			config,
			prettierConfig,
			autoFix,
		);
	}

	if (lintConfig.lang === 'coffeescript') {
		linterExitCode = await lintCoffeeFiles(scripts, config);
	}

	if (lintConfig.testsCheck) {
		const testsExitCode = await lintMochaTestFiles(scripts);
		if (linterExitCode === 0) {
			linterExitCode = testsExitCode;
		}
	}

	process.on('exit', () => process.exit(linterExitCode));
};

export const lint = async (passedParams: any) => {
	const options = optimist(passedParams)
		.usage('Usage: balena-lint [options] [...]')
		.describe(
			'f',
			'Specify a linting config file to extend and override balena-lint rules',
		)
		.describe('p', 'Print default balena-lint linting rules')
		.describe(
			'i',
			'Ignore linting config files in project directory and its parents',
		)
		.describe('e', 'Override extensions to check, eg "-e js -e jsx"')
		.boolean('typescript', 'Lint typescript files instead of coffeescript')
		.boolean('fix', 'Attempt to automatically fix lint errors')
		.boolean('no-prettier', 'Disables the prettier code format checks')
		.boolean(
			'tests',
			'Treat input files as test sources to perform extra relevant checks',
		)
		.boolean('u', 'Run unused import check');

	if (options.argv._.length < 1 && !options.argv.p) {
		options.showHelp();
		process.exit(1);
	}

	if (options.argv.u) {
		const depcheck = await import('depcheck');
		await Promise.all(
			options.argv._.map(async (dir: string) => {
				dir = await getPackageJsonDir(dir);
				const { dependencies } = await depcheck(path.resolve('./', dir), {
					ignoreMatches: [
						'@types/*', // ignore typescript type declarations
						'supervisor', // isn't used directly from source
						'coffee-script', // Gives false positives
						'coffeescript', // An alias
						'colors', // Generally imported via colors/safe, which doesn't trigger depcheck
						'coffeescope2',
					],
				});
				if (dependencies.length > 0) {
					console.log(`${dependencies.length} unused dependencies:`);
					for (const dep of dependencies) {
						console.log(`\t${dep}`);
					}
					process.exit(1);
				}
				console.log('No unused dependencies!');
				console.log();
			}),
		);
	}

	let configOverridePath;
	// optimist converts all --no-xyz args to a argv.xyz === false
	const prettierCheck = options.argv.prettier !== false;
	const testsCheck = options.argv.tests === true;
	const typescriptCheck = options.argv.typescript;
	const autoFix = options.argv.fix === true;
	const lintConfiguration = typescriptCheck
		? prettierCheck
			? configurations.typescriptPrettier
			: configurations.typescript
		: configurations.coffeescript;

	if (options.argv.e) {
		lintConfiguration.extensions = Array.isArray(options.argv.e)
			? options.argv.e
			: [options.argv.e];
	}

	if (options.argv.p) {
		console.log(await fs.readFile(lintConfiguration.configPath, 'utf8'));
		process.exit(0);
	}

	// TSLint config needs to be loaded with `loadConfigurationFromPath`
	// Coffeelint needs to be loaded as a plain file
	let config: {} = typescriptCheck
		? tslint.Configuration.loadConfigurationFromPath(
				lintConfiguration.configPath,
		  )
		: await parseJSON(lintConfiguration.configPath);

	if (options.argv.f) {
		configOverridePath = await fs.realpath(options.argv.f);
	}

	if (!options.argv.i && !configOverridePath) {
		configOverridePath = await findFile(lintConfiguration.configFileName);
	}

	if (configOverridePath) {
		// Extend/override default config
		if (typescriptCheck) {
			const configOverride = tslint.Configuration.loadConfigurationFromPath(
				configOverridePath,
			);
			config = tslint.Configuration.extendConfigurationFile(
				config as tslint.Configuration.IConfigurationFile,
				configOverride,
			);
		} else {
			const configOverride = await parseJSON(configOverridePath);
			const { merge } = await import('lodash');
			config = merge(config, configOverride);
		}
	}

	const paths = options.argv._;

	lintConfiguration.prettierCheck = prettierCheck;
	lintConfiguration.testsCheck = testsCheck;
	await runLint(lintConfiguration, paths, config, autoFix);
};
