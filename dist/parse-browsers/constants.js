'use strict';

var _BROWSER_ALIAS, _OS_PREFERABLE_VERSIO, _OS_ALIAS, _OS_VERSION_MAPPING, _SYSTEM_BROWSER;

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * @constant {Object} BROWSER
 * @access public
 * @description collection of normalized browser names
 */
var BROWSER = exports.BROWSER = {
  IE: 'Internet Explorer',
  FF: 'Firefox',
  CHROME: 'Chrome',
  SAFARI: 'Safari',
  EDGE: 'Edge',
  ANDROID: 'Android Browser',
  SAFARI_MOBILE: 'Safari Mobile'
};

/**
 * @constant {Object} BROWSER_ALIAS
 * @access public
 * @description collection of equivalent names for each browser
 */
var BROWSER_ALIAS = exports.BROWSER_ALIAS = (_BROWSER_ALIAS = {}, _defineProperty(_BROWSER_ALIAS, _get__('BROWSER').IE, ['ie', 'msie', 'internet explorer', 'ms internet explorer', 'microsoft internet explorer']), _defineProperty(_BROWSER_ALIAS, _get__('BROWSER').FF, ['ff', 'firefox', 'mozilla firefox']), _defineProperty(_BROWSER_ALIAS, _get__('BROWSER').CHROME, ['chrome', 'google chrome']), _defineProperty(_BROWSER_ALIAS, _get__('BROWSER').SAFARI, ['safari', 'apple safari', 'desktop safari', 'safari desktop']), _defineProperty(_BROWSER_ALIAS, _get__('BROWSER').EDGE, ['edge', 'microsoft edge', 'ms edge']), _defineProperty(_BROWSER_ALIAS, _get__('BROWSER').ANDROID, ['android browser', 'google android browser', 'android']), _defineProperty(_BROWSER_ALIAS, _get__('BROWSER').SAFARI_MOBILE, ['safari mobile', 'mobile safari', 'ios safari', 'safari']), _BROWSER_ALIAS);

/**
 * @constant {Object} OS
 * @access public
 * @description collection of normalized OS names
 */
var OS = exports.OS = {
  IOS: 'iOS',
  ANDROID: 'Android',
  WINDOWS: 'Windows',
  OSX: 'OS X',
  LINUX: 'Linux'
};

/**
 * @constant {Object} OS_PREFERABLE_VERSION
 * @access public
 * @description mapping from OS name to its the most prefered version (to use
 *   if no version provided); chosen based on number of available browser versions;
 *   probably should base on popularity...
 */
var OS_PREFERABLE_VERSION = exports.OS_PREFERABLE_VERSION = (_OS_PREFERABLE_VERSIO = {}, _defineProperty(_OS_PREFERABLE_VERSIO, _get__('OS').IOS, '9.1'), _defineProperty(_OS_PREFERABLE_VERSIO, _get__('OS').ANDROID, '5.0'), _defineProperty(_OS_PREFERABLE_VERSIO, _get__('OS').WINDOWS, '7'), _defineProperty(_OS_PREFERABLE_VERSIO, _get__('OS').OSX, '10.11'), _defineProperty(_OS_PREFERABLE_VERSIO, _get__('OS').LINUX, 'Linux'), _OS_PREFERABLE_VERSIO);

/**
 * @constant {Object} OS_ALIAS
 * @access public
 * @description collection of equivalent names for each OS
 */
var OS_ALIAS = exports.OS_ALIAS = (_OS_ALIAS = {}, _defineProperty(_OS_ALIAS, _get__('OS').IOS, ['ios', 'apple ios']), _defineProperty(_OS_ALIAS, _get__('OS').ANDROID, ['android', 'google android']), _defineProperty(_OS_ALIAS, _get__('OS').WINDOWS, ['window', 'microsoft windows', 'ms windows', 'win']), _defineProperty(_OS_ALIAS, _get__('OS').OSX, ['os x', 'apple os x', 'mac os x', 'mac os', 'mac']), _defineProperty(_OS_ALIAS, _get__('OS').LINUX, ['linux', 'the best os']), _OS_ALIAS);

/**
 * @constant {Object} OS_VERSION_MAPPING
 * @access public
 * @description collection of mapping from OS version name to number; notice,
 *   that some names refers to version ranges (ex. Android Jelly Bean it's
 *   from 4.1 to 4.3), then the newest version is taken
 */
var OS_VERSION_MAPPING = exports.OS_VERSION_MAPPING = (_OS_VERSION_MAPPING = {}, _defineProperty(_OS_VERSION_MAPPING, _get__('OS').ANDROID, {
  'Ice Cream Sandwich': '4',
  'Jelly Bean': '4.3',
  'KitKat': '4.4',
  'Lollipop': '5.1'
}), _defineProperty(_OS_VERSION_MAPPING, _get__('OS').OSX, {
  'Snow Leopard': '10.6',
  'Lion': '10.7',
  'Mountain Lion': '10.8',
  'Mavericks': '10.9',
  'Yosemite': '10.10',
  'El Capitan': '10.11'
}), _OS_VERSION_MAPPING);

/**
 * @constant {Object} SYSTEM_BROWSER
 * @access public
 * @description map from browser version to version of OS that it works with
 */
var SYSTEM_BROWSER = exports.SYSTEM_BROWSER = (_SYSTEM_BROWSER = {}, _defineProperty(_SYSTEM_BROWSER, _get__('BROWSER').IE, {
  '11': '10',
  '10': '8',
  '9': '7',
  '8': '7'
}), _defineProperty(_SYSTEM_BROWSER, _get__('BROWSER').EDGE, {
  '20': '10',
  '12': '10'
}), _defineProperty(_SYSTEM_BROWSER, _get__('BROWSER').SAFARI, {
  '9': '10.11',
  '8': '10.10',
  '7': '10.9',
  '6.2': '10.8',
  '6': '10.7',
  '5.1': '10.6'
}), _SYSTEM_BROWSER);

/**
 * @constant {Object} DEVICE
 * @access public
 * @description collection of normalized device names
 */
var DEVICE = exports.DEVICE = {
  IPHONE: 'iPhone',
  IPAD: 'iPad',
  ANDROID_EMULATOR: 'Android Emulator',
  IPHONE_SIMULATOR: 'iPhone Simulator',
  IPAD_SIMULATOR: 'iPad Simulator'
};
var _RewiredData__ = {};

function _get__(variableName) {
  return _RewiredData__ === undefined || _RewiredData__[variableName] === undefined ? _get_original__(variableName) : _RewiredData__[variableName];
}

function _get_original__(variableName) {
  switch (variableName) {
    case 'BROWSER':
      return BROWSER;

    case 'OS':
      return OS;
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