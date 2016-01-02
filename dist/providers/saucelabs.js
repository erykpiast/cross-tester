'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.name = undefined;
exports.getConcurrencyLimit = getConcurrencyLimit;
exports.createTest = createTest;
exports.parseBrowser = parseBrowser;

var _wd = require('wd');

var _wd2 = _interopRequireDefault(_wd);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _url = require('url');

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _lodash = require('lodash');

var _systemBrowsers = require('../system-browsers');

var osVersionForBrowser = _interopRequireWildcard(_systemBrowsers);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }
// it's soo cool to override globals! (yes, Promise is one for some time)

var levels = {
  'SEVERE': {
    value: 1100,
    color: 'red'
  },
  'ERROR': {
    value: 1000,
    color: 'red'
  },
  'WARNING': {
    value: 900,
    color: 'yellow'
  },
  'INFO': {
    value: 800,
    color: 'cyan'
  },
  'LOG': {
    value: 800,
    color: 'cyan'
  },
  'DEBUG': {
    value: 700,
    color: 'magenta'
  }
};

var ignoredLogs = [
// useful hints from Firefox, we don't need them to be printed
'Using //@ to indicate sourceURL pragmas is deprecated', 'Using //@ to indicate sourceMappingURL pragmas is deprecated', 'Use of getPreventDefault() is deprecated', 'Use of Mutation Events is deprecated', 'Empty string passed to getElementById()', 'Use of attributes\' nodeValue attribute is deprecated', 'This site makes use of a SHA-1 Certificate', 'Use of getAttributeNode() is deprecated', 'mutating the [[Prototype]] of an object will cause your code to run very slowly', 'Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user\'s experience', 'An unbalanced tree was written using document.write() causing data from the network to be reparsed', 'HTMLVideoElement.webkitSupportsFullscreen\' is deprecated', 'Expected ,\' in media list but found \'screen', 'Expected \',\' in media list but found \'and(\'', 'Unexpected end of file while searching for closing } of invalid rule set', 'Property contained reference to invalid variable',
// CSS related
'Declaration dropped', 'Ruleset ignored due to bad selector', 'Expected declaration but found', 'Expected media feature name but found', 'Unrecognized at-rule', 'Keyframe rule ignored due to bad selector',
// addons stuff
'Could not read chrome manifest', 'blocklist is disabled', 'Trying to re-register CID', 'chrome-extension://', 'resource://', 'Native module at path', 'Failed to load native module at path', 'Component returned failure code', 'While registering XPCOM module', 'addons.xpi:',
// Facebook script
'Invalid App Id: Must be a number or numeric string representing the application id.', 'The "fb-root" div has not been created, auto-creating', 'FB.getLoginStatus() called before calling FB.init().', 'FB.init has already been called - this could indicate a problem',
// SalesManago
'app2.salesmanago.pl', 'Displaying ad:', 'No slot for:', 'SM AP:',
// Qualtrics
'Please remove it from your site or contact your Qualtrics Administrator',
// just useless here
'server does not support RFC 5746, see CVE-2009-3555', 'Mixed Content', 'downloadable font', 'Unexpected end of file while searching for end of @media, @supports or @-moz-document rule', 'Blocked loading mixed active content', 'The character encoding of the HTML document was not declared', 'A call to document.write() from an asynchronously-loaded external script was ignored', 'Failed to execute \'write\' on \'Document\'', 'Password fields present on an insecure (http://) page', 'Password fields present in a form with an insecure (http://) form action', 'WebGL: Error during native OpenGL init', 'WebGL: WebGL creation failed', 'to start media query expression but found', 'The page was reloaded, because the character encoding declaration of the HTML document was not found when prescanning the first 1024 bytes of the file', 'Refused to set unsafe header', 'The character encoding of a framed document was not declared', 'While creating services from category', 'unrecognized command line flag', 'Only application manifests may use', 'Get a connection to permissions.sqlite.', 'DB table(moz_perms) is created', 'Browser.SelfSupportBackend'];

var RESULTS_ARRAY_NAME = 'window.__results__';

