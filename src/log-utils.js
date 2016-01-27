import {
  any,
  compose,
  contains,
  flip,
  invertObj,
  is
} from 'ramda';
import { parse as parseUrl } from 'url';

const NETWORK_LOG_PATTERN = /^(\S+)(?:\s+)(\d+):(\d+)(.*)$/i;
const CONSOLE_LOG_PATTERN = /^(?:console-api\s+)(\d+)\:(\d+)(?:\s+)(.*)$/i;
const CHROME_LOG_PATTERN = /^(javascript|(?:(?:https?|chrome-extension)\:\/\/\S+))\s+(\d+:\d+)\s+(.*)$/i;
const FIREFOX_ADDON_LOG_PATTERN = /^(\d{13})\t(\S*(?:addons|extensions)\S*)\t([A-Z]+)\t(.*)\n?$/i;
const ANDROID_EMULATOR_LOG_PATTERN = /^\[([0-9\-\A-Z:]+)\](?:\s+\[[A-Z]+\]\s+[A-Z]{1}\/[a-z0-9\/\._]+\s*(?:\[[^\]]+\])?\(\s+\d+\)\:\s+)?(?:\-+\s+beginning\s+of\s+[a-z]+)?(.*)$/i;
const ANDROID_EMULATOR_BROWSER_MESSAGE_PATTERN = /^\[([0-9\-\A-Z:]+)\]\s+\[[A-Z]+\]\s+I\/chromium\(\s+\d+\)\:\s+\[([A-Z]+)\:CONSOLE\(\d+\)\]\s+\"(.*)",\s+source\:\s+(\S*)\s+\((\d+)\)$/i;

// disable until eslint doesnt understand that backticks are allowed (es6 env seems
// to not work)
/* eslint-disable quotes */
const IGNORED_LOGS = [
  // useful hints from Firefox, we don't need them to be printed
  'Using //@ to indicate sourceURL pragmas is deprecated',
  'Using //@ to indicate sourceMappingURL pragmas is deprecated',
  'Use of getPreventDefault() is deprecated',
  'Use of Mutation Events is deprecated',
  'Empty string passed to getElementById()',
  `Use of attributes' nodeValue attribute is deprecated`,
  'This site makes use of a SHA-1 Certificate',
  'Use of getAttributeNode() is deprecated',
  'mutating the [[Prototype]] of an object',
  'Synchronous XMLHttpRequest on the main thread is deprecated',
  'An unbalanced tree was written using document.write() causing data from the network to be reparsed',
  'HTMLVideoElement.webkitSupportsFullscreen is deprecated',
  `Expected ',' in media list but found`,
  `Expected ',' in media list but found`,
  'Unexpected end of file while searching for closing } of invalid rule set',
  'Property contained reference to invalid variable',
  'Only application manifests may use',
  'Get a connection to permissions.sqlite.',
  'DB table(moz_perms) is created',
  'Browser.SelfSupportBackend',
  // CSS related
  'Declaration dropped',
  'Ruleset ignored due to bad selector',
  'Expected declaration but found',
  'Expected media feature name but found',
  'Unrecognized at-rule',
  'Keyframe rule ignored due to bad selector',
  'Invalid CSS property name',
  'Invalid CSS property value',
  'Invalid CSS media query',
  // addons stuff
  'Could not read chrome manifest',
  'blocklist is disabled',
  'Trying to re-register CID',
  'chrome-extension://',
  'resource://',
  'Native module at path',
  'Failed to load native module at path',
  'Component returned failure code',
  'While registering XPCOM module',
  'to preference extensions',
  'addons.xpi:',
  // just useless here
  'server does not support RFC 5746, see CVE-2009-3555',
  'Mixed Content',
  'downloadable font',
  'Unexpected end of file while searching for end of @media, @supports or @-moz-document rule',
  'Blocked loading mixed active content',
  'The character encoding of the HTML document was not declared',
  'A call to document.write() from an asynchronously-loaded external script was ignored',
  `Failed to execute 'write' on 'Document'`,
  'Password fields present on an insecure (http://) page',
  'Password fields present in a form with an insecure (http://) form action',
  'WebGL: Error during native OpenGL init',
  'WebGL: WebGL creation failed',
  'to start media query expression but found',
  'The page was reloaded, because the character encoding declaration of the HTML document was not found when prescanning the first 1024 bytes of the file',
  'Refused to set unsafe header',
  'The character encoding of a framed document was not declared',
  'While creating services from category',
  'unrecognized command line flag',
  'OpenGL compositor Initialized Succesfully',
  // network errors
  'Failed to load resource'
];
/* eslint-enable quotes */

/**
 * @function insideIgnoredLogs
 * @access private
 * @description checks if passed message contain any message from IGNORED_LOGS
 *   collection
 *
 * @param {String} message
 *
 * @return {Boolean}
 */
const insideIgnoredLogs = compose(flip(any)(IGNORED_LOGS), flip(contains));


/**
 * @type {Object} BrowserLog
 * @property {String} message
 * @property {String} level - name of log level
 * @property {Number} timestamp
 * @property {Boolean} addon - indicates if log is from browser addon (sadly,
 *   it's not 100% reliable, because it can't be - just an estimation)
 * @property {String} [file] - path to file from which log was made
 * @property {String} [line] - line in file in which log was made
 */


/**
 * @type {Object} Log
 * @property {String} message
 * @property {String} level - name of log level
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

export function parse(log) {
  // parse logs from Firefox addons
  const addonLog = log.message.match(FIREFOX_ADDON_LOG_PATTERN);
  if(addonLog) {
    return {
      addon: true,
      timestamp: addonLog[1],
      level: addonLog[3].toUpperCase(),
      message: `${addonLog[2]}: ${addonLog[4]}`.trim()
    };
  }

  // parse some console.logs
  const consoleLogMessage = log.message.match(CONSOLE_LOG_PATTERN);
  if(consoleLogMessage) {
    return {
      addon: false,
      timestamp: log.timestamp,
      level: log.level.toUpperCase(),
      file: undefined,
      line: consoleLogMessage[1],
      message: consoleLogMessage[3].trim()
    };
  }

  // parse network logs
  const networkLogMessage = log.message.match(NETWORK_LOG_PATTERN);
  if(networkLogMessage) {
    return {
      addon: false,
      timestamp: log.timestamp,
      level: log.level.toUpperCase(),
      file: networkLogMessage[1],
      line: networkLogMessage[2],
      message: networkLogMessage[4].trim()
    };
  }

  // parse logs from Chrome
  const chromeLogMessage = log.message.match(CHROME_LOG_PATTERN);
  if(chromeLogMessage) {
    return {
      addon: chromeLogMessage[1].indexOf('chrome-extension://') === 0,
      timestamp: log.timestamp,
      level: log.level.toUpperCase(),
      file: _formatUrl(chromeLogMessage[1]),
      line: chromeLogMessage[2],
      message: chromeLogMessage[3].trim()
    };
  }

  // parse logs from Android emulator
  if(log.message.match(ANDROID_EMULATOR_LOG_PATTERN)) {
    const androidEmulatorBrowserMessage = log.message.match(ANDROID_EMULATOR_BROWSER_MESSAGE_PATTERN);
    // log can contain message from browser, which has to be extracted
    if(androidEmulatorBrowserMessage) {
      return {
        addon: false,
        timestamp: Date.parse(androidEmulatorBrowserMessage[1]),
        level: androidEmulatorBrowserMessage[2],
        file: androidEmulatorBrowserMessage[4] ? _formatUrl(androidEmulatorBrowserMessage[4]) : '',
        line: androidEmulatorBrowserMessage[5],
        message: androidEmulatorBrowserMessage[3].trim()
      };
    } else {
      return null;
    }
  }

  // try to parse custom logs where message is stringified object
  let parsed;
  try {
    parsed = JSON.parse(log.message);
  } catch(err) { }

  if(parsed && is(Object, parsed.message)) {
    return {
      timestamp: Math.round(parsed.message.timestamp * 1000),
      level: parsed.message.level.toUpperCase(),
      file: _formatUrl(parsed.message.url),
      line: `${parsed.message.line}:${parsed.message.column}`,
      message: parsed.message.text.trim()
    };
  }

  return log;
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
export function isIgnored(log) {
  return log.addon || insideIgnoredLogs(log.message);
}


/**
 * @constant {Object} byName
 * @access public
 * @description map from log level name to its numeric value
 */
export const byName = {
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
export const byValue = invertObj(byName);


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
  const { protocol, hostname, port, pathname } = parseUrl(url);

  return [
    protocol ? `${protocol}//` : '',
    hostname,
    port && (port !== 80) ? `:${port}` : '',
    pathname
  ].join('');
}