'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = exports.name = exports.TIMEOUT = undefined;

var _ramda = require('ramda');

var _wd = require('wd');

var _wd2 = _interopRequireDefault(_wd);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _compareSemver = require('compare-semver');

var _parseBrowsers = require('./parse-browsers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TIMEOUT = exports.TIMEOUT = 300 * 1000;

var name = exports.name = 'saucelabs';

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

var SauceLabsProvider /*implements Provider*/ = (function () {
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
      this._driver = _get__('webdriver').remote({
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
      return this._driver.init(browser).then(function (_session_) {
        return _session_[1];
      }, function (err) {
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
      var API_ROOT = 'https://saucelabs.com/rest/v1/';
      return _get__('request')(API_ROOT + ('users/' + userName + '/concurrency'), {
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
      var appiumLegacy = false;
      var deviceName = browser.device;
      var browserName = browser.name;

      if (browser.os === _get__('OS').IOS || browser.os === _get__('OS').ANDROID) {
        appium = true;
      }

      if (browser.os === _get__('OS').ANDROID && _get__('versionIsLower')(browser.osVersion, '4.4')) {
        appiumLegacy = true;
      }

      if (browser.device === _get__('DEVICE').IPHONE) {
        deviceName = 'iPhone Simulator';
      }

      if (browser.device === _get__('DEVICE').IPAD) {
        deviceName = 'iPad Simulator';
      }

      if (browser.os === _get__('OS').ANDROID && !browser.device) {
        deviceName = 'Android Emulator';
      }

      if (browser.os === _get__('OS').ANDROID && !_get__('versionIsLower')(browser.osVersion, '4.4')) {
        browserName = 'Browser';
      }

      if (browser.name === _get__('BROWSER').EDGE) {
        browserName = 'MicrosoftEdge';
      }

      var config = {
        browserName: browserName,
        name: browser.displayName
      };

      if (appium) {
        _get__('merge')(config, {
          deviceOrientation: 'portrait',
          deviceName: deviceName
        });

        if (appiumLegacy) {
          _get__('merge')(config, {
            platform: 'Linux',
            version: browser.osVersion
          });
        } else {
          _get__('merge')(config, {
            platformName: browser.osName,
            platformVersion: browser.osVersion,
            appiumVersion: '1.4.16'
          });
        }
      } else {
        _get__('merge')(config, {
          version: browser.version,
          platform: browser.osName + (browser.osVersion ? ' ' + browser.osVersion : '')
        });
      }

      return config;
    }
  }]);

  return SauceLabsProvider;
})();

exports.default = SauceLabsProvider;
var typeOfOriginalExport = typeof SauceLabsProvider === 'undefined' ? 'undefined' : _typeof(SauceLabsProvider);

function addNonEnumerableProperty(name, value) {
  Object.defineProperty(SauceLabsProvider, name, {
    value: value,
    enumerable: false,
    configurable: true
  });
}

if ((typeOfOriginalExport === 'object' || typeOfOriginalExport === 'function') && Object.isExtensible(SauceLabsProvider)) {
  addNonEnumerableProperty('__get__', _get__);
  addNonEnumerableProperty('__GetDependency__', _get__);
  addNonEnumerableProperty('__Rewire__', _set__);
  addNonEnumerableProperty('__set__', _set__);
  addNonEnumerableProperty('__reset__', _reset__);
  addNonEnumerableProperty('__ResetDependency__', _reset__);
  addNonEnumerableProperty('__with__', _with__);
  addNonEnumerableProperty('__RewireAPI__', _RewireAPI__);
}

var _RewiredData__ = {};

function _get__(variableName) {
  return _RewiredData__ === undefined || _RewiredData__[variableName] === undefined ? _get_original__(variableName) : _RewiredData__[variableName];
}

function _get_original__(variableName) {
  switch (variableName) {
    case 'webdriver':
      return _wd2.default;

    case 'request':
      return _requestPromise2.default;

    case 'OS':
      return _parseBrowsers.OS;

    case 'versionIsLower':
      return _compareSemver.lt;

    case 'DEVICE':
      return _parseBrowsers.DEVICE;

    case 'BROWSER':
      return _parseBrowsers.BROWSER;

    case 'merge':
      return _ramda.merge;
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