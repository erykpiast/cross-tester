'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = exports.byValue = exports.byName = undefined;
exports.parse = parse;
exports.isIgnored = isIgnored;

var _ramda = require('ramda');

var _url = require('url');

var CHROME_LOG_PATTERN = /^(javascript|(?:(?:https?|chrome-extension)\:\/\/\S+))\s+(\d+:\d+)\s+(.*)$/i;
var FIREFOX_ADDON_LOG_PATTERN = /^(\d{13})\t(\S*(?:addons|extensions)\S*)\t([A-Z]+)\t(.*)\n?$/i;
var ANDROID_EMULATOR_LOG_PATTERN = /^\[([0-9\-\A-Z:]+)\](?:\s+\[[A-Z]+\]\s+[A-Z]{1}\/[a-z0-9\/\._]+\s*(?:\[[^\]]+\])?\(\s+\d+\)\:\s+)?(?:\-+\s+beginning\s+of\s+[a-z]+)?(.*)$/i;
var ANDROID_EMULATOR_BROWSER_MESSAGE_PATTERN = /^\[([0-9\-\A-Z:]+)\]\s+\[[A-Z]+\]\s+I\/chromium\(\s+\d+\)\:\s+\[([A-Z]+)\:CONSOLE\(\d+\)\]\s+\"(.*)",\s+source\:\s+(\S*)\s+\((\d+)\)$/i;

var IGNORED_LOGS = [
// useful hints from Firefox, we don't need them to be printed
'Using //@ to indicate sourceURL pragmas is deprecated', 'Using //@ to indicate sourceMappingURL pragmas is deprecated', 'Use of getPreventDefault() is deprecated', 'Use of Mutation Events is deprecated', 'Empty string passed to getElementById()', 'Use of attributes\' nodeValue attribute is deprecated', 'This site makes use of a SHA-1 Certificate', 'Use of getAttributeNode() is deprecated', 'mutating the [[Prototype]] of an object', 'Synchronous XMLHttpRequest on the main thread is deprecated', 'An unbalanced tree was written using document.write() causing data from the network to be reparsed', 'HTMLVideoElement.webkitSupportsFullscreen is deprecated', 'Expected \',\' in media list but found', 'Expected \',\' in media list but found', 'Unexpected end of file while searching for closing } of invalid rule set', 'Property contained reference to invalid variable', 'Only application manifests may use', 'Get a connection to permissions.sqlite.', 'DB table(moz_perms) is created', 'Browser.SelfSupportBackend',
// CSS related
'Declaration dropped', 'Ruleset ignored due to bad selector', 'Expected declaration but found', 'Expected media feature name but found', 'Unrecognized at-rule', 'Keyframe rule ignored due to bad selector',
// addons stuff
'Could not read chrome manifest', 'blocklist is disabled', 'Trying to re-register CID', 'chrome-extension://', 'resource://', 'Native module at path', 'Failed to load native module at path', 'Component returned failure code', 'While registering XPCOM module', 'addons.xpi:',
// just useless here
'server does not support RFC 5746, see CVE-2009-3555', 'Mixed Content', 'downloadable font', 'Unexpected end of file while searching for end of @media, @supports or @-moz-document rule', 'Blocked loading mixed active content', 'The character encoding of the HTML document was not declared', 'A call to document.write() from an asynchronously-loaded external script was ignored', 'Failed to execute \'write\' on \'Document\'', 'Password fields present on an insecure (http://) page', 'Password fields present in a form with an insecure (http://) form action', 'WebGL: Error during native OpenGL init', 'WebGL: WebGL creation failed', 'to start media query expression but found', 'The page was reloaded, because the character encoding declaration of the HTML document was not found when prescanning the first 1024 bytes of the file', 'Refused to set unsafe header', 'The character encoding of a framed document was not declared', 'While creating services from category', 'unrecognized command line flag'];

/**
 * @type {Object} BrowserLog
 * @property {String} message
 * @property {String} level
 * @property {Number} timestamp
 * @property {Boolean} addon - indicates if log is from browser addon (sadly,
 *   it's not 100% reliable, because it can't be - just an estimation)
 * @property {String} [file] - path to file from which log was made
 * @property {String} [line] - line in file in which log was made
 */

/**
 * @function parse
 * @access public
 * @description standarize format of single log gathered from the browser
 *
 * @param {Object} log
 *   @property {String} message
 *   @property {String} [level] - not present for some browsers
 *   @property {Number} [timestamp] - not present for some browsers
 *
 * @returns {BrowserLog} standarized log
 */

function parse(log) {
  // parse logs from Firefox addons
  var addonLog = log.message.match(_get__('FIREFOX_ADDON_LOG_PATTERN'));
  if (addonLog) {
    return {
      addon: true,
      timestamp: addonLog[1],
      level: addonLog[3].toUpperCase(),
      message: addonLog[2] + ': ' + addonLog[4]
    };
  }

  // parse logs from Chrome
  var chromeLogMessage = log.message.match(_get__('CHROME_LOG_PATTERN'));
  if (chromeLogMessage) {
    return {
      addon: chromeLogMessage[1].indexOf('chrome-extension://') === 0,
      timestamp: log.timestamp,
      level: log.level.toUpperCase(),
      file: _get__('_formatUrl')(chromeLogMessage[1]),
      line: chromeLogMessage[2],
      message: chromeLogMessage[3]
    };
  }

  // parse logs from Android emulator
  if (log.message.match(_get__('ANDROID_EMULATOR_LOG_PATTERN'))) {
    var androidEmulatorBrowserMessage = log.message.match(_get__('ANDROID_EMULATOR_BROWSER_MESSAGE_PATTERN'));
    // log can contain message from browser, which has to be extracted
    if (androidEmulatorBrowserMessage) {
      return {
        addon: false,
        timestamp: Date.parse(androidEmulatorBrowserMessage[1]),
        level: androidEmulatorBrowserMessage[2],
        file: androidEmulatorBrowserMessage[4] ? _get__('_formatUrl')(androidEmulatorBrowserMessage[4]) : '',
        line: androidEmulatorBrowserMessage[5],
        message: androidEmulatorBrowserMessage[3]
      };
    } else {
      return null;
    }
  }

  // try to parse custom logs where message is stringified object
  var parsed = undefined;
  try {
    parsed = JSON.parse(log.message);
  } catch (err) {}

  if (parsed && _get__('is')(Object, parsed.message)) {
    return {
      timestamp: Math.round(parsed.message.timestamp * 1000),
      level: parsed.message.level.toUpperCase(),
      file: _get__('_formatUrl')(parsed.message.url),
      line: parsed.message.line + ':' + parsed.message.column,
      message: parsed.message.text
    };
  }
}

/**
 * @function isIgnored
 * @access public
 * @description judge if log should be ignored
 *
 * @param {BrowserLog} log
 *
 * @returns {Boolean} true if log should be ignored
 */
function isIgnored(log) {
  return log.addon || _get__('contains')(log.message)(_get__('IGNORED_LOGS'));
}

/**
 * @constant {Object} byName
 * @access public
 * @description map from log level name to its numeric value
 */
var byName = exports.byName = {
  'SEVERE': 1100,
  'ERROR': 1000,
  'WARNING': 900,
  'LOG': 800,
  'INFO': 800, // this one is prefered name for log level 800!
  'DEBUG': 700
};

/**
 * @constant {Object} byValue
 * @access public
 * @description map from log level numeric value to its name
 */
var byValue = exports.byValue = _get__('invertObj')(_get__('byName'));

/**
 * @function _formatUrl
 * @access private
 * @description keep only the most important parts of URL
 *
 * @param {String} url
 *
 * @return {String} formatted URL
 */
function _formatUrl(url) {
  var _get__2 = _get__('parseUrl')(url);

  var protocol = _get__2.protocol;
  var hostname = _get__2.hostname;
  var port = _get__2.port;
  var pathname = _get__2.pathname;

  return [protocol ? protocol + '//' : '', hostname, port && port !== 80 ? ':' + port : '', pathname].join('');
}
var _RewiredData__ = {};

function _get__(variableName) {
  return _RewiredData__ === undefined || _RewiredData__[variableName] === undefined ? _get_original__(variableName) : _RewiredData__[variableName];
}

function _get_original__(variableName) {
  switch (variableName) {
    case 'FIREFOX_ADDON_LOG_PATTERN':
      return FIREFOX_ADDON_LOG_PATTERN;

    case 'CHROME_LOG_PATTERN':
      return CHROME_LOG_PATTERN;

    case '_formatUrl':
      return _formatUrl;

    case 'ANDROID_EMULATOR_LOG_PATTERN':
      return ANDROID_EMULATOR_LOG_PATTERN;

    case 'ANDROID_EMULATOR_BROWSER_MESSAGE_PATTERN':
      return ANDROID_EMULATOR_BROWSER_MESSAGE_PATTERN;

    case 'is':
      return _ramda.is;

    case 'contains':
      return _ramda.contains;

    case 'IGNORED_LOGS':
      return IGNORED_LOGS;

    case 'invertObj':
      return _ramda.invertObj;

    case 'byName':
      return byName;

    case 'parseUrl':
      return _url.parse;
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