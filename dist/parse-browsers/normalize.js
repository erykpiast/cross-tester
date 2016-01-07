'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = undefined;
exports.browserName = browserName;
exports.browserVersion = browserVersion;
exports.osName = osName;
exports.osVersion = osVersion;
exports.deviceName = deviceName;
exports.name = name;
exports.numericVersion = numericVersion;

var _ramda = require('ramda');

var _constants = require('./constants');

// to prevent ESLint errors, because we really need undefined
var UNDEFINED = void 0;
var isUndefined = function isUndefined(v) {
  return 'undefined' === typeof v;
};

/**
 * @function browserName
 * @access public
 * @description return standarized browser name
 *
 * @param {*} n
 *
 * @returns {String|undefined}
 */
function browserName(n) {
  var stringifiedName = _get__('_getValue')(n);
  if (_get__('isUndefined')(stringifiedName)) {
    return _get__('UNDEFINED');
  }

  return _get__('_matchToAlias')(stringifiedName, _get__('OS_ALIAS'));
}

/**
 * @function browserVersion
 * @access public
 * @description return standarized browser version
 *
 * @param {*} v
 *
 * @returns {String|undefined}
 */
function browserVersion(v) {
  var stringifiedVersion = _get__('_getValue')(v);
  if (_get__('isUndefined')(stringifiedVersion) || !_get__('_isNumericVersion')(stringifiedVersion)) {
    return _get__('UNDEFINED');
  }

  return _get__('numericVersion')(stringifiedVersion);
}

/**
 * @function osName
 * @access private
 * @description return standarized name of the OS
 *
 * @param {*} n
 *
 * @returns {String|undefined} normalized name
 */
function osName(n) {
  var stringifiedName = _get__('_getValue')(n);
  if (_get__('isUndefined')(stringifiedName)) {
    return _get__('UNDEFINED');
  }

  return _get__('_matchToAlias')(stringifiedName, _get__('OS_ALIAS'));
}

/**
 * @function osVersion
 * @access public
 * @description ensure that version is numeric
 *
 * @param {*} v
 * @param {String} n
 *
 * @returns {String|undefined} normalized name
 */
function osVersion(v, n) {
  var stringifiedVersion = _get__('_getValue')(v);
  if (_get__('isUndefined')(stringifiedVersion)) {
    return _get__('UNDEFINED');
  }

  if (_get__('_isNumericVersion')(stringifiedVersion)) {
    return _get__('numericVersion')(stringifiedVersion);
  }

  var normalizedName = _get__('name')(stringifiedVersion);
  var versionMapping = _get__('OS_VERSION_MAPPING')[n];

  if (_get__('isUndefined')(versionMapping)) {
    return _get__('UNDEFINED');
  } else {
    return versionMapping[normalizedName];
  }
}

/**
 * @function deviceName
 * @access public
 * @description ensure that there is no leading or trailing whitespace,
 *   no unnecessary whitespaces between words and no space between alphanumeric
 *   symbols (we want "iPhone 6S", not " iPhone  6 S ")
 *
 * @param {*} n
 *
 * @returns {String|undefined} normalized name
 */
function deviceName(n) {
  var stringifiedName = _get__('_getValue')(n);
  if (_get__('isUndefined')(stringifiedName)) {
    return _get__('UNDEFINED');
  }

  return _get__('name')(stringifiedName).replace(/(\d)\s(\S)/g, '$1$2');
}

/**
 * @function name
 * @access public
 * @description ensure that there is no leading or trailing whitespace,
 *   no unnecessary whitespaces between words
 *
 * @param {*} n
 *
 * @returns {String|undefined} normalized name
 */
function name(n) {
  var stringifiedName = _get__('_getValue')(n);
  if (_get__('isUndefined')(stringifiedName)) {
    return _get__('UNDEFINED');
  }

  return stringifiedName.trim().replace(/( |\t)+/g, ' ').toLowerCase();
}

/**
 * @function numericVersion
 * @access public
 * @description ensure that there is no leading or trailing dot and no leading
 *   .0 (which is unnecessary redundancy, because ex. "Windows 8.0" has equal
 *    meaning to "Windows 8", "Android 4.4.0" to "Android 4.4" etc.)
 *
 * @param {String} v
 *
 * @returns {String} normalized version
 */
function numericVersion(v) {
  return v.replace(/^\.+/g, '').replace(/\.+$/g, '').replace(/\.0$/g, '');
}

/**
 * @function _getValue
 * @access private
 * @description return stringified value if it's present or undefined if it's not
 *
 * @param {*} v
 *
 * @returns {String|undefined}
 */
function _getValue(v) {
  return v ? v.toString() : _get__('UNDEFINED');
}

/**
 * @function _matchToAlias
 * @access private
 * @description find value for some alias
 *
 * @param {*} value
 * @param {Object} aliases - available aliases
 *
 * @returns {String|undefined}
 */
function _matchToAlias(value, aliases) {
  return value ? Object.keys(aliases).filter(function (matched) {
    return _get__('contains')(('' + value).toLowerCase())(aliases[matched]);
  }) : _get__('UNDEFINED');
}

// naive pattern, I know, but it's enough
var NUMERIC_VERSION_REGEXP = /^[\d\.]+$/;

/**
 * @function _isNumericVersion
 * @access private
 * @description check if string looks like numeric version, what means that it
 *   contains only digits and dots
 *
 * @param {String} version
 *
 * @returns {Boolean}
 */
function _isNumericVersion(version) {
  return version.match(_get__('NUMERIC_VERSION_REGEXP'));
}
var _RewiredData__ = {};

function _get__(variableName) {
  return _RewiredData__ === undefined || _RewiredData__[variableName] === undefined ? _get_original__(variableName) : _RewiredData__[variableName];
}

function _get_original__(variableName) {
  switch (variableName) {
    case '_getValue':
      return _getValue;

    case 'isUndefined':
      return isUndefined;

    case 'UNDEFINED':
      return UNDEFINED;

    case '_matchToAlias':
      return _matchToAlias;

    case 'OS_ALIAS':
      return _constants.OS_ALIAS;

    case '_isNumericVersion':
      return _isNumericVersion;

    case 'numericVersion':
      return numericVersion;

    case 'name':
      return name;

    case 'OS_VERSION_MAPPING':
      return _constants.OS_VERSION_MAPPING;

    case 'contains':
      return _ramda.contains;

    case 'NUMERIC_VERSION_REGEXP':
      return NUMERIC_VERSION_REGEXP;
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