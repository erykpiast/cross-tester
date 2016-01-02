'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.name = undefined;
exports.getConcurrencyLimit = getConcurrencyLimit;
exports.createTest = createTest;
exports.parseBrowser = parseBrowser;

var _browserstackWebdriver = require('browserstack-webdriver');

var _browserstackWebdriver2 = _interopRequireDefault(_browserstackWebdriver);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _url = require('url');

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _lodash = require('lodash');

var _systemBrowsers = require('../system-browsers');

var osVersionForBrowser = _interopRequireWildcard(_systemBrowsers);

var _osxVersions = require('../osx-versions');

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
'Could not read chrome manifest', 'blocklist is disabled', 'Trying to re-register CID', 'chrome-extension://', 'resource://', 'Native module at path', 'Failed to load native module at path', 'Component returned failure code', 'While registering XPCOM module',
// Facebook script
'Invalid App Id: Must be a number or numeric string representing the application id.', 'The "fb-root" div has not been created, auto-creating', 'FB.getLoginStatus() called before calling FB.init().', 'FB.init has already been called - this could indicate a problem',
// SalesManago
'app2.salesmanago.pl', 'Displaying ad:', 'No slot for:', 'SM AP:',
// Qualtrics
'Please remove it from your site or contact your Qualtrics Administrator',
// just useless here
'server does not support RFC 5746, see CVE-2009-3555', 'Mixed Content', 'downloadable font', 'Unexpected end of file while searching for end of @media, @supports or @-moz-document rule', 'Blocked loading mixed active content', 'The character encoding of the HTML document was not declared', 'A call to document.write() from an asynchronously-loaded external script was ignored', 'Failed to execute \'write\' on \'Document\'', 'Password fields present on an insecure (http://) page', 'Password fields present in a form with an insecure (http://) form action', 'WebGL: Error during native OpenGL init', 'WebGL: WebGL creation failed', 'to start media query expression but found', 'The page was reloaded, because the character encoding declaration of the HTML document was not found when prescanning the first 1024 bytes of the file', 'Refused to set unsafe header', 'The character encoding of a framed document was not declared', 'While creating services from category', 'unrecognized command line flag', 'Only application manifests may use', 'Get a connection to permissions.sqlite.', 'DB table(moz_perms) is created', 'Browser.SelfSupportBackend', 'Invalid CSS'];

var RESULTS_ARRAY_NAME = 'window.__results__';

var DEFAULT_TIMEOUT = 300 * 1000;
var chromeLogMessagePattern = /^(javascript|(?:(?:https?|chrome-extension)\:\/\/\S+))\s+(\d+:\d+)\s+(.*)$/i;
var firefoxAddonLogPattern = /^(\d{13})\t(\S*(?:addons|extensions)\S*)\t([A-Z]+)\t(.*)\n?$/i;
var androidEmulatorLogMessagePattern = /^\[([0-9\-\A-Z:]+)\](?:\s+\[[A-Z]+\]\s+[A-Z]{1}\/[a-z0-9\/\._]+\s*(?:\[[^\]]+\])?\(\s+\d+\)\:\s+)?(?:\-+\s+beginning\s+of\s+[a-z]+)?(.*)$/i;
var androidEmulatorLogBrowserMessagePattern = /^\[([0-9\-\A-Z:]+)\]\s+\[[A-Z]+\]\s+I\/chromium\(\s+\d+\)\:\s+\[([A-Z]+)\:CONSOLE\(\d+\)\]\s+\"(.*)",\s+source\:\s+(\S*)\s+\((\d+)\)$/i;

var name = exports.name = 'browserstack';

/**
 * @function getConcurrencyLimit - returns concurrency limit for the account
 *
 * @param {String} userName
 * @param {String} accessToken
 *
 * @return {Promise<Number>} number of available concurrent VMs for the account
 */
