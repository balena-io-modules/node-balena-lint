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
	"extends": [
		"./.eslintrc.js",
		"prettier"
	],
	"rules": {
		"@typescript-eslint/indent": "off",
		"@typescript-eslint/member-delimiter-style": [
			"off",
			{
				"multiline": {
					"delimiter": "none",
					"requireLast": true
				},
				"singleline": {
					"delimiter": "semi",
					"requireLast": false
				}
			}
		],
		"@typescript-eslint/no-unused-expressions": "error",
		"@typescript-eslint/quotes": "off",
		"@typescript-eslint/semi": [
			"off",
			null
		],
		"@typescript-eslint/type-annotation-spacing": "off",
		"brace-style": [
			"off",
			"off"
		],
		"comma-dangle": "off",
		"eol-last": "off",
		"linebreak-style": "off",
		"max-len": "off",
		"new-parens": "off",
		"newline-per-chained-call": "off",
		"no-extra-semi": "off",
		"no-irregular-whitespace": "off",
		"no-multiple-empty-lines": "off",
		"no-trailing-spaces": "off",
		"padded-blocks": [
			"off",
			{
				"blocks": "never"
			},
			{
				"allowSingleLineBlocks": true
			}
		],
		"quote-props": "off",
		"react/jsx-curly-spacing": "off",
		"react/jsx-equals-spacing": "off",
		"react/jsx-tag-spacing": [
			"off",
			{
				"afterOpening": "allow",
				"closingSlash": "allow"
			}
		],
		"react/jsx-wrap-multilines": "off",
		"semi": "off",
		"space-before-function-paren": "off",
		"space-in-parens": [
			"off",
			"never"
		]
	}
};
