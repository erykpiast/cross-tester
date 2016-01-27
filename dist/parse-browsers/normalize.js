'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
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
 * @param {*} n - browser name to normalize
 *
 * @returns {String|undefined}
 */
function browserName(n) {
  var stringifiedName = _getValue(n);
  if (isUndefined(stringifiedName)) {
    return UNDEFINED;
  }

  return _matchToAlias(stringifiedName, _constants.BROWSER_ALIAS);
}

/**
 * @function browserVersion
 * @access public
 * @description return standarized browser version
 *
 * @param {*} v - browser version to normalize
 *
 * @returns {String|undefined}
 */
function browserVersion(v) {
  var stringifiedVersion = _getValue(v);
  if (isUndefined(stringifiedVersion) || !_isNumericVersion(stringifiedVersion)) {
    return UNDEFINED;
  }

  return numericVersion(stringifiedVersion);
}

/**
 * @function osName
 * @access private
 * @description return standarized name of the OS
 *
 * @param {*} n - OS name to normalize
 *
 * @returns {String|undefined} normalized name
 */
function osName(n) {
  var stringifiedName = _getValue(n);
  if (isUndefined(stringifiedName)) {
    return UNDEFINED;
  }

  return _matchToAlias(stringifiedName, _constants.OS_ALIAS);
}

/**
 * @function osVersion
 * @access public
 * @description ensure that version is numeric
 *
 * @param {*} v - OS version to normalize
 * @param {String} on - OS name
 *
 * @returns {String|undefined} normalized name
 */
function osVersion(v, on) {
  var stringifiedVersion = _getValue(v);
  if (isUndefined(stringifiedVersion)) {
    return UNDEFINED;
  }

  if (_isNumericVersion(stringifiedVersion)) {
    return numericVersion(stringifiedVersion);
  }

  var normalizedName = name(stringifiedVersion);
  var versionMapping = _constants.OS_VERSION_MAPPING[on];

  if (isUndefined(versionMapping)) {
    return UNDEFINED;
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
 * @param {*} n - device name
 *
 * @returns {String|undefined} normalized name
 */
function deviceName(n) {
  var stringifiedName = _getValue(n);
  if (isUndefined(stringifiedName)) {
    return UNDEFINED;
  }

  return name(stringifiedName).replace(/(\d)\s(\S)/g, '$1$2');
}

/**
 * @function name
 * @access public
 * @description ensure that there is no leading or trailing whitespace,
 *   no unnecessary whitespaces between words
 *
 * @param {*} n - name to normalize
 *
 * @returns {String|undefined} normalized name
 */
function name(n) {
  var stringifiedName = _getValue(n);
  if (isUndefined(stringifiedName)) {
    return UNDEFINED;
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
 * @param {String} v - version to normalize
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
  return v ? v.toString() : UNDEFINED;
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
    return (0, _ramda.contains)(('' + value).toLowerCase())(aliases[matched]);
  })[0] : UNDEFINED;
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
  return version.match(NUMERIC_VERSION_REGEXP);
}