var DEFAULT_TIMEOUT = 300 * 1000;
var chromeLogMessagePattern = /^(javascript|(?:(?:https?|chrome-extension)\:\/\/\S+))\s+(\d+:\d+)\s+(.*)$/i;
var firefoxAddonLogPattern = /^(\d{13})\t(\S*(?:addons|extensions)\S*)\t([A-Z]+)\t(.*)\n?$/i;
var androidEmulatorLogMessagePattern = /^\[([0-9\-\A-Z:]+)\](?:\s+\[[A-Z]+\]\s+[A-Z]{1}\/[a-z0-9\/\._]+\s*(?:\[[^\]]+\])?\(\s+\d+\)\:\s+)?(?:\-+\s+beginning\s+of\s+[a-z]+)?(.*)$/i;
var androidEmulatorLogBrowserMessagePattern = /^\[([0-9\-\A-Z:]+)\]\s+\[[A-Z]+\]\s+I\/chromium\(\s+\d+\)\:\s+\[([A-Z]+)\:CONSOLE\(\d+\)\]\s+\"(.*)",\s+source\:\s+(\S*)\s+\((\d+)\)$/i;

var name = exports.name = 'saucelabs';

/**
 * @function getConcurrencyLimit - returns concurrency limit for the account
 *
 * @param {String} userName
 * @param {String} accessToken
 *
 * @return {Promise<Number>} number of available concurrent VMs for the account
 */
function getConcurrencyLimit(userName, accessToken) {
  var API_ROOT = 'https://saucelabs.com/rest/v1/';
  return (0, _requestPromise2.default)(API_ROOT + ('users/' + userName + '/concurrency'), {
    auth: {
      user: userName,
      pass: accessToken,
      sendImmediately: false
    }
  }).then(function (res) {
    var parsed = JSON.parse(res);
    return parseInt(parsed.concurrency[userName].remaining.mac, 0);
  });
}

/**
 * @function createTest - creates testing session in single browser
 *
 * @param {Object} browser - browser definition object
 *   @property {String} name - display name
 *   @property {String} browserName - browser name in BS
 *   @property {String} platform - platform name in BS
 * @param {String} userName
 * @param {String} accessToken
 *
 * @return {Object} testing session object
 */
