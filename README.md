resin-lint
==========

`resin-lint` is a linter based on [coffeelint](https://github.com/clutchski/coffeelint),
[coffeescope2](https://github.com/za-creature/coffeescope), [tslint](https://palantir.github.io/tslint/) and [prettier](https://github.com/prettier/prettier) to detect style errors based on Resin.io coding guidelines.

Overview
--------

`resin-lint` uses Resin's `coffeelint.json`, `tslint.json` and `.prettierrc`.
If a `coffeelint.json` or `tslint.json` is found in the to-be-linted project
directory or its parents then the rules found in it will be merged with the default `resin-lint` ones.
Another way to to override the default resin-lint rules is by specifying a configuration
file with the `-f` parameter.

## Typescript

By default, only `.coffee` files will be linted. `.ts` and `.tsx` files can be
linted by using the `--typescript` parameter.

## Prettier

You can reference the prettier configuration file to your consumer project
from `./config/.prettierrc`.
You can disable the prettier format checks by using the `--no-prettier` parameter.

Usage
-----

You can use this module as:

1. A standalone project by installing it with `npm install -g resin-lint`:

  ```
  kostas@macbook:~/resin/test$ resin-lint src/
    ✓ src/test.coffee

    ✓ Ok! » 0 errors and 0 warnings in 1 file
  ```

2. A development dependency in `package.json` with ```npm install --save-dev resin-lint```. Then
  you can use the module in your build/testing process:

  ```
  package.json
  ------------
  ...
  "scripts": {
    "lint": "resin-lint src/ && echo \"Done!\""
  },
  ...

  kostas@macbook:~/resin/test$ npm run lint

  > test@1.0.0 lint /Users/kostas/resin/test
  > resin-lint src/ && echo "Done!"

    ✓ src/test.coffee

    ✓ Ok! » 0 errors and 0 warnings in 1 file

    Done!

  ```

3. A development dependency, that will get picked up by your IDE/Editor coffeelint/tslint/prettier.

Manually create these config files in your project root:

`tslint.json`

```json
// if using prettier in your project
{
	"extends": [
		"resin-lint/config/tslint-prettier.json"
	]
}

// plain TypeScript
{
	"extends": [
		"resin-lint/config/tslint.json"
	]
}
```

For coffeelint create `coffeelint.json`

```json
{
	"extends": [
		"resin-lint/config/coffeelint.json"
	]
}
```

For prettier config create `.prettierrc.js`

```js
const fs = require('fs');

module.exports = JSON.parse(fs.readFileSync('./node_modules/resin-lint/config/.prettierrc', 'utf8'));
```

Support
-------

If you're having any problem, please [raise an issue](https://github.com/resin-io/node-resin-lint/issues/new) on GitHub and the Resin.io team will be happy to help.

Tests
-----

Run the test suite by doing:

```sh
$ npm install && npm test
```

Contribute
----------

- Issue Tracker: [github.com/resin-io/node-resin-lint/issues](https://github.com/resin-io/node-resin-lint/issues)
- Source Code: [github.com/resin-io/node-resin-lint](https://github.com/resin-io/node-resin-lint)

Before submitting a PR, please make sure that you include tests, and that `npm run lint` runs without a warning.

License
-------

The project is licensed under the Apache 2.0 license.
