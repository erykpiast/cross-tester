#!/usr/bin/env node
'use strict';

var _providers;

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _util = require('util');

var _fs = require('fs');

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _saucelabs = require('./wd-providers/saucelabs');

var _saucelabs2 = _interopRequireDefault(_saucelabs);

var _browserstack = require('./wd-providers/browserstack');

var _browserstack2 = _interopRequireDefault(_browserstack);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var providers = (_providers = {}, _defineProperty(_providers, _saucelabs2.default.name, _saucelabs2.default), _defineProperty(_providers, _browserstack2.default.name, _browserstack2.default), _providers);

var args = (0, _minimist2.default)(process.argv.slice(2));

var defaultConfig = {
  provider: _saucelabs2.default,
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
    displayName: 'Android Browser',
    name: 'android browser',
    version: '5.1',
    os: 'android',
    osVersion: '5.1'
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

var config = {
  credentials: {
    userName: args.user || args.u,
    accessToken: args.token || args.t
  },
  browsers: args.browsers || args.b ? JSON.parse((0, _fs.readFileSync)(args.browsers || args.b).toString()) : defaultConfig.browsers,
  code: args.code || args.c || defaultConfig.code,
  url: args.url || args.s || void 0,
  Provider: args.provider || args.p ? providers[args.provider || args.p] : defaultConfig.provider,
  verbose: true,
  timeout: args.url || args.s ? 2000 : 1000
};

(0, _index2.default)(config).then(function (results) {
  return console.log((0, _util.inspect)(results, { depth: 10 })), process.exit(0);
}, function (err) {
  return console.error(err), process.exit(1);
});