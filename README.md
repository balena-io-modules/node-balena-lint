@balena/lint
==========

`@balena/lint` is a linter & formatter based on [eslint](https://eslint.org/) and [prettier](https://github.com/prettier/prettier) to detect style errors based on balena.io coding guidelines.

Overview
--------

`@balena/lint` uses balena's `config/eslint.config.js` and `config/.prettierrc`.
If an `eslint.config.js` is found in the current directory or its parents then
the config in it will be merged with the default `@balena/lint` one.
Another way to override the default balena lint rules is by specifying a configuration
file with the `-f` parameter.

## Files checked

By default`.ts` and `.tsx` files are linted. You can also specify additional file extensions to be parse by using the -e option.
Eg: "-e js -e jsx"

## Prettier

You can reference the prettier configuration file to your consumer project
from `./config/.prettierrc`.

Usage
-----

You can use this module as:

1. A standalone project by installing it with `npm install -g @balena/lint`:

  ```
  kostas@macbook:~/balena/test$ balena-lint src/
    ✓ src/test.ts

    ✓ Ok! » 0 errors and 0 warnings in 1 file
  ```

2. A development dependency in `package.json` with ```npm install --save-dev @balena/lint```. Then
  you can use the module in your build/testing process:

  ```
  package.json
  ------------
  ...
  "scripts": {
    "lint": "balena-lint src/ && echo \"Done!\""
  },
  ...

  kostas@macbook:~/balena/test$ npm run lint

  > test@1.0.0 lint /Users/kostas/balena/test
  > balena-lint src/ && echo "Done!"

    ✓ src/test.ts

    ✓ Ok! » 0 errors and 0 warnings in 1 file

    Done!

  ```

3. A development dependency, that will get picked up by your IDE/Editor eslint/prettier.

**Recommended**: Configure your plugins to use the `@balena/lint/config/eslint.config.js` / `@balena/lint/config/.prettierrc` files directly

**Not Recommended**: Manually create these config files in your project root:

`eslint.config.js`

```js
import balenaLint from '@balena/lint/config/eslint.config.js';

export default [
	...balenaLint,
	// Your overrides
];
```

In a CommonJS project, use `module.exports = require('@balena/lint/config/eslint.config.js').default;` instead.

For prettier config create `.prettierrc.mjs`

```js
import fs from 'fs';

export default JSON.parse(fs.readFileSync(new URL(import.meta.resolve('@balena/lint/config/.prettierrc')), 'utf8'));
```

Rules that require type information
-----------------------------------

Some linting rules such as `@typescript-eslint/no-floating-promises` require Typescript type information.
By default the `tsconfig.json` in the current directory is used. Use the `-t` option to point
to a different `tsconfig.json` file. Every linted file must be included by that `tsconfig.json`.

Support
-------

If you're having any problem, please [raise an issue](https://github.com/balena-io-modules/node-balena-lint/issues/new) on GitHub and the balena.io team will be happy to help.

Tests
-----

Run the test suite by doing:

```sh
$ npm install && npm test
```

Contribute
----------

- Issue Tracker: [github.com/balena-io-modules/node-balena-lint/issues](https://github.com/balena-io-modules/node-balena-lint/issues)
- Source Code: [github.com/balena-io-modules/node-balena-lint](https://github.com/balena-io-modules/node-balena-lint)

Before submitting a PR, please make sure that you include tests, and that `npm run lint` runs without a warning.

License
-------

The project is licensed under the Apache 2.0 license.