function createTest(browser, userName, accessToken) {
  var driver = undefined;
  var browserLogs = [];
  var browserLogsGot = 0;

  function enter() {
    return function () {
      driver = _wd2.default.remote({
        hostname: 'ondemand.saucelabs.com',
        port: 80,
        user: userName,
        pwd: accessToken
      }, 'promise');

      // maybe we can use this?
      // wd.configureHttp({
      //   timeout: 10000,
      //   retries: 3,
      //   retryDelay: 100
      // });
      return _bluebird2.default.race([_bluebird2.default.delay(DEFAULT_TIMEOUT).then(function () {
        throw new Error('cannot connect to SauceLabs in ' + DEFAULT_TIMEOUT + ' ms');
      }), driver.init(browser).then(function (_session_) {
        return _session_[1];
      }, function (err) {
        if (err.message.match(/(The environment you requested was unavailable)|(Browser combination invalid)/)) {
          throw new Error('browser ' + browser.browserName + ' ' + browser.version + ' is not supported (' + err.message + ')');
        } else {
          throw err;
        }
      })]);
    };
  }

  function _formatUrl(url) {
    var _parseUrl = (0, _url.parse)(url);

    var protocol = _parseUrl.protocol;
    var hostname = _parseUrl.hostname;
    var port = _parseUrl.port;
    var pathname = _parseUrl.pathname;

    return [protocol ? protocol + '//' : '', hostname, port && port !== 80 ? ':' + port : '', pathname].join('');
  }

  function getBrowserLogs(levelName) {
    var level = (levels[levelName] || { value: 0 }).value || levels.INFO.value;

    return function () {
      return driver.logTypes().then(function (types) {
        return Array.isArray(types) && types.indexOf('browser') !== -1 ? driver.log('browser') : _bluebird2.default.resolve([]);
      }, function () {
        return [];
      } // supress error
      ).then(function (logs) {
        return browserLogs = browserLogs.concat(logs);
      }).then(function (logs) {
        var notGot = logs.slice(browserLogsGot);

        browserLogsGot = logs.length;

        return notGot.filter(function (log) {
          return levels[log.level].value >= level;
        });
      }).then(function (logs) {
        return(
          // parse Firefox logs from addons and Chrome logs
          logs.map(function (log) {
            // parse logs from Firefox addons
            var addonLog = log.message.match(firefoxAddonLogPattern);
            if (addonLog) {
              return {
                addon: true,
                timestamp: addonLog[1],
                level: addonLog[3],
                message: addonLog[2] + ': ' + addonLog[4]
              };
            }

            // parse logs from Chrome
            var chromeLogMessage = log.message.match(chromeLogMessagePattern);
            if (chromeLogMessage) {
              return {
                addon: chromeLogMessage[1].indexOf('chrome-extension://') === 0,
                timestamp: log.timestamp,
                level: log.level,
                file: _formatUrl(chromeLogMessage[1]),
                line: chromeLogMessage[2],
                message: chromeLogMessage[3]
              };
            }

            // parse logs from Android emulator
            if (log.message.match(androidEmulatorLogMessagePattern)) {
              var androidEmulatorBrowserMessage = log.message.match(androidEmulatorLogBrowserMessagePattern);
              if (androidEmulatorBrowserMessage) {
                return {
                  addon: false,
                  timestamp: Date.parse(androidEmulatorBrowserMessage[1]),
                  level: androidEmulatorBrowserMessage[2],
                  file: androidEmulatorBrowserMessage[4] ? _formatUrl(androidEmulatorBrowserMessage[4]) : '',
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

            if (parsed && 'object' === _typeof(parsed.message) && parsed.message !== null) {
              return {
                timestamp: Math.round(parsed.message.timestamp * 1000),
                level: parsed.message.level,
                file: _formatUrl(parsed.message.url),
                line: parsed.message.line + ':' + parsed.message.column,
                message: parsed.message.text
              };
            }

            return log;
          }).filter(function (log) {
            return !log.addon;
          }).filter(function (log) {
            return !ignoredLogs.some(function (messageToIgnore) {
              return log.message.indexOf(messageToIgnore) > -1;
            });
          })
        );
      }).then(function (logs) {
        return browserLogs = logs;
      });
    };
  }

  function getResults() {
    // it more safe to send stringified results through WD and parse it here
    // ex. MS Edge likes return arrays as object with numeric keys
    // on the other hand, strngification fails in IE 9, so we need a fallback
    return function () {
      return driver.execute('try {\n        return JSON.stringify(' + RESULTS_ARRAY_NAME + ');\n      } catch(err) {\n        return ' + RESULTS_ARRAY_NAME + ';\n      }').then(function (jsonOrNot) {
        try {
          return JSON.parse(jsonOrNot);
        } catch (err) {
          return jsonOrNot;
        }
      });
    };
  }

  function execute(code) {
    return function () {
      return driver.safeExecute(code);
    };
  }

  function sleep(time) {
    return function () {
      return driver.sleep(time);
    };
  }

  function open(url) {
    return function () {
      return _bluebird2.default.race([_bluebird2.default.delay(DEFAULT_TIMEOUT).then(function () {
        throw new Error('cannot open page ' + url + ' in ' + DEFAULT_TIMEOUT + ' ms');
      }), driver.get(url).then(execute(RESULTS_ARRAY_NAME + ' = [];'))]);
    };
  }

  function quit() {
    return function () {
      return driver.quit();
    };
  }

  return {
    enter: enter,
    quit: quit,
    open: open,
    getBrowserLogs: getBrowserLogs,
    getResults: getResults,
    execute: execute,
    sleep: sleep
  };
}

/**
 * @function parseBrowser - adapt browser definition object to format accepted
 *   by provider
 * @access public
 *
 * @param {Object} browser
 *   @property {String} name
 *   @property {String} version
 *   @property {String} os
 *   @property {String} osVersion
 *   @property {String} device
 * @param {String} displayName
 *
 * @return {Object}
 *   @property {String} name - human-readable test name
 *   @property {String} browserName
 *   @property {String} version
 *   @property {String} platform
 *   @property {String} device
 */
function parseBrowser(browser, displayName) {
  var browserName = ({
    'microsoft edge': 'MicrosoftEdge',
    'edge': 'MicrosoftEdge',
    'ie': 'internet explorer',
    'google chrome': 'chrome',
    'mozilla firefox': 'firefox',
    'ff': 'firefox',
    'apple safari': 'Safari',
    'ios safari': 'Safari',
    'safari mobile': 'Safari',
    'iphone': 'Safari',
    'ipad': 'Safari',
    'android browser': 'Android'
  })[browser.name.toLowerCase()] || browser.name;

  var osName = ({
    'win': 'Windows',
    'windows': 'Windows',
    'mac': 'OS X',
    'os x': 'OS X',
    'ios': 'iOS',
    'android': 'Android',
    'linux': 'Linux'
  })[browser.os.toLowerCase()] || browser.os;

  var osVersion = (({
    'OS X': {
      'Snow Leopard': '10.6',
      'Lion': '10.7',
      'Mountain Lion': '10.8',
      'Mavericks': '10.9',
      'Yosemite': '10.10',
      'El Capitan': '10.11'
    }
  })[osName] || {})[browser.osVersion.toLowerCase()] || browser.osVersion;

  var appium = false;
  var appiumLegacy = false;
  var deviceName = (browser.device || '').toLowerCase();
  if (browserName === 'Safari' && ['iphone', 'ipad'].indexOf((deviceName || '').split(' ')[0]) !== -1) {
    // Safari on iOS
    osName = 'iOS';
    appium = true;

    if (deviceName === 'iphone') {
      deviceName = 'iPhone Simulator';
    }

    if (deviceName === 'ipad') {
      deviceName = 'iPad Simulator';
    }
  } else if (browserName === 'Android') {
    // Android Browser
    osName = 'Android';
    appium = true;

    // find device based on OS version
    if (!deviceName) {
      deviceName = 'Android Emulator';
    }

    if (!osVersion) {
      osVersion = browser.version;
    }

    if (isNaN(parseFloat(osVersion, 10))) {
      // find numeric version by name
      osVersion = ({
        'lolipop': '5.1',
        'kitkat': '4.4',
        'jelly bean': '4.3',
        'ice cream sandwich': '4.0'
      })[osVersion.toLowerCase()];
    }

    // for some reason platform is different for older Androids
    if (parseFloat(osVersion, 10) < 4.4) {
      appiumLegacy = true;
    } else {
      browserName = 'Browser';
    }
  }

  var config = {
    name: 'CrossTester - ' + displayName
  };

  if (!osVersion) {
    if (osName === 'Windows' && browserName === 'Internet Explorer') {
      osVersion = osVersionForBrowser.ie[browser.version];
    }

    if (osName === 'Windows' && browserName === 'MicrosoftEdge') {
      osVersion = osVersionForBrowser.edge[browser.version];
    }

    if (osName === 'OS X' && browserName === 'Safari') {
      osVersion = osVersionForBrowser.safari[browser.version];
    }
  }

  if (appium) {
    (0, _lodash.assign)(config, {
      browserName: browserName,
      deviceOrientation: 'portrait',
      deviceName: deviceName
    });

    if (appiumLegacy) {
      (0, _lodash.assign)(config, {
        platform: 'Linux',
        version: osVersion
      });
    } else {
      (0, _lodash.assign)(config, {
        platformName: osName,
        platformVersion: osVersion,
        appiumVersion: '1.4.16'
      });
    }
  } else {
    (0, _lodash.assign)(config, {
      browserName: browserName,
      version: browser.version,
      platform: osName + (osVersion ? ' ' + osVersion : '')
    });
  }

  console.log(config);

  return config;
}