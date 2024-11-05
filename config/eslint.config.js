/* eslint-disable @typescript-eslint/no-require-imports */
const jsdoc = require('eslint-plugin-jsdoc');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
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
	react.configs.flat.recommended,
	prettier,
	{
		plugins: {
			jsdoc,
			typescriptEslint,
			'no-only-tests': noOnlyTests,
			chaiFriendly,
			'react-hooks': reactHooks,
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
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
		rules: {
			...reactHooks.configs.recommended.rules,
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
			'jsdoc/check-alignment': 'error',
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
			'no-only-tests/no-only-tests': 'error',
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

			'@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
			'@typescript-eslint/no-extraneous-class': 'error',
			'@typescript-eslint/no-useless-constructor': 'error',
			'@typescript-eslint/prefer-literal-enum-member': 'error',
			'@typescript-eslint/no-invalid-void-type': 'error',

			'@typescript-eslint/no-duplicate-type-constituents': 'error',
			'@typescript-eslint/no-for-in-array': 'error',
			'@typescript-eslint/no-implied-eval': 'error',
			'@typescript-eslint/require-await': 'error',
			'@typescript-eslint/await-thenable': 'error',
			'@typescript-eslint/no-unnecessary-type-assertion': 'error',
			'@typescript-eslint/no-redundant-type-constituents': 'error',

			'@typescript-eslint/no-array-delete': 'error',
			'@typescript-eslint/no-meaningless-void-operator': 'error',
			'@typescript-eslint/no-mixed-enums': 'error',
			'@typescript-eslint/no-unnecessary-template-expression': 'error',
			'@typescript-eslint/no-unnecessary-type-arguments': 'error',
			'@typescript-eslint/only-throw-error': 'error',
			'@typescript-eslint/prefer-includes': 'error',
			'@typescript-eslint/prefer-promise-reject-errors': 'error',
			'@typescript-eslint/prefer-reduce-type-parameter': 'error',
			'@typescript-eslint/prefer-return-this-type': 'error',
			'@typescript-eslint/no-confusing-void-expression': 'error',
			'@typescript-eslint/restrict-plus-operands': 'error',

			'@typescript-eslint/consistent-generic-constructors': 'error',
			'@typescript-eslint/no-confusing-non-null-assertion': 'error',
			'@typescript-eslint/prefer-string-starts-ends-with': 'error',
			'@typescript-eslint/no-inferrable-types': 'error',
			'@typescript-eslint/prefer-nullish-coalescing': 'error',
			'@typescript-eslint/class-literal-property-style': 'error',
			'@typescript-eslint/prefer-optional-chain': 'error',
			'@typescript-eslint/non-nullable-type-assertion-style': 'error',

			// This causes a lot of false positives with `expect().to.be.x;` currently
			'@typescript-eslint/no-unused-expressions': 'off',
		},
	},
);
