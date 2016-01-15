#!/usr/bin/env node

import parseArgs from 'minimist';
import { inspect } from 'util';
import { readFileSync } from 'fs';
import run from './index';
import SauceLabsProvider from './wd-providers/saucelabs';

const args = parseArgs(process.argv.slice(2));

const defaultConfig = {
  provider: SauceLabsProvider,
  code: 'var x = 3; window.__results__.push(window.navigator.userAgent);',
  browsers: [{
    displayName: 'Google Chrome',
    name: 'chrome',
    version: '46',
    os: 'Windows',
    osVersion: '7'
  }]
};

const config = {
  credentials: {
    userName: args.user || args.u,
    accessToken: args.token || args.t
  },
  browsers: (args.browsers || args.b) ?
    JSON.parse(readFileSync(args.browsers || args.b).toString()) :
    defaultConfig.browsers,
  code: args.code || args.c || defaultConfig.code,
  url: args.code || args.s || void 0,
  provider: args.provider || args.p || defaultConfig.provider,
  verbose: true,
  timeout: (args.code || args.s) ? 2000 : 1000
};

run(config).then(
  (results) => (console.log(inspect(results, { depth: 10 })), process.exit(0)),
  (err) => (console.error(err), process.exit(1))
);
