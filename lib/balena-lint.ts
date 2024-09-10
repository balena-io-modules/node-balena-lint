// Tell typescript-eslint that this is a single run
process.env.TSESTREE_SINGLE_RUN = 'true';

import * as prettier from 'prettier';
import { promises as fs } from 'fs';
import { glob } from 'glob';
import yargs from 'yargs';
import * as path from 'path';
import type { Linter } from 'eslint';
import { ESLint } from 'eslint';

const exists = async (filename: string) => {
	try {
		await fs.access(filename);
		return true;
	} catch {
		return false;
	}
};

interface LintConfig {
	configPath: string;
	configFileName: string;
	extensions: string[];
}

const lintConfiguration: LintConfig = {
	configPath: path.join(__dirname, '../config/eslint.config.js'),
	configFileName: 'eslint.config.js',
	extensions: ['ts', 'tsx'],
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

const findFile = async (
	name: string,
	dir: string = process.cwd(),
): Promise<string | null> => {
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

const parseJSON = async (file: string): Promise<object> => {
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
				files.push(...(await glob(`${p}/**/*.@(${extensions.join('|')})`)));
			} else {
				files.push(p);
			}
		}),
	);

	return files.map((p) => path.join(p));
};

type ESLintOptions = ESLint.Options & {
	baseConfig: Linter.Config;
};

const lintTsFiles = async function (
	files: string[],
	config: ESLintOptions,
	prettierConfig: prettier.Options | undefined,
): Promise<number> {
	const linter = new ESLint(config);

	const totalResults: ESLint.LintResult[] = await linter.lintFiles(files);
	if (config.fix) {
		await ESLint.outputFixes(totalResults);
	}
	if (totalResults.length > 0) {
		const formatter = await linter.loadFormatter('stylish');
		console.log(await formatter.format(totalResults));
	}

	const unformattedFiles: string[] = [];
	await Promise.all(
		files.map(async (file) => {
			const prettierConfigWithPath: prettier.Options = {
				...prettierConfig,
				// That's needed so that prettier can use the correct rules
				// based on the file extension.
				filepath: file,
			};

			const source = await read(file);
			if (config.fix) {
				const newSource = await prettier.format(source, prettierConfigWithPath);
				if (source !== newSource) {
					await fs.writeFile(file, newSource);
				}
			} else {
				const isPrettified = await prettier.check(
					source,
					prettierConfigWithPath,
				);
				if (!isPrettified) {
					unformattedFiles.push(file);
					console.log(
						`Error: File ${file} hasn't been formatted with prettier`,
					);
				}
			}
		}),
	);

	return totalResults.some((l) => l.errorCount > 0 || l.fatalErrorCount > 0) ||
		unformattedFiles.length > 0
		? 1
		: 0;
};

const runLint = async function (
	lintConfig: LintConfig,
	paths: string[],
	config: ESLintOptions,
) {
	const scripts = await findFiles(lintConfig.extensions, paths);

	const prettierConfig = (await parseJSON(
		prettierConfigPath,
	)) as prettier.Options;
	prettierConfig.parser = 'typescript';

	const linterExitCode = await lintTsFiles(scripts, config, prettierConfig);

	process.on('exit', () => process.exit(linterExitCode));
};

export const lint = async (passedParams: any) => {
	const options = yargs(passedParams)
		.usage('Usage: balena-lint [options] [...]')
		.option('f', {
			describe:
				'Specify a linting config file to extend and override balena-lint rules',
			type: 'string',
		})
		.option('p', {
			describe: 'Print default balena-lint linting rules',
			type: 'boolean',
		})
		.option('i', {
			describe:
				'Ignore linting config files in project directory and its parents',
			type: 'boolean',
		})
		.option('e', {
			describe: 'Override extensions to check, eg "-e js -e jsx"',
			type: 'string',
		})
		.option('fix', {
			describe: 'Attempt to automatically fix lint errors',
			type: 'boolean',
		})
		.option('t', {
			describe:
				'Path to a tsconfig.json file to enable lint rules that rely on type information',
			type: 'string',
		})
		.options('u', {
			describe: 'Run unused import check',
			type: 'boolean',
		});

	const argv = await options.argv;

	if (argv._.length < 1 && !argv.p) {
		options.showHelp();
		process.exit(1);
	}

	if (argv.u) {
		const depcheck = await import('depcheck');
		await Promise.all(
			argv._.map(async (dir) => {
				dir = await getPackageJsonDir(`${dir}`);
				const { dependencies } = await depcheck(path.resolve('./', dir), {
					ignoreMatches: [
						'@types/*', // ignore typescript type declarations
						'supervisor', // isn't used directly from source
						'colors', // Generally imported via colors/safe, which doesn't trigger depcheck
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

	if (argv.e) {
		lintConfiguration.extensions = Array.isArray(argv.e) ? argv.e : [argv.e];
	}

	if (argv.p) {
		console.log(await fs.readFile(lintConfiguration.configPath, 'utf8'));
		process.exit(0);
	}

	const baseConfig: Linter.Config | Linter.Config[] = await import(
		lintConfiguration.configPath
	);

	const lintOptions: ESLintOptions = {
		baseConfig,
		fix: argv.fix === true,
		overrideConfig: {
			linterOptions: {
				reportUnusedDisableDirectives: 'error',
			},
		},
	};
	if (argv.f) {
		lintOptions.overrideConfigFile = await fs.realpath(argv.f);
	}

	if (!argv.i && !lintOptions.overrideConfigFile) {
		lintOptions.overrideConfigFile =
			(await findFile(lintConfiguration.configFileName)) ?? true;
	}

	if (argv.t) {
		lintOptions.overrideConfig = {
			languageOptions: {
				parserOptions: {
					project: argv.t,
				},
			},
		};
	}

	const paths: string[] = argv._.map((element: any) => {
		return element.toString();
	});

	await runLint(lintConfiguration, paths, lintOptions);
};
