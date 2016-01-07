#!/usr/bin/env node
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = undefined;

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _util = require('util');

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var args = _get__('parseArgs')(process.argv.slice(2));

var defaultConfig = {
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

var config = {
  credentials: {
    userName: _get__('args').user || _get__('args').u,
    accessToken: _get__('args').token || _get__('args').t
  },
  browsers: args.code || args.b ? JSON.parse(args.code || args.b) : defaultConfig.browsers,
  code: args.code || args.c || defaultConfig.code,
  url: args.code || args.s || void 0,
  provider: args.provider || args.p || defaultConfig.provider,
  verbose: true,
  timeout: _get__('args').code || _get__('args').s ? 2000 : 1000
};

_get__('run')(_get__('config')).then(function (results) {
  return console.log(_get__('inspect')(results, { depth: 10 })), process.exit(0);
}, function (err) {
  return console.error(err), process.exit(1);
});
var _RewiredData__ = {};

function _get__(variableName) {
  return _RewiredData__ === undefined || _RewiredData__[variableName] === undefined ? _get_original__(variableName) : _RewiredData__[variableName];
}

function _get_original__(variableName) {
  switch (variableName) {
    case 'parseArgs':
      return _minimist2.default;

    case 'args':
      return args;

    case 'defaultConfig':
      return defaultConfig;

    case 'run':
      return _index2.default;

    case 'config':
      return config;

    case 'inspect':
      return _util.inspect;
  }

  return undefined;
}

function _assign__(variableName, value) {
  if (_RewiredData__ === undefined || _RewiredData__[variableName] === undefined) {
    return _set_original__(variableName, value);
  } else {
    return _RewiredData__[variableName] = value;
  }
}

function _set_original__(variableName, _value) {
  switch (variableName) {}

  return undefined;
}

function _update_operation__(operation, variableName, prefix) {
  var oldValue = _get__(variableName);

  var newValue = operation === '++' ? oldValue + 1 : oldValue - 1;

  _assign__(variableName, newValue);

  return prefix ? newValue : oldValue;
}

function _set__(variableName, value) {
  return _RewiredData__[variableName] = value;
}

function _reset__(variableName) {
  delete _RewiredData__[variableName];
}

function _with__(object) {
  var rewiredVariableNames = Object.keys(object);
  var previousValues = {};

  function reset() {
    rewiredVariableNames.forEach(function (variableName) {
      _RewiredData__[variableName] = previousValues[variableName];
    });
  }

  return function (callback) {
    rewiredVariableNames.forEach(function (variableName) {
      previousValues[variableName] = _RewiredData__[variableName];
      _RewiredData__[variableName] = object[variableName];
    });
    var result = callback();

    if (!!result && typeof result.then == 'function') {
      result.then(reset).catch(reset);
    } else {
      reset();
    }

    return result;
  };
}

var _RewireAPI__ = {};

(function () {
  function addPropertyToAPIObject(name, value) {
    Object.defineProperty(_RewireAPI__, name, {
      value: value,
      enumerable: false,
      configurable: true
    });
  }

  addPropertyToAPIObject('__get__', _get__);
  addPropertyToAPIObject('__GetDependency__', _get__);
  addPropertyToAPIObject('__Rewire__', _set__);
  addPropertyToAPIObject('__set__', _set__);
  addPropertyToAPIObject('__reset__', _reset__);
  addPropertyToAPIObject('__ResetDependency__', _reset__);
  addPropertyToAPIObject('__with__', _with__);
})();

exports.__get__ = _get__;
exports.__GetDependency__ = _get__;
exports.__Rewire__ = _set__;
exports.__set__ = _set__;
exports.__ResetDependency__ = _reset__;
exports.__RewireAPI__ = _RewireAPI__;
exports.default = _RewireAPI__;
