'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = undefined;
exports.default = parseBrowsers;

var _ramda = require('ramda');

var _constants = require('./constants');

var _guess = require('./guess');

var _normalize = require('./normalize');

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var isObject = _get__('is')(Object);
var isArray = _get__('is')(Array);
var isUndefined = function isUndefined(v) {
  return 'undefined' === typeof v;
};
var entries = function entries(o) {
  return Object.keys(o).map(function (key) {
    return [o[key], key];
  });
};

/**
 * @type {Object} BrowserDefinition
 * @description describes browser configuration in standarized way
 *
 * @property {String} displayName - human-readable name
 * @property {String} name - standarized, formal name of the browser
 * @property {String} version - numeric version of the browser
 * @property {String} os - standarized name of the OS
 * @property {String} osVersion - numeric version of the OS
 * @property {String} [deviceName=undefined] - standarized, full name of the device
 */

/**
 * @function parseBrowsers - make browsers definition object flat and compatible with Selenium
 *
 * @param {Object} nested - nested browsers definition object
 *   @property {Object} BROWSER - definition of single group of browsers; the "browser" key is human-readable name (like Chrome, Internet Explorer)
 *     @property {String} browserName - name of the browser for Selenium (like firefox, chrome, iPhone)
 *     @property {String} deviceName - name of the device to run the browser on (mostly for Apple devices, like iPhone, iPad)
 *     @property {Object} versions - versions of the browser
 *       @property {String|Object} VERSION - single version of the browser; the "version" key is human-readable name (like previous, current);
 *         - if it's a string, it's just copied to "version" property of target object
 *         - if it's an object it has properties:
 *         @property {String} osVersion - version of operating system (mostly for iOS, like 7.1, 8)
 *         @property {String[]} devices - device models to run the browser on (mostly for Apple devices, like Plus, 5S, Mini 3);
 *           this will be concatenated with value of "deviceName" field and copied to "device" property of target object
 *     @property {String} os - name of the Selenium platform to run the browser on (like Windows, MAC)
 *     @property {String} osVersion - version of os to run the browser on (like 8.1, 10.10)
 *     @property {String} device - name of the Selenium (Appium?) device to run the browser on (like iPhone 6 Plus, iPad 3)
 *     @property {*} ANY - whatever you want, it will be copied to target object (like realMobile)
 *
 * @return {Object} flat browsers definition object
 *   @property {Object} BROWSER - definition of single browser; the key is in format
 *     - for "device browsers" like iPhone and iPad Safari:
 *         `${browserName} ${versionName} (${version.osVersion}) - ${browser.deviceName} ${deviceModel}`
 *     - for any other browser:
 *         `${browserName} ${versionName} (${version})`
 *     @property {String} name - name of the browser for Selenium (like firefox, chrome, iPhone)
 *     @property {String} version - version of the browser for Selenium (like 11, 41, 8.1)
 *     @property {String} os - name of the Selenium platform to run the browser on (like Windows, MAC)
 *     @property {String} osVersion - version of os to run the browser on (like 8.1, 10.10)
 *     @property {String} device - name of the Selenium (Appium?) device to run the browser on (like iPhone 6 Plus, iPad 3)
 *     @property {*} ANY - any property (except versions, deviceType, deviceName, versionName) from source object (like realMobile)
 */
function parseBrowsers(nested) {
  return _get__('pipe')(_get__('entries'), _get__('map')(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var browser = _ref2[0];
    var displayName = _ref2[1];

    if (_get__('isObject')(browser.versions)) {
      return _get__('_parseMultiVersionDefinition')(browser, displayName);
    }

    return _get__('_parseSingleVersionDefinition')(browser, displayName);
  }), _get__('flatten'), _get__('reduce')(function (hashmap, browser) {
    return hashmap[browser.displayName] = browser, hashmap;
  }, {}))(nested);
}

/**
 * @function _parseSingleVersionDefinition
 * @access private
 * @description try to create BrowserDefinition object based on given parameters
 *
 * @param {Object} browser - browser parameters
 *   @property {String} name - formal name of the browser
 *   @property {String} version - numeric version of the borwser
 *   @property {String} [os] - name of OS to run the browser
 *   @property {String} [osVersion] - version of the OS; numeric or name
 *   @property {String} [deviceName] - full name of the device
 * @param {String} displayName
 *
 * @returns {BrowserDefinition}
 */
