#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const args = process.argv.slice(2);
const { Plop, run } = require('plop');
const argv = require('minimist')(args);
const { cwd, completion } = argv;

Plop.launch(
  {
    cwd,
    // In order for `plop` to always pick up the `plopfile.js` despite the CWD, you must use `__dirname`
    configPath: path.join(__dirname, '../plopfile.js'),
    require: argv.require,
    completion
    // This will merge the `plop` argv and the generator argv.
    // This means that you don't need to use `--` anymore
  },
  (env) => {
    const options = {
      ...env,
      dest: process.cwd()
    };

    return run(options, undefined, true);
  }
);
