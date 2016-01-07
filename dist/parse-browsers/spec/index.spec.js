'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = undefined;

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _chaiSpies = require('chai-spies');

var _chaiSpies2 = _interopRequireDefault(_chaiSpies);

var _chaiSpiesTdd = require('chai-spies-tdd');

var _chaiSpiesTdd2 = _interopRequireDefault(_chaiSpiesTdd);

var _index = require('../index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_get__('chai').use(_get__('chaiSpies')); /* global suite, test, setup, teardown */

_get__('chai').use(_get__('chaiSpiesTdd'));

suite('parse-browsers', function () {
  suite('API', function () {
    test('export type', function () {
      _get__('assert').isFunction(_get__('parseBrowsers'), 'parseBrowsers is a function');
    });
  });

  suite('single version entries', function () {
    test('parsing complete entries', function () {
      var CHROME = {
        displayName: 'Chrome 40',
        name: 'Chrome',
        version: '40',
        os: 'Windows',
        osVersion: '7'
      };
      var FF = {
        displayName: 'Firefox 42',
        name: 'Firefox',
        version: '42',
        os: 'OS X',
        osVersion: '10.10'
      };

      var result = _get__('parseBrowsers')([CHROME, FF]);
      _get__('assert').sameDeepMembers([CHROME, FF]);
    });

    test('firefox logs', function () {});

    test('firefox addon logs', function () {});

    test('android emulator logs', function () {});

    test('custom logs', function () {});
  });
});
var _RewiredData__ = {};

function _get__(variableName) {
  return _RewiredData__ === undefined || _RewiredData__[variableName] === undefined ? _get_original__(variableName) : _RewiredData__[variableName];
}

function _get_original__(variableName) {
  switch (variableName) {
    case 'chai':
      return _chai2.default;

    case 'chaiSpies':
      return _chaiSpies2.default;

    case 'chaiSpiesTdd':
      return _chaiSpiesTdd2.default;

    case 'assert':
      return _chai.assert;

    case 'parseBrowsers':
      return _index2.default;
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