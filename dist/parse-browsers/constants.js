'use strict';

var _BROWSER_ALIAS, _OS_PREFERABLE_VERSIO, _OS_ALIAS, _OS_VERSION_MAPPING, _SYSTEM_BROWSER;

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * @module constants
 * @description only source of names; ANY name should be hardcoded, constant
 *   have to be used EVERYWHERE
 *
 *   NOTE: lower case letters are intentional, it's easier to follow convention
 *   everywhere and use simple === to compare strings
 */

/**
 * @constant {Object} BROWSER
 * @access public
 * @description collection of normalized browser names
 */
var BROWSER = exports.BROWSER = {
  IE: 'internet explorer',
  FF: 'firefox',
  CHROME: 'chrome',
  SAFARI: 'safari',
  EDGE: 'edge',
  ANDROID: 'android browser',
  SAFARI_MOBILE: 'safari mobile'
};

/**
 * @constant {Object} BROWSER_ALIAS
 * @access public
 * @description collection of equivalent names for each browser
 */
var BROWSER_ALIAS = exports.BROWSER_ALIAS = (_BROWSER_ALIAS = {}, _defineProperty(_BROWSER_ALIAS, BROWSER.IE, ['ie', 'msie', 'explorer', 'internet explorer', 'ms internet explorer', 'microsoft internet explorer']), _defineProperty(_BROWSER_ALIAS, BROWSER.FF, ['ff', 'firefox', 'mozilla firefox', 'mozilla']), _defineProperty(_BROWSER_ALIAS, BROWSER.CHROME, ['chrome', 'google chrome']), _defineProperty(_BROWSER_ALIAS, BROWSER.SAFARI, ['safari', 'apple safari', 'desktop safari', 'safari desktop']), _defineProperty(_BROWSER_ALIAS, BROWSER.EDGE, ['edge', 'microsoft edge', 'ms edge']), _defineProperty(_BROWSER_ALIAS, BROWSER.ANDROID, ['android browser', 'google android browser', 'android']), _defineProperty(_BROWSER_ALIAS, BROWSER.SAFARI_MOBILE, ['safari mobile', 'mobile safari', 'ios safari', 'safari']), _BROWSER_ALIAS);

/**
 * @constant {Object} OS
 * @access public
 * @description collection of normalized OS names
 */
var OS = exports.OS = {
  IOS: 'ios',
  ANDROID: 'android',
  WINDOWS: 'windows',
  OSX: 'os x',
  LINUX: 'linux'
};

/**
 * @constant {Object} OS_PREFERABLE_VERSION
 * @access public
 * @description mapping from OS name to its the most prefered version (to use
 *   if no version provided); chosen based on number of available browser versions;
 *   probably should base on popularity...
 */
var OS_PREFERABLE_VERSION = exports.OS_PREFERABLE_VERSION = (_OS_PREFERABLE_VERSIO = {}, _defineProperty(_OS_PREFERABLE_VERSIO, OS.IOS, '9.1'), _defineProperty(_OS_PREFERABLE_VERSIO, OS.ANDROID, '5.0'), _defineProperty(_OS_PREFERABLE_VERSIO, OS.WINDOWS, '7'), _defineProperty(_OS_PREFERABLE_VERSIO, OS.OSX, '10.11'), _defineProperty(_OS_PREFERABLE_VERSIO, OS.LINUX, 'linux'), _OS_PREFERABLE_VERSIO);

/**
 * @constant {Object} OS_ALIAS
 * @access public
 * @description collection of equivalent names for each OS
 */
var OS_ALIAS = exports.OS_ALIAS = (_OS_ALIAS = {}, _defineProperty(_OS_ALIAS, OS.IOS, ['ios', 'apple ios']), _defineProperty(_OS_ALIAS, OS.ANDROID, ['android', 'google android']), _defineProperty(_OS_ALIAS, OS.WINDOWS, ['windows', 'microsoft windows', 'ms windows', 'win']), _defineProperty(_OS_ALIAS, OS.OSX, ['os x', 'apple os x', 'mac os x', 'mac os', 'mac']), _defineProperty(_OS_ALIAS, OS.LINUX, ['linux', 'the best os']), _OS_ALIAS);

/**
 * @constant {Object} OS_VERSION_MAPPING
 * @access public
 * @description collection of mapping from OS version name to number; notice,
 *   that some names refers to version ranges (ex. Android Jelly Bean it's
 *   from 4.1 to 4.3), then the newest version is taken
 */
var OS_VERSION_MAPPING = exports.OS_VERSION_MAPPING = (_OS_VERSION_MAPPING = {}, _defineProperty(_OS_VERSION_MAPPING, OS.ANDROID, {
  'ice cream sandwich': '4',
  'jelly bean': '4.3',
  'kitkat': '4.4',
  'lollipop': '5.1'
}), _defineProperty(_OS_VERSION_MAPPING, OS.OSX, {
  'snow leopard': '10.6',
  'lion': '10.7',
  'mountain lion': '10.8',
  'mavericks': '10.9',
  'yosemite': '10.10',
  'el capitan': '10.11'
}), _OS_VERSION_MAPPING);

/**
 * @constant {Object} SYSTEM_BROWSER
 * @access public
 * @description map from browser version to version of OS that it works with
 */
var SYSTEM_BROWSER = exports.SYSTEM_BROWSER = (_SYSTEM_BROWSER = {}, _defineProperty(_SYSTEM_BROWSER, BROWSER.IE, {
  '11': '10',
  '10': '8',
  '9': '7',
  '8': '7'
}), _defineProperty(_SYSTEM_BROWSER, BROWSER.EDGE, {
  '20': '10',
  '12': '10'
}), _defineProperty(_SYSTEM_BROWSER, BROWSER.SAFARI, {
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
  IPHONE: 'iphone',
  IPAD: 'ipad',
  ANDROID_EMULATOR: 'android emulator',
  IPHONE_SIMULATOR: 'iphone simulator',
  IPAD_SIMULATOR: 'ipad simulator'
};