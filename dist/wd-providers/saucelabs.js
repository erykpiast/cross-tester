'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ramda = require('ramda');

var _wd = require('wd');

var _wd2 = _interopRequireDefault(_wd);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _semver = require('semver');

var _constants = require('../parse-browsers/constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var isUndefined = function isUndefined(v) {
  return 'undefined' === typeof v;
};
var extendVersion = function extendVersion(v) {
  var splitted = v.split('.');
  return Array.from(new Array(3)).map(function (v, i) {
    return splitted[i] || '0';
  }).join('.');
};
var versionIsLower = (0, _ramda.useWith)(_semver.lt, [extendVersion, extendVersion]);

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

var SauceLabsProvider /*implements Provider*/ = function () {
  function SauceLabsProvider(userName, accessToken) {
    _classCallCheck(this, SauceLabsProvider);

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


  _createClass(SauceLabsProvider, [{
    key: 'init',
    value: function init(browser) {
      this._driver = _wd2.default.remote({
        hostname: 'ondemand.saucelabs.com',
        port: 80,
        user: this._credentials.userName,
        pwd: this._credentials.accessToken
      }, 'promise');

      // maybe we can use this to control timeout?
      // wd.configureHttp({
      //   timeout: 10000,
      //   retries: 3,
      //   retryDelay: 100
      // });
      return this._driver.init(this.constructor.parseBrowser(browser)).then((0, _ramda.nth)(1), function (err) {
        if (err.message.match(/Browser combination invalid/)) {
          throw new Error('requested browser is not supported');
        } else if (err.message.match(/The environment you requested was unavailable/)) {
          throw new Error('requested browser is not available at the moment');
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
      return this._driver.logTypes();
    }

    /**
     * @method getLogs
     * @access public
     * @description retrieve available log types in this session
     *
     * @param {String} type
     *
     * @returns {Promise<String[]>} promise of collection of available log types
     */

  }, {
    key: 'getLogs',
    value: function getLogs(type) {
      return this._driver.log(type);
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
      return this._driver.execute(code);
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
      var API_ROOT = 'https://saucelabs.com/rest/v1';
      return (0, _requestPromise2.default)(API_ROOT + '/users/' + userName + '/concurrency', {
        auth: {
          user: userName,
          pass: accessToken,
          sendImmediately: false
        }
      }).then(function (res) {
        var parsed = JSON.parse(res);
        return parseInt(parsed.concurrency[userName].remaining.mac, 10);
      }, function () {
        return 8;
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
      var isVersionHandledByOldAppiumApi = (0, _ramda.partialRight)(versionIsLower, ['4.4']);
      var appium = false;
      var appiumLegacy = false;
      var deviceName = browser.device;
      var browserName = browser.name;
      var browserVersion = browser.version;

      if (browser.os === _constants.OS.IOS || browser.os === _constants.OS.ANDROID) {
        appium = true;
      }

      if (browser.os === _constants.OS.ANDROID && isVersionHandledByOldAppiumApi(browser.osVersion)) {
        appiumLegacy = true;
      }

      if (browser.name === _constants.BROWSER.SAFARI_MOBILE) {
        browserName = 'safari';
      }

      if (browser.device === _constants.DEVICE.IPHONE) {
        deviceName = 'iphone simulator';
      }

      if (browser.device === _constants.DEVICE.IPAD) {
        deviceName = 'ipad simulator';
      }

      if (browser.os === _constants.OS.ANDROID && isUndefined(browser.device)) {
        deviceName = 'android emulator';
      }

      if (browser.os === _constants.OS.ANDROID && !isVersionHandledByOldAppiumApi(browser.osVersion)) {
        browserName = 'browser';
      }

      if (browser.name === _constants.BROWSER.EDGE) {
        browserName = 'microsoftedge';
      }

      // do it like that until only available version on SauceLabs and BrowserStack
      // is different
      if (browser.name === _constants.BROWSER.EDGE && isUndefined(browser.version)) {
        browserVersion = '20.10240';
      }

      var config = {
        browserName: browserName,
        name: browser.displayName
      };

      if (appium) {
        config = _extends({}, config, {
          deviceName: deviceName,
          deviceOrientation: 'portrait',
          platformName: browser.os,
          platformVersion: browser.osVersion,
          appiumVersion: '1.4.16'
        });

        if (appiumLegacy) {
          return _extends({}, config, {
            browserName: '',
            automationName: 'Selendroid'
          });
        }

        return config;
      }

      return _extends({}, config, {
        version: browserVersion,
        platform: browser.os + (browser.osVersion ? ' ' + browser.osVersion : '')
      });
    }

    /**
     * @constant {Number} TIMEOUT
     * @description maximal time to wait for server response
     */

  }, {
    key: 'TIMEOUT',
    get: function get() {
      return 3 * 60 * 1000;
    }

    /**
     * @constant {String} name
     * @description name of the provider
     */

  }, {
    key: 'name',
    get: function get() {
      return 'saucelabs';
    }
  }]);

  return SauceLabsProvider;
}();

exports.default = SauceLabsProvider;