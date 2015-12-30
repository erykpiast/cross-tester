#!/usr/bin/env node
'use strict';

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _util = require('util');

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var args = (0, _minimist2.default)(process.argv.slice(2));

var defaultConfig = {
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

var config = {
  credentials: {
    userName: args.user || args.u,
    accessToken: args.token || args.t
  },
  browsers: args.code || args.b ? JSON.parse(args.code || args.b) : defaultConfig.browsers,
  code: args.code || args.c || defaultConfig.code,
  provider: args.provider || args.p || defaultConfig.provider
};

(0, _index2.default)(config).then(function (results) {
  return console.log((0, _util.inspect)(results, { depth: 10 })), process.exit(0);
}, function (err) {
  return console.error(err), process.exit(1);
});