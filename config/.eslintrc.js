module.exports = {
	"env": {
		"browser": true,
		"es6": true,
		"node": true
	},
	"parser": "@typescript-eslint/parser",
	"parserOptions": {
		"project": "tsconfig.json",
		"sourceType": "module"
	},
	"plugins": [
		"eslint-plugin-jsdoc",
		"eslint-plugin-react",
		"@typescript-eslint",
		"chai-friendly"
	],
	"extends": [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended"
	],
	"rules": {
		"@typescript-eslint/adjacent-overload-signatures": "error",
		"@typescript-eslint/array-type": [
			"error",
			{
				"default": "array-simple"
			}
		],
		"@typescript-eslint/ban-ts-comment": [
			"error",
			{
				"ts-expect-error": "allow-with-description"
			}
		],
		"@typescript-eslint/consistent-type-assertions": "error",
		"@typescript-eslint/indent": [
			"error",
			"tab"
		],
		"@typescript-eslint/naming-convention": [
			"error",
			{
				"selector": "variable",
				"format": [
					"camelCase",
					"UPPER_CASE",
					"PascalCase"
				],
				"leadingUnderscore": "allow",
				"trailingUnderscore": "forbid"
			}
		],
		"@typescript-eslint/no-empty-function": "error",
		"@typescript-eslint/no-empty-interface": "error",
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/no-floating-promises": "error",
		"@typescript-eslint/no-misused-new": "error",
		"@typescript-eslint/no-shadow": [
			"error",
			{
				"hoist": "all"
			}
		],
		"@typescript-eslint/no-unused-expressions": "off",
		"@typescript-eslint/prefer-for-of": "error",
		"@typescript-eslint/prefer-function-type": "error",
		"@typescript-eslint/prefer-namespace-keyword": "error",
		"@typescript-eslint/quotes": [
			"error",
			"single",
			{
				"avoidEscape": true
			}
		],
		"@typescript-eslint/triple-slash-reference": [
			"error",
			{
				"path": "always",
				"types": "prefer-import",
				"lib": "always"
			}
		],
		"@typescript-eslint/unified-signatures": "error",
		"arrow-parens": [
			"off",
			"always"
		],
		"constructor-super": "error",
		"curly": "error",
		"eqeqeq": ["error", "always", {"null": "ignore"}],
		"guard-for-in": "error",
		"id-denylist": [
			"error",
			"any",
			"Number",
			"number",
			"String",
			"string",
			"Boolean",
			"boolean",
			"Undefined",
			"undefined"
		],
		"id-match": "error",
		"indent": "off",
		"jsdoc/check-alignment": "error",
		"new-parens": "error",
		"no-bitwise": "error",
		"no-caller": "error",
		"no-cond-assign": "error",
		"no-debugger": "error",
		"no-empty": "error",
		"no-empty-function": "off",
		"no-eval": "error",
		"no-fallthrough": [
			"error",
			{
				"allowEmptyCase": true,
				"commentPattern": "break[\\s\\w]*omitted"
			}
		],
		"no-new-wrappers": "error",
		"no-shadow": "off",
		"no-throw-literal": "error",
		"no-trailing-spaces": "error",
		"no-unused-expressions": "off",
		"no-var": "error",
		"one-var": [
			"error",
			"never"
		],
		"prefer-const": "error",
		"quotes": "off",
		"radix": "error",
		"spaced-comment": [
			"error",
			"always",
			{
				"markers": [
					"/"
				]
			}
		]
	}
};
