'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseBrowsers;

var _ramda = require('ramda');

var _constants = require('./constants');

var _guess = require('./guess');

var _normalize = require('./normalize');

var isObject = (0, _ramda.is)(Object);
var isArray = (0, _ramda.is)(Array);
var isUndefined = function isUndefined(v) {
  return 'undefined' === typeof v;
};
var entries = function entries(o) {
  return Object.keys(o).map(function (key) {
    return [o[key], key];
  });
};
var omitUndefinedKeys = (0, _ramda.pickBy)((0, _ramda.complement)(isUndefined));
var toLowerCase = function toLowerCase(v) {
  return (0, _ramda.isNil)(v) ? v : v.toString().toLowerCase();
};
var mapToLowerCase = (0, _ramda.map)(toLowerCase);

/**
 * @type {Object} BrowserDefinition
 * @description describes browser configuration in standarized way
 *
 * @property {String} displayName - human-readable name
 * @property {String} name - standarized, formal name of the browser
 * @property {String} version - numeric version of the browser
 * @property {String} os - standarized name of the OS
 * @property {String} osVersion - numeric version of the OS
 * @property {String} [device=undefined] - standarized, full name of the device
 */

/**
 * @function parseBrowsers
 * @access public
 * @description create BrowserDefinition object from eventually not completed
 *   configuration
 *
 * @param {Object} config - collection of congiguration objects; key is display
 *   name, value is configuration for the browser; number of keys in the object
 *   does not determine number of output BrowserDefinition objects; depending on
 *   existence of `versions` and `devices` fields it may be many times more
 *   @property {String} name - formal browser name
 *   @property {String} [version] - numeric version of the browser, may be defined
 *     in `versions` object
 *   @property {String} [os] - name of the os, may be defined in `versions` object
 *     or not defined at all
 *   @property {String} [osVersion] - version (numeric or codename) of the OS,
 *     may be defined in `versions` object or not defined at all
     @property {String} [device] - full or partial name of the device,
       may be defined in `versions` object or not defined at all
 *   @property {Object} [versions] - required if `version` key is not present
 *     key is display name for the version, value may be numeric version or
 *     version configuration object
 *     @property {String} [version]
 *     @property {String} [os]
 *     @property {String} [osName]
 *     @property {String} [device]
 *     @property {String[]} [devices] - collection of devices to run the browser
 *       on, full or partial names (concatenated) with `deviceName` if provided
 *       on any level
 *
 * @returns {BrowserDefinition[]}
 */
function parseBrowsers(config) {
  return (0, _ramda.pipe)(entries, (0, _ramda.map)(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var browser = _ref2[0];
    var displayName = _ref2[1];

    if (isObject(browser.versions)) {
      return _parseMultiVersionDefinition(browser, displayName);
    }

    return _parseSingleVersionDefinition(browser, displayName);
  }), _ramda.flatten, (0, _ramda.map)(omitUndefinedKeys))(config);
}

/**
 * @function _parseSingleVersionDefinition
 * @access private
 * @description try to create BrowserDefinition object based on given parameters
 *
 * @param {Object} browser - browser parameters
 *   @property {String} name - formal name of the browser
 *   @property {String} version - numeric version of the browser
 *   @property {String} [os] - name of OS to run the browser
 *   @property {String} [osVersion] - version of the OS; numeric or name
 *   @property {String} [deviceName] - full name of the device
 * @param {String} displayName
 *
 * @returns {BrowserDefinition}
 */
function _parseSingleVersionDefinition(browser, displayName) {
  var browserName = (0, _normalize.browserName)(browser.name);
  if (isUndefined(browserName)) {
    throw new Error('browser name must be defined');
  }

  var browserVersion = (0, _normalize.browserVersion)(browser.version);
  var osName = (0, _normalize.osName)(browser.os);
  var osVersion = (0, _normalize.osVersion)(browser.osVersion);
  var deviceName = (0, _normalize.deviceName)(browser.device);

  return _createBrowserDefinitionObject({
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
 *     @property {String} version - numeric version of the browser
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
  return (0, _ramda.pipe)(entries, (0, _ramda.map)(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2);

    var version = _ref4[0];
    var versionName = _ref4[1];

    if (isObject(version)) {
      var _ret = function () {
        var browserName = (0, _normalize.browserName)(browser.name);
        if (isUndefined(browserName)) {
          throw new Error('browser name must be defined');
        }

        var browserVersion = (0, _normalize.browserVersion)(version.version || browser.version);
        var osName = (0, _normalize.osName)(version.os || browser.os);
        var osVersion = (0, _normalize.osVersion)(version.osVersion || browser.osVersion, osName);
        var deviceName = (0, _normalize.deviceName)(version.device || browser.device);

        if (isArray(version.devices)) {
          return {
            v: (0, _ramda.map)(function (deviceModel) {
              return _createBrowserDefinitionObject({
                displayName: displayName + ' ' + versionName,
                browserName: browserName,
                browserVersion: browserVersion,
                osName: osName,
                osVersion: osVersion,
                deviceName: isUndefined(deviceName) ? deviceModel : [deviceName, deviceModel].join(' ')
              });
            }, version.devices)
          };
        }

        return {
          v: _createBrowserDefinitionObject({
            displayName: displayName + ' ' + versionName,
            browserName: browserName,
            browserVersion: browserVersion,
            osName: osName,
            osVersion: osVersion,
            deviceName: deviceName
          })
        };
      }();

      if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    }

    return _parseSingleVersionDefinition(_extends({}, browser, { version: version }), displayName + ' ' + versionName);
  }), _ramda.flatten)(browser.versions);
}

/* eslint-disable no-param-reassign */
function _createBrowserDefinitionObject(_ref5) {
  var displayName = _ref5.displayName;
  var browserName = _ref5.browserName;
  var browserVersion = _ref5.browserVersion;
  var osName = _ref5.osName;
  var osVersion = _ref5.osVersion;
  var deviceName = _ref5.deviceName;

  if (isUndefined(osName)) {
    osName = (0, _guess.osName)(browserName);

    if (isUndefined(osName)) {
      throw new Error('OS name must be defined');
    }
  }

  if (isUndefined(osVersion)) {
    osVersion = (0, _guess.osVersion)(osName, browserName, browserVersion);

    if (isUndefined(osVersion)) {
      throw new Error('OS version must be defined');
    }
  }

  // NOTE: it's special case
  if (browserName === _constants.BROWSER.SAFARI && osName === _constants.OS.IOS) {
    browserName = _constants.BROWSER.SAFARI_MOBILE;
  }

  if (isUndefined(deviceName) && _isDeviceNameRequired(osName)) {
    deviceName = (0, _guess.deviceName)(osName, browserName);

    if (isUndefined(deviceName)) {
      throw new Error('device name must be defined');
    }
  }

  if (isUndefined(browserVersion)) {
    browserVersion = (0, _guess.browserVersion)(osName, osVersion, browserName);

    if (isUndefined(browserVersion)) {
      throw new Error('browser version must be defined');
    }
  }

  return _extends({
    displayName: displayName }, mapToLowerCase({
    name: browserName,
    version: browserVersion,
    os: osName,
    osVersion: osVersion,
    device: deviceName
  }));
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
  return (0, _ramda.contains)(osName)([_constants.OS.ANDROID, _constants.OS.IOS]);
}