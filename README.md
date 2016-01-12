# resin-coffeelint

`resin-coffeelint` is a thin [coffeelint](https://github.com/clutchski/coffeelint) wrapper that
detects style errors based on Resin.io coding guidelines.

# Overview

`resin-coffeelint` simply invokes

```
coffeelint -f coffeelint.json
```

under the hood, using Resin's `coffeelint.json`. If a `-f` parameter is passed, the
internal `coffeelint.json` is overridden with the one specified.

# Usage

You can use this module as:

1. A standalone project by installing it with `npm install -g resin-coffeelint`:

```
kostas@macbook:~/resin/test$ resin-coffeelint src/
  ✓ src/test.coffee

  ✓ Ok! » 0 errors and 0 warnings in 1 file
```

2. A development dependency in `package.json` with ```npm install --save-dev resin-coffeelint```. Then
  you can use the module in your build/testing process:

```
package.json
------------
...
"scripts": {
  "lint": "resin-coffeelint src/ && echo \"Done!\""
},
...

kostas@macbook:~/resin/test$ npm run lint

> test@1.0.0 lint /Users/kostas/resin/test
> resin-coffeelint src/ && echo "Done!"

  ✓ src/test.coffee

  ✓ Ok! » 0 errors and 0 warnings in 1 file

  Done!

```

Support
-------

If you're having any problem, please [raise an issue](https://github.com/resin-io/resin-coffeelint/issues/new) on GitHub and the Resin.io team will be happy to help.

Tests
-----

Run the test suite by doing:

```sh
$ npm install && npm test
```

Contribute
----------

- Issue Tracker: [github.com/resin-io/resin-coffeelint/issues](https://github.com/resin-io/resin-coffeelint/issues)
- Source Code: [github.com/resin-io/resin-coffeelint](https://github.com/resin-io/resin-coffeelint)

Before submitting a PR, please make sure that you include tests, and that [coffeelint](http://www.coffeelint.org/) runs without any warning:

License
-------

The project is licensed under the MIT license.