function getConcurrencyLimit(userName, accessToken) {
  var API_ROOT = 'https://www.browserstack.com/';
  return (0, _requestPromise2.default)(API_ROOT + 'automate/plan.json', {
    auth: {
      user: userName,
      pass: accessToken,
      sendImmediately: false
    }
  }).then(function (res) {
    var parsed = JSON.parse(res);
    return parseInt(parsed.parallel_sessions_max_allowed, 0);
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
      driver = new _browserstackWebdriver2.default.Builder().usingServer('http://hub.browserstack.com/wd/hub').withCapabilities((0, _lodash.assign)({}, browser, {
        'browserstack.user': userName,
        'browserstack.key': accessToken,
        'loggingPrefs': { 'browser': 'ALL' }
      })).build();

      return _bluebird2.default.race([_bluebird2.default.delay(DEFAULT_TIMEOUT).then(function () {
        throw new Error('cannot connect to SauceLabs in ' + DEFAULT_TIMEOUT + ' ms');
      }), driver.session_.then(function (session) {
        return session;
      }, function (err) {
        if (err.message.match(/(Browser_Version not supported)|(Browser combination invalid)/)) {
          throw new Error('browser ' + browser.browserName + ' ' + browser.version + ' is not supported (' + err.message + ')');
        } else {
          throw err;
        }
      })]);

      // maybe we can use this?
      // wd.configureHttp({
      //   timeout: 10000,
      //   retries: 3,
      //   retryDelay: 100
      // });
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
    var logger = new _browserstackWebdriver2.default.WebDriver.Logs(driver);

    return function () {
      return logger.getAvailableLogTypes().then(function (types) {
        return Array.isArray(types) && types.indexOf('browser') !== -1 ? logger.get('browser') : _bluebird2.default.resolve([]);
      }, function () {
        return [];
      } // supress error
      ).then(function (logs) {
        return browserLogs = browserLogs.concat(logs);
      }, function (err) {
        if (/Command not found|not implemented/.test(err.message)) {
          return browserLogs;
        }

        throw err;
      }).then(function (logs) {
        var notGot = logs.slice(browserLogsGot);

        browserLogsGot = logs.length;

        return notGot.filter(function (log) {
          return levels[log.level.name].value >= level;
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
      return driver.executeScript('try {\n        return JSON.stringify(' + RESULTS_ARRAY_NAME + ');\n      } catch(err) {\n        return ' + RESULTS_ARRAY_NAME + ';\n      }').then(function (jsonOrNot) {
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
      return driver.executeScript(code);
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
      }), driver.get(url).then(execute(RESULTS_ARRAY_NAME + ' = ' + RESULTS_ARRAY_NAME + ' || [];'))]);
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
 *    - for Appium (mobile browsers)
 *   @property {String} browserName
 *   @property {String} version
 *   @property {String} platform
 *   @property {String} device
 *    - for Selenium (desktop browsers)
 *   @property {String} browser
 *   @property {String} browser_version
 *   @property {String} os
 *   @property {String} os_version
 */
function parseBrowser(browser, displayName) {
  var browserName = ({
    'microsoft edge': 'Edge',
    'edge': 'Edge',
    'ie': 'IE',
    'internet explorer': 'IE',
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
    'mac': 'OS X',
    'android': 'ANDROID',
    'ios': 'MAC'
  })[browser.os.toLowerCase()] || browser.os;

  var osVersion = osName === 'MAC' ? _osxVersions.numberToName[browser.osVersion.toLowerCase()] : browser.osVersion;

  var appium = false;
  var deviceName = (browser.device || '').toLowerCase();
  if (browserName === 'Safari' && ['iphone', 'ipad'].indexOf((deviceName || '').split(' ')[0]) !== -1) {
    // Safari on iOS
    browserName = 'iPad';
    appium = true;

    // find device based on OS version
    // general names like iPhone or iPad are not enough too
    if ((!deviceName || deviceName === 'iphone' || deviceName === 'ipad') && browser.osVersion) {
      if (deviceName === 'iphone') {
        deviceName = ({
          '8': 'iPhone 6',
          '8.3': 'iPhone 6',
          '7': 'iPhone 5S',
          '6': 'iPhone 5',
          '5.1': 'iPhone 4S',
          '5': 'iPhone 4S'
        })[browser.osVersion.toLowerCase().replace(/\.0$/, '')];
      } else {
        deviceName = ({
          '8': 'iPad Air',
          '8.3': 'iPad Air',
          '7': 'iPad 4th',
          '6': 'iPad 3rd (6.0)',
          '5.1': 'iPad 3rd',
          '5': 'iPad 2 (5.0)'
        })[browser.osVersion.toLowerCase().replace(/\.0$/, '')];
      }
    }
  } else if (browserName === 'Android') {
    // Android Browser
    appium = true;

    // find device based on OS version
    if (!deviceName && browser.osVersion) {
      deviceName = ({
        '5': 'Google Nexus 5',
        'lollipop': 'Google Nexus 5',
        '4.4': 'Samsung Galaxy S5',
        'kitkat': 'Samsung Galaxy S5',
        '4.3': 'Samsung Galaxy S4',
        'jelly bean': 'Samsung Galaxy S4',
        '4.2': 'Google Nexus 4',
        '4.1': 'Samsung Galaxy S3',
        '4': 'Google Nexus',
        'ice cream sandwich': 'Google Nexus'
      })[browser.osVersion.toLowerCase().replace(/\.0$/, '')];
    }
  }

  if (!osVersion) {
    if (osName === 'Windows' && browserName === 'Internet Explorer') {
      osVersion = osVersionForBrowser.ie[browser.version];
    }

    if (osName === 'Windows' && browserName === 'MicrosoftEdge') {
      osVersion = osVersionForBrowser.edge[browser.version];
    }

    if (osName === 'OS X' && browserName === 'Safari') {
      osVersion = osVersionForBrowser.safari[browser.version];
      osVersion = _osxVersions.numberToName[osVersion] || osVersion;
    }
  }

  var config = {
    name: 'CrossTester - ' + displayName
  };

  if (appium) {
    (0, _lodash.assign)(config, {
      browserName: browserName,
      device: deviceName,
      platform: browserName === 'iPad' ? 'MAC' : 'ANDROID'
    });
  } else {
    (0, _lodash.assign)(config, {
      browser: browserName,
      browser_version: browser.version,
      os: osName,
      os_version: osVersion
    });
  }

  return config;
}