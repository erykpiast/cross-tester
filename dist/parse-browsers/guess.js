'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.browserVersion = browserVersion;
exports.osName = osName;
exports.osVersion = osVersion;
exports.deviceName = deviceName;

var _ramda = require('ramda');

var _constants = require('./constants');

var UNDEFINED = void 0;

/**
 * @function browserVersion
 * @access public
 * @description try to find the best browser version for specified OS version
 *   or the latest one
 *
 * @param {String} on - OS name
 * @param {String} ov - OS version
 * @param {String} bn - browser name
 *
 * @returns {String}
 */
function browserVersion(on, ov, bn) {
  if (on === _constants.OS.MAC && bn === _constants.BROWSER.SAFARI || on === _constants.OS.WINDOWS && bn === _constants.BROWSER.IE) {
    return (0, _ramda.invertObj)(_constants.SYSTEM_BROWSER[bn])[ov];
  }

  if (on === _constants.OS.IOS && bn === _constants.BROWSER.SAFARI_MOBILE || on === _constants.OS.ANDROID && bn === _constants.BROWSER.ANDROID) {
    return ov;
  }

  return 'latest';
}

/**
 * @function osName
 * @access public
 * @description try to find the best OS for given browser
 *
 * @param {String} bn - browser name
 *
 * @returns {String|undefined}
 */
function osName(bn) {
  if (bn === _constants.BROWSER.IE || bn === _constants.BROWSER.EDGE) {
    return _constants.OS.WINDOWS;
  }

  if (bn === _constants.BROWSER.SAFARI || bn === _constants.BROWSER.CHROME) {
    return _constants.OS.OSX;
  }

  if (bn === _constants.BROWSER.FF) {
    return _constants.OS.LINUX;
  }

  if (bn === _constants.BROWSER.ANDROID) {
    return _constants.OS.ANDROID;
  }

  if (bn === _constants.BROWSER.SAFARI_MOBILE) {
    return _constants.OS.IOS;
  }

  return UNDEFINED;
}

/**
 * @function osVersion
 * @access public
 * @description try to find the best version of given OS for browser version
 *
 * @param {String} on - OS name
 * @param {String} bn - browser name
 * @param {String} bv - browser version
 *
 * @returns {String|undefined}
 */
function osVersion(on, bn, bv) {
  if (on === _constants.OS.MAC && bn === _constants.BROWSER.SAFARI || on === _constants.OS.WINDOWS && (0, _ramda.contains)(bn)([_constants.BROWSER.IE, _constants.BROWSER.EDGE])) {
    return _constants.SYSTEM_BROWSER[bn][bv];
  }

  if (on === _constants.OS.IOS && bn === _constants.BROWSER.SAFARI_MOBILE || on === _constants.OS.ANDROID && bn === _constants.BROWSER.ANDROID) {
    return bv;
  }

  return _constants.OS_PREFERABLE_VERSION[on];
}

/**
 * @function deviceName
 * @access public
 * @description try to find the best device for the browser
 *
 * @param {String} on - OS name
 * @param {String} bn - browser name
 *
 * @returns {String|undefined}
 */
function deviceName(on, bn) {
  if (on === _constants.OS.IOS && bn === _constants.BROWSER.SAFARI_MOBILE) {
    return _constants.DEVICE.IPHONE_SIMULATOR;
  }

  if (on === _constants.OS.ANDROID && bn === _constants.BROWSER.ANDROID) {
    return _constants.DEVICE.ANDROID_EMULATOR;
  }

  return UNDEFINED;
}