function _parseSingleVersionDefinition(browser, displayName) {
  debugger;
  var browserName = _get__('normalizeBrowserName')(browser.name);
  if (_get__('isUndefined')(browserName)) {
    throw new Error('browser name must be defined');
  }

  var browserVersion = _get__('normalizeBrowserVersion')(browser.version);
  var osName = _get__('normalizeOsName')(browser.os);
  var osVersion = _get__('normalizeOsVersion')(browser.osVersion);
  var deviceName = _get__('normalizeDeviceName')(browser.deviceName);

  return _get__('_createBrowserDefinitionObject')({
    displayName: displayName,
    browserName: browserName,
    browserVersion: browserVersion,
    osName: osName,
    osVersion: osVersion,
    deviceName: deviceName
  });
}

/**
 * @function _parseMultiVersionDefinition
 * @access private
 * @description try to create BrowserDefinition object based on given parameters;
 *   one definition is created for each device for each version
 *
 * @param {Object} browser - browser parameters
 *   @property {String} name - formal name of the browser
 *   @property {Object} versions - collection of versions definitions; key in the
 *     object is display name
 *     @property {String} version - numeric version of the borwser
 *     @property {String} [os] - name of OS to run the browser version
 *     @property {String} [osVersion] - version of the OS; numeric or name
 *     @property {String} [deviceName] - full name of the device or base name
 *       if `devices` collection is provided
 *     @property {String[]} [devices] - collection of device models; each one
 *       is concatenated with base deviceName (if provided) and produces new
 *       version entity
 *   @property {String} [os] - name of OS to run the browser
 *   @property {String} [osVersion] - version of the OS; numeric or name
 *   @property {String} [deviceName] - full name of the device
 * @param {String} displayName
 *
 * @returns {BrowserDefinition}
 */
function _parseMultiVersionDefinition(browser, displayName) {
  return _get__('pipe')(_get__('map')(function (version, versionName) {
    if (_get__('isObject')(version)) {
      var _ret = (function () {
        var browserName = _get__('normalizeBrowserName')(browser.name);
        if (_get__('isUndefined')(browserName)) {
          throw new Error('browser name must be defined');
        }

        var browserVersion = _get__('normalizeBrowserVersion')(version.version || browser.version);
        var osName = _get__('normalizeOsName')(version.os || browser.os);
        var osVersion = _get__('normalizeOsVersion')(version.osVersion || browser.osVersion, osName);
        var deviceName = _get__('normalizeDeviceName')(version.deviceName || browser.deviceName);

        if (_get__('isArray')(version.devices)) {
          return {
            v: _get__('map')(function (deviceModel) {
              return _get__('_createBrowserDefinitionObject')({
                displayName: displayName + ' ' + versionName,
                browserName: browserName,
                browserVersion: browserVersion,
                osName: osName,
                osVersion: osVersion,
                deviceName: _get__('isUndefined')(deviceName) ? deviceModel : [deviceName, deviceModel].join(' ')
              });
            }, version.devices)
          };
        }

        return {
          v: _get__('_createBrowserDefinitionObject')({
            displayName: displayName + ' ' + versionName,
            browserName: browserName,
            browserVersion: browserVersion,
            osName: osName,
            osVersion: osVersion,
            deviceName: deviceName
          })
        };
      })();

      if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    }

    return _get__('_parseSingleVersionDefinition')(_get__('mergeAll')([{}, browser, {
      version: version
    }]), displayName + ' ' + versionName);
  }), _get__('flatten'))(browser.versions);
}

