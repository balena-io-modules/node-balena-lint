resin-lint
==========

`resin-lint` is a linter based on the [coffeelint](https://github.com/clutchski/coffeelint) API that
detects style errors based on Resin.io coding guidelines.

Overview
--------

`resin-lint` uses Resin's `coffeelint.json`. If a `coffeelint.json` is found in the to-be-linted project
directory or its parents then the rules found in it will override the default `resin-lint` ones.
Another way to to override the default resin-lint rules is by specifying a coffeelint configuration
file with the `-f` parameter.

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

Support
-------

If you're having any problem, please [raise an issue](https://github.com/resin-io/resin-lint/issues/new) on GitHub and the Resin.io team will be happy to help.

Tests
-----

Run the test suite by doing:

```sh
$ npm install && npm test
```

Contribute
----------

- Issue Tracker: [github.com/resin-io/resin-lint/issues](https://github.com/resin-io/resin-lint/issues)
- Source Code: [github.com/resin-io/resin-lint](https://github.com/resin-io/resin-lint)

Before submitting a PR, please make sure that you include tests, and that `npm run lint` runs without a warning.

License
-------

The project is licensed under the Apache 2.0 license.
