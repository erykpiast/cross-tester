#!/usr/bin/env node

import parseArgs from 'minimist';
import { inspect } from 'util';
import run from './index';

const args = parseArgs(process.argv.slice(2));

const defaultConfig = {
  provider: 'saucelabs',
  code: 'var x = 3; window.__results__.push(window.navigator.userAgent);',
  browsers: {
    'Google Chrome': {
      browserName: 'Chrome',
      versions: {
        latest: '46'
      },
      platform: 'Windows',
      osVersion: '10'
    },
    'Mozilla Firefox': {
      browserName: 'Firefox',
      versions: {
        latest: '42'
      },
      platform: 'Linux'
    },
    'Microsoft Internet Explorer': {
      browserName: 'internet explorer',
      versions: {
        latest: '11'
      },
      platform: 'Windows',
      osVersion: '10'
    },
    'Apple Safari': {
      browserName: 'Safari',
      versions: {
        latest: '9'
      },
      platform: 'OS X',
      osVersion: '10.11'
    },
    'Microsoft Edge': {
      browserName: 'MicrosoftEdge',
      versions: {
        latest: '20'
      },
      platform: 'Windows',
      osVersion: '10'
    }
  }
};

const config = {
  credentials: {
    userName: args.user || args.u,
    accessToken: args.token || args.t
  },
  browsers: (args.code || args.b) ?
    JSON.parse((args.code || args.b)) :
    defaultConfig.browsers,
  code: args.code || args.c || defaultConfig.code,
  provider: args.provider || args.p || defaultConfig.provider
};

run(config).then(
  (results) => (console.log(inspect(results, { depth: 10 })), process.exit(0)),
  (err) => (console.error(err), process.exit(1))
);