/* eslint-disable no-param-reassign */
function _createBrowserDefinitionObject(_ref3) {
  var displayName = _ref3.displayName;
  var browserName = _ref3.browserName;
  var browserVersion = _ref3.browserVersion;
  var osName = _ref3.osName;
  var osVersion = _ref3.osVersion;
  var deviceName = _ref3.deviceName;

  if (_get__('isUndefined')(osName)) {
    osName = _get__('guessOsName')(browserName);

    if (_get__('isUndefined')(osName)) {
      throw new Error('OS name must be defined');
    }
  }

  if (_get__('isUndefined')(osVersion)) {
    osVersion = _get__('guessOsVersion')(osName, browserName, browserVersion);

    if (_get__('isUndefined')(osName)) {
      throw new Error('OS version must be defined');
    }
  }

  if (_get__('isUndefined')(deviceName) && _get__('_isDeviceNameRequired')(osName)) {
    deviceName = _get__('guessDeviceName')(osName, browserName);

    if (_get__('isUndefined')(deviceName)) {
      throw new Error('device name must be defined');
    }
  }

  if (_get__('isUndefined')(browserVersion)) {
    browserVersion = _get__('guessBrowserVersion')(osName, osVersion, browserName);

    if (_get__('isUndefined')(browserVersion)) {
      throw new Error('browser version must be defined');
    }
  }

  return {
    displayName: displayName,
    name: browserName,
    version: browserVersion,
    os: osName,
    osVersion: osVersion,
    device: deviceName
  };
}
/* eslint-enable no-param-reassign */

/**
 * @function _isDeviceNameRequired
 * @access private
 * @description check if device is required for the OS
 *
 * @param {String} osName
 *
 * @returns {Boolean}
 */
function _isDeviceNameRequired(osName) {
  return _get__('contains')(osName)([_get__('OS').ANDROID, _get__('OS').IOS]);
}
var typeOfOriginalExport = typeof parseBrowsers === 'undefined' ? 'undefined' : _typeof(parseBrowsers);

function addNonEnumerableProperty(name, value) {
  Object.defineProperty(parseBrowsers, name, {
    value: value,
    enumerable: false,
    configurable: true
  });
}

if ((typeOfOriginalExport === 'object' || typeOfOriginalExport === 'function') && Object.isExtensible(parseBrowsers)) {
  addNonEnumerableProperty('__get__', _get__);
  addNonEnumerableProperty('__GetDependency__', _get__);
  addNonEnumerableProperty('__Rewire__', _set__);
  addNonEnumerableProperty('__set__', _set__);
  addNonEnumerableProperty('__reset__', _reset__);
  addNonEnumerableProperty('__ResetDependency__', _reset__);
  addNonEnumerableProperty('__with__', _with__);
  addNonEnumerableProperty('__RewireAPI__', _RewireAPI__);
}

var _RewiredData__ = {};

function _get__(variableName) {
  return _RewiredData__ === undefined || _RewiredData__[variableName] === undefined ? _get_original__(variableName) : _RewiredData__[variableName];
}

function _get_original__(variableName) {
  switch (variableName) {
    case 'is':
      return _ramda.is;

    case 'pipe':
      return _ramda.pipe;

    case 'entries':
      return entries;

    case 'map':
      return _ramda.map;

    case 'isObject':
      return isObject;

    case '_parseMultiVersionDefinition':
      return _parseMultiVersionDefinition;

    case '_parseSingleVersionDefinition':
      return _parseSingleVersionDefinition;

    case 'flatten':
      return _ramda.flatten;

    case 'reduce':
      return _ramda.reduce;

    case 'normalizeBrowserName':
      return _normalize.borwserName;

    case 'isUndefined':
      return isUndefined;

    case 'normalizeBrowserVersion':
      return _normalize.borwserVersion;

    case 'normalizeOsName':
      return _normalize.osName;

    case 'normalizeOsVersion':
      return _normalize.osVersion;

    case 'normalizeDeviceName':
      return _normalize.deviceName;

    case '_createBrowserDefinitionObject':
      return _createBrowserDefinitionObject;

    case 'isArray':
      return isArray;

    case 'mergeAll':
      return _ramda.mergeAll;

    case 'guessOsName':
      return _guess.osName;

    case 'guessOsVersion':
      return _guess.osVersion;

    case '_isDeviceNameRequired':
      return _isDeviceNameRequired;

    case 'guessDeviceName':
      return _guess.deviceName;

    case 'guessBrowserVersion':
      return _guess.borwserVersion;

    case 'contains':
      return _ramda.contains;

    case 'OS':
      return _constants.OS;
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