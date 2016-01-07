'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = undefined;
exports.guessBrowserVersion = guessBrowserVersion;
exports.guessOsName = guessOsName;
exports.guessOsVersion = guessOsVersion;
exports.guessDeviceName = guessDeviceName;

var _ramda = require('ramda');

var _constants = require('./constants');

/**
 * @function guessBrowserVersion
 * @access public
 * @description try to find the best browser version for specified OS version
 *   or the latest one
 *
 * @param {String} osName
 * @param {String} osVersion
 * @param {String} browserName
 *
 * @returns {String}
 */
function guessBrowserVersion(osName, osVersion, browserName) {
  if (osName === _get__('OS').MAC && browserName === _get__('BROWSER').SAFARI || osName === _get__('OS').WINDOWS && browserName === _get__('BROWSER').IE) {
    return _get__('invertObj')(_get__('SYSTEM_BROWSER')[browserName])[osVersion];
  }

  if (osName === _get__('OS').IOS && browserName === _get__('BROWSER').SAFARI_MOBILE || osName === _get__('OS').ANDROID && browserName === _get__('BROWSER').ANDROID) {
    return osVersion;
  }

  return 'latest';
}

/**
 * @function guessOsName
 * @access public
 * @description try to find the best OS for given browser
 *
 * @param {String} browserName
 *
 * @returns {String|undefined}
 */
function guessOsName(browserName) {
  if (browserName === _get__('BROWSER').IE || browserName === _get__('BROWSER').EDGE) {
    return _get__('OS').WINDOWS;
  }

  if (browserName === _get__('BROWSER').SAFARI || browserName === _get__('BROWSER').CHROME) {
    return _get__('OS').MAC;
  }

  if (browserName === _get__('BROWSER').FF) {
    return _get__('OS').LINUX;
  }

  if (browserName === _get__('BROWSER').ANDROID) {
    return _get__('OS').ANDROID;
  }

  if (browserName === _get__('BROWSER').SAFARI_MOBILE) {
    return _get__('OS').IOS;
  }
}

/**
 * @function guessOsVersion
 * @access public
 * @description try to find the best version of given OS for browser version
 *
 * @param {String} osName
 * @param {String} browserName
 * @param {String} browserVersion
 *
 * @returns {String|undefined}
 */
function guessOsVersion(osName, browserName, browserVersion) {
  if (osName === _get__('OS').MAC && browserName === _get__('BROWSER').SAFARI || osName === _get__('OS').WINDOWS && _get__('contains')(browserName)([_get__('BROWSER').IE, _get__('BROWSER').EDGE])) {
    return _get__('SYSTEM_BROWSER')[browserName][browserVersion];
  }

  if (osName === _get__('OS').IOS && browserName === _get__('BROWSER').SAFARI_MOBILE || osName === _get__('OS').ANDROID && browserName === _get__('BROWSER').ANDROID) {
    return browserVersion;
  }

  return _get__('OS_PREFERABLE_VERSION')[osName];
}

/**
 * @function guessDeviceName
 * @access public
 * @description try to find the best device for the browser
 *
 * @param {String} osName
 * @param {String} browserName
 *
 * @returns {String|undefined}
 */
function guessDeviceName(osName, browserName) {
  if (osName === _get__('OS').IOS && browserName === _get__('BROWSER').SAFARI_MOBILE) {
    return _get__('DEVICE').IPHONE_SIMULATOR;
  }

  if (osName === _get__('OS').ANDROID && browserName === _get__('BROWSER').ANDROID) {
    return _get__('DEVICE').ANDROID_EMULATOR;
  }
}
var _RewiredData__ = {};

function _get__(variableName) {
  return _RewiredData__ === undefined || _RewiredData__[variableName] === undefined ? _get_original__(variableName) : _RewiredData__[variableName];
}

function _get_original__(variableName) {
  switch (variableName) {
    case 'OS':
      return _constants.OS;

    case 'BROWSER':
      return _constants.BROWSER;

    case 'invertObj':
      return _ramda.invertObj;

    case 'SYSTEM_BROWSER':
      return _constants.SYSTEM_BROWSER;

    case 'contains':
      return _ramda.contains;

    case 'OS_PREFERABLE_VERSION':
      return _constants.OS_PREFERABLE_VERSION;

    case 'DEVICE':
      return _constants.DEVICE;
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