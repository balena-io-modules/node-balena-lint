import { promises as fs } from 'fs';

// Mocha tests linter results.
// When isError is set to true, the message contains details about found errors.
export class MochaListResult {
	constructor(
		public readonly message: string,
		public readonly isError: boolean,
	) {}
}

const checkPattern = /(describe|it)\.only/;

// Check if files in the test directory don't contain describe.only or it.only statements
// to ensure that an accidental commit does not prevent all the tests from running.
export async function lintMochaTests(
	scripts: string[],
): Promise<MochaListResult> {
	let errorsFound = false;
	let message = '';

	const allCheckPromises = scripts.map(async (scriptPath) => {
		const content = await fs.readFile(scriptPath, 'utf8');
		const lines = content.split('\n');
		for (let ln = 0; ln < lines.length; ln++) {
			const res = checkPattern.exec(lines[ln]);
			if (res) {
				errorsFound = true;
				message += `File ${scriptPath}, line ${ln}: found ${res[0]}\n`;
			}
		}
	});

	try {
		await Promise.all(allCheckPromises);
		return new MochaListResult(errorsFound ? message : 'OK', errorsFound);
	} catch (e) {
		console.error(e);
		return new MochaListResult(`Error reading input files: ${e.message}`, true);
	}
}
