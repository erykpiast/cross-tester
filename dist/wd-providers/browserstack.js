'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ramda = require('ramda');

var _browserstackWebdriver = require('browserstack-webdriver');

var _browserstackWebdriver2 = _interopRequireDefault(_browserstackWebdriver);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _constants = require('../parse-browsers/constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var isUndefined = function isUndefined(v) {
  return 'undefined' === typeof v;
};

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

var BrowserStackProvider /*implements Provider*/ = function () {
  function BrowserStackProvider(userName, accessToken) {
    _classCallCheck(this, BrowserStackProvider);

    this._credentials = { userName: userName, accessToken: accessToken };
  }

  /**
   * @method init
   * @access public
   * @description initialize connection
   *
   * @param {BrowserDefinition} browser
   *
   * @return {Promise<String>} promise of session id
   */


  _createClass(BrowserStackProvider, [{
    key: 'init',
    value: function init(browser) {
      this._driver = new _browserstackWebdriver2.default.Builder().usingServer('http://hub.browserstack.com/wd/hub').withCapabilities(_extends({}, this.constructor.parseBrowser(browser), {
        'browserstack.user': this._credentials.userName,
        'browserstack.key': this._credentials.accessToken,
        'loggingPrefs': { 'browser': 'ALL' }
      })).build();
      this._logger = new _browserstackWebdriver2.default.WebDriver.Logs(this._driver);

      return this._driver.session_.then(_ramda.identity, function (err) {
        if (err.message.match(/(Browser_Version not supported)|(Browser combination invalid)/)) {
          throw new Error('requested browser is not supported');
        } else {
          throw err;
        }
      });
    }

    /**
     * @method getLogTypes
     * @access public
     * @description retrieve available log types in this session
     *
     * @returns {Promise<String[]>} promise of collection of available log types
     */

  }, {
    key: 'getLogTypes',
    value: function getLogTypes() {
      return this._logger.getAvailableLogTypes();
    }

    /**
     * @method getLogs
     * @access public
     * @description retrieve logs of given type
     *
     * @param {String} type
     *
     * @returns {Promise<Log[]>} promise of collection of logs of given type
     */

  }, {
    key: 'getLogs',
    value: function getLogs(type) {
      return this._logger.get(type).then((0, _ramda.map)(function (log) {
        return _extends({}, log, {
          level: log.level.name
        });
      }));
    }

    /**
     * @method execute
     * @access public
     * @description execute piece of code
     *
     * @param {String} code
     *
     * @returns {Promise<*>} result of the execution
     */

  }, {
    key: 'execute',
    value: function execute(code) {
      return this._driver.executeScript(code);
    }

    /**
     * @method sleep
     * @access public
     * @description suspend testing session for some time
     *
     * @param {Number} time
     *
     * @returns {Promise}
     */

  }, {
    key: 'sleep',
    value: function sleep(time) {
      return this._driver.sleep(time);
    }

    /**
     * @method open
     * @access public
     * @description open provided page
     *
     * @param {String} url
     *
     * @returns {Promise}
     */

  }, {
    key: 'open',
    value: function open(url) {
      return this._driver.get(url);
    }

    /**
     * @method quit
     * @access public
     * @description finish session
     *
     * @returns {Promise}
     */

  }, {
    key: 'quit',
    value: function quit() {
      return this._driver.quit();
    }

    /**
     * @function getConcurrencyLimit
     * @access public
     * @description returns concurrency limit for the account
     *
     * @param {String} userName
     * @param {String} accessToken
     *
     * @return {Promise<Number>} number of available concurrent VMs for the account
     */

  }], [{
    key: 'getConcurrencyLimit',
    value: function getConcurrencyLimit(userName, accessToken) {
      var API_ROOT = 'https://www.browserstack.com';
      return (0, _requestPromise2.default)(API_ROOT + '/automate/plan.json', {
        auth: {
          user: userName,
          pass: accessToken,
          sendImmediately: false
        }
      }).then(function (res) {
        var parsed = JSON.parse(res);
        return parseInt(parsed.parallel_sessions_max_allowed, 10);
      });
    }

    /**
     * @function parseBrowser
     * @access public
     * @description adapt browser definition to format accepted by SauceLabs
     *
     * @return {Object}
     *   @property {String} name - human-readable test name
     *   @property {String} browserName - name of the browser
     *
     *   for desktop browsers and old Appium syntax
     *   @property {String} version - version of the browser
     *   @property {String} platform - platform name and version
     *
     *   for Appium
     *   @property {String} deviceNme - device name
     *
     *   modern syntax for Appium
     *   @property {String} platformName
     *   @property {String} platformVersion
     *   @property {String} appiumVersion
     */

  }, {
    key: 'parseBrowser',
    value: function parseBrowser(browser) {
      var appium = false;
      var osName = browser.os;
      var osVersion = browser.osVersion;
      var deviceName = browser.device;
      var browserName = browser.name;
      var browserVersion = browser.version;

      if (osName === _constants.OS.OSX) {
        osVersion = (0, _ramda.invertObj)(_constants.OS_VERSION_MAPPING[_constants.OS.OSX])[osVersion];
      }

      if (browser.os === _constants.OS.IOS || browser.os === _constants.OS.ANDROID) {
        appium = true;
      }

      if (browser.name === _constants.BROWSER.SAFARI_MOBILE) {
        osName = 'os x';

        if (!isUndefined(browser.device) && (0, _ramda.contains)(_constants.DEVICE.IPAD, browser.device)) {
          browserName = 'ipad';
        } else {
          browserName = 'iphone';
        }
      }

      if (browser.name === _constants.BROWSER.ANDROID) {
        browserName = 'android';
      }

      if (browser.name === _constants.BROWSER.IE) {
        browserName = 'ie';
      }

      if (browser.device === _constants.DEVICE.IPHONE || isUndefined(browser.device)) {
        deviceName = {
          '9.1': 'iphone 6s',
          '8': 'iphone 6',
          '8.3': 'iphone 6',
          '7': 'iphone 5s',
          '6': 'iphone 5',
          '5.1': 'iphone 4s',
          '5': 'iphone 4s'
        }[browser.osVersion];
      }

      if (browser.device === _constants.DEVICE.IPAD) {
        deviceName = {
          '9.1': 'ipad air 2',
          '8.3': 'ipad air',
          '8': 'ipad air',
          '7': 'ipad 4th',
          '6': 'ipad 3rd (6.0)',
          '5.1': 'ipad 3rd',
          '5': 'ipad 2 (5.0)'
        }[browser.osVersion];
      }

      if (browser.os === _constants.OS.ANDROID && isUndefined(browser.device)) {
        deviceName = {
          '5': 'google nexus 5',
          '4.4': 'samsung galaxy s5',
          '4.3': 'samsung galaxy s4',
          '4.2': 'google nexus 4',
          '4.1': 'samsung galaxy s3',
          '4': 'google nexus'
        }[browser.osVersion];
      }

      // do it like that until only available version on SauceLabs and BrowserStack
      // is different
      if (browser.name === _constants.BROWSER.EDGE && isUndefined(browser.version)) {
        browserVersion = '13';
      }

      var config = {
        name: browser.displayName
      };

      if (appium) {
        var _OS$IOS$OS$ANDROID$br;

        return _extends({}, config, {
          browserName: browserName,
          device: deviceName,
          platform: (_OS$IOS$OS$ANDROID$br = {}, _defineProperty(_OS$IOS$OS$ANDROID$br, _constants.OS.IOS, 'mac'), _defineProperty(_OS$IOS$OS$ANDROID$br, _constants.OS.ANDROID, 'android'), _OS$IOS$OS$ANDROID$br)[browser.os]
        });
      }

      return _extends({}, config, {
        browser: browserName,
        browser_version: browserVersion,
        os: osName,
        os_version: osVersion
      });
    }

    /**
     * @constant {Number} TIMEOUT
     * @description maximal time to wait for server response
     */

  }, {
    key: 'TIMEOUT',
    get: function get() {
      return 10 * 60 * 1000;
    }

    /**
     * @constant {String} name
     * @description name of the provider
     */

  }, {
    key: 'name',
    get: function get() {
      return 'browserstack';
    }
  }]);

  return BrowserStackProvider;
}();

exports.default = BrowserStackProvider;