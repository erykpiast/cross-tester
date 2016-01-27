#!/usr/bin/env node

import parseArgs from 'minimist';
import { inspect } from 'util';
import { readFileSync } from 'fs';
import run from './index';
import SauceLabsProvider from './wd-providers/saucelabs';
import BrowserStackProvider from './wd-providers/browserstack';

const providers = {
  [SauceLabsProvider.name]: SauceLabsProvider,
  [BrowserStackProvider.name]: BrowserStackProvider
};

const args = parseArgs(process.argv.slice(2));

const defaultConfig = {
  provider: SauceLabsProvider,
  code: 'var x = 3; window.__results__.push(window.navigator.userAgent); console.log("some log"); console.warn("some warning"); console.error("some error")',
  browsers: [{
    displayName: 'Google Chrome',
    name: 'chrome',
    version: '46',
    os: 'windows',
    osVersion: '7'
  }, {
    displayName: 'Google Chrome on Mac',
    name: 'chrome',
    version: '46',
    os: 'os x',
    osVersion: '10.10'
  }, {
    displayName: 'Mozilla Firefox',
    name: 'firefox',
    version: '42',
    os: 'windows',
    osVersion: '7'
  }, {
    displayName: 'Mozilla Firefox on Mac',
    name: 'firefox',
    version: '42',
    os: 'os x',
    osVersion: '10.10'
  }, {
    displayName: 'Safari Desktop',
    name: 'safari',
    version: '9',
    os: 'os x',
    osVersion: '10.11'
  }, {
    displayName: 'Internet Explorer',
    name: 'internet explorer',
    version: '11',
    os: 'windows',
    osVersion: '8.1'
  }, {
    displayName: 'MS Edge',
    name: 'edge',
    // take the only available version in SL and BS; it's behavior specific for
    // Microsoft Edge
    version: undefined,
    os: 'windows',
    osVersion: '10'
  }, {
    displayName: 'Android Browser',
    name: 'android browser',
    version: '5.0',
    os: 'android',
    osVersion: '5'
  }, {
    displayName: 'Android Browser Old',
    name: 'android browser',
    version: '4.4',
    os: 'android',
    osVersion: '4.4'
  }, {
    displayName: 'iPhone Safari',
    name: 'safari mobile',
    version: '9.0',
    os: 'ios',
    osVersion: '9.0',
    device: 'iphone'
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
  url: args.url || args.s || void 0,
  Provider: (args.provider || args.p) ? providers[(args.provider || args.p)] : defaultConfig.provider,
  verbose: true,
  timeout: (args.url || args.s) ? 2000 : 1000
};

run(config).then(
  (results) => (console.log(inspect(results, { depth: 10 })), process.exit(0)),
  (err) => (console.error(err), process.exit(1))
);
