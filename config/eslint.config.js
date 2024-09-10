/* eslint-disable @typescript-eslint/no-require-imports */
const jsdoc = require('eslint-plugin-jsdoc');
const react = require('eslint-plugin-react');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const noOnlyTests = require('eslint-plugin-no-only-tests');
const chaiFriendly = require('eslint-plugin-chai-friendly');
const globals = require('globals');
const tsParser = require('@typescript-eslint/parser');
const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
	js.configs.recommended,
	...tseslint.configs.recommended,
	chaiFriendly.configs.recommendedFlat,
	prettier,
	{
		plugins: {
			jsdoc,
			react,
			typescriptEslint,
			noOnlyTests,
			chaiFriendly,
		},
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},

			parser: tsParser,
			ecmaVersion: 5,
			sourceType: 'module',

			parserOptions: {
				project: 'tsconfig.json',
			},
		},
		rules: {
			'@typescript-eslint/adjacent-overload-signatures': 'error',
			'@typescript-eslint/array-type': [
				'error',
				{
					default: 'array-simple',
				},
			],
			'@typescript-eslint/ban-ts-comment': [
				'error',
				{
					'ts-expect-error': 'allow-with-description',
				},
			],
			'@typescript-eslint/consistent-type-assertions': 'error',
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{
					disallowTypeAnnotations: false,
				},
			],
			'@typescript-eslint/naming-convention': [
				'error',
				{
					selector: 'variable',
					format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
					leadingUnderscore: 'allow',
					trailingUnderscore: 'forbid',
				},
				{
					selector: 'variable',
					modifiers: ['destructured'],
					format: null,
				},
			],
			'@typescript-eslint/no-empty-function': 'error',
			'@typescript-eslint/no-empty-interface': 'error',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-floating-promises': [
				'error',
				{ ignoreVoid: true },
			],
			'@typescript-eslint/no-shadow': [
				'error',
				{
					hoist: 'all',
				},
			],
			'@typescript-eslint/no-this-alias': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					// Ideally we would want to block trailing unused destructured vars
					// similarly to how `"args": "after-used"` works, but this isn't supported at.
					destructuredArrayIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			],
			'@typescript-eslint/prefer-for-of': 'error',
			'@typescript-eslint/prefer-function-type': 'error',
			'@typescript-eslint/prefer-namespace-keyword': 'error',
			'@typescript-eslint/triple-slash-reference': [
				'error',
				{
					path: 'always',
					types: 'prefer-import',
					lib: 'always',
				},
			],
			'constructor-super': 'error',
			curly: 'error',
			eqeqeq: ['error', 'always', { null: 'ignore' }],
			'guard-for-in': 'error',
			'id-denylist': [
				'error',
				'any',
				'Number',
				'number',
				'String',
				'string',
				'Boolean',
				'boolean',
				'Undefined',
				'undefined',
			],
			'id-match': 'error',
			indent: 'off',
			// 'jsdoc/check-alignment': 'error',
			'new-parens': 'error',
			'no-bitwise': 'error',
			'no-caller': 'error',
			'no-cond-assign': 'error',
			'no-constant-binary-expression': 'error',
			'no-debugger': 'error',
			'no-empty': 'error',
			'no-empty-function': 'off',
			'no-eval': 'error',
			'no-fallthrough': [
				'error',
				{
					allowEmptyCase: true,
					commentPattern: 'break[\\s\\w]*omitted',
				},
			],
			'no-new-wrappers': 'error',
			// 'no-only-tests/no-only-tests': 'error',
			'no-shadow': 'off',
			'no-throw-literal': 'error',
			'no-unused-expressions': 'off',
			'no-var': 'error',
			'one-var': ['error', 'never'],
			'prefer-const': ['error', { destructuring: 'all' }],
			radix: 'error',
			'spaced-comment': [
				'error',
				'always',
				{
					markers: ['/'],
				},
			],

			'@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'warn',
			'@typescript-eslint/no-extraneous-class': 'warn',
			'@typescript-eslint/no-useless-constructor': 'warn',
			'@typescript-eslint/prefer-literal-enum-member': 'warn',
			'@typescript-eslint/no-invalid-void-type': 'warn',

			'@typescript-eslint/no-duplicate-type-constituents': 'warn',
			'@typescript-eslint/no-for-in-array': 'warn',
			'@typescript-eslint/no-implied-eval': 'warn',
			'@typescript-eslint/require-await': 'warn',
			'@typescript-eslint/await-thenable': 'warn',
			'@typescript-eslint/no-unnecessary-type-assertion': 'warn',
			'@typescript-eslint/no-redundant-type-constituents': 'warn',

			'@typescript-eslint/no-array-delete': 'warn',
			'@typescript-eslint/no-meaningless-void-operator': 'warn',
			'@typescript-eslint/no-mixed-enums': 'warn',
			'@typescript-eslint/no-unnecessary-template-expression': 'warn',
			'@typescript-eslint/no-unnecessary-type-arguments': 'warn',
			'@typescript-eslint/only-throw-error': 'warn',
			'@typescript-eslint/prefer-includes': 'warn',
			'@typescript-eslint/prefer-promise-reject-errors': 'warn',
			'@typescript-eslint/prefer-reduce-type-parameter': 'warn',
			'@typescript-eslint/prefer-return-this-type': 'warn',
			'@typescript-eslint/no-confusing-void-expression': 'warn',
			'@typescript-eslint/restrict-plus-operands': 'warn',

			'@typescript-eslint/consistent-generic-constructors': 'warn',
			'@typescript-eslint/no-confusing-non-null-assertion': 'warn',
			'@typescript-eslint/prefer-string-starts-ends-with': 'warn',
			'@typescript-eslint/no-inferrable-types': 'warn',
			'@typescript-eslint/prefer-nullish-coalescing': 'warn',
			'@typescript-eslint/class-literal-property-style': 'warn',
			'@typescript-eslint/prefer-optional-chain': 'warn',
			'@typescript-eslint/non-nullable-type-assertion-style': 'warn',

			// This causes a lot of false positives with `expect().to.be.x;` currently
			'@typescript-eslint/no-unused-expressions': 'off',
		},
	},
);
