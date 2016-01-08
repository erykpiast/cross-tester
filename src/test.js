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
      name: 'chrome',
      versions: {
        latest: '46'
      },
      os: 'Windows'
    },
    'Mozilla Firefox': {
      name: 'Firefox',
      versions: {
        latest: '42'
      },
      os: 'Windows'
    },
    'Microsoft Internet Explorer': {
      name: 'Internet Explorer',
      versions: {
        latest: '11',
        previous: '10',
        old: '9'
      },
      os: 'Windows'
    },
    'Apple Safari': {
      name: 'Safari',
      versions: {
        latest: '9',
        previous: '8',
        old: '7'
      },
      os: 'OS X'
    },
    'Microsoft Edge': {
      name: 'Microsoft Edge',
      versions: {
        latest: '20', // works in SL
        previous: '12' // works in BS
      },
      os: 'Windows'
    },
    'Safari Mobile': {
      name: 'Safari',
      versions: {
        latest: {
          osVersion: '8.3',
          devices: ['iPhone', 'iPad']
        },
        previous: {
          osVersion: '7.0',
          devices: ['iPhone', 'iPad']
        }
      },
      os: 'iOS'
    },
    'Android Browser': {
      name: 'Android Browser',
      versions: {
        'Lollipop': '5.0',
        'Jelly Bean': 'Jelly Bean'
      }
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
  url: args.code || args.s || void 0,
  provider: args.provider || args.p || defaultConfig.provider,
  verbose: true,
  timeout: (args.code || args.s) ? 2000 : 1000
};

run(config).then(
  (results) => (console.log(inspect(results, { depth: 10 })), process.exit(0)),
  (err) => (console.error(err), process.exit(1))
);
