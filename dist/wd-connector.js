'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createConnector;

var _ramda = require('ramda');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _logUtils = require('./log-utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var RESULTS_ARRAY_NAME = 'window.__results__';
var containsBrowser = (0, _ramda.contains)('browser');

/**
 * @function createConnector
 * @access public
 * @description create connect function for given provider
 *
 * @param {ProviderClass} Provider
 *
 * @returns {Function}
 */
function createConnector(Provider) {
  /**
   * @function connect
   * @access public
   * @description create connection to Selenium/Appium browser using given
   *   credentials
   *
   * @param {BrowserDefinition} browser
   * @param {String} userName
   * @param {String} accessToken
   *
   * @return {Object} connection object
   */
  var exports = function connect(browser, userName, accessToken) {
    /**
     * @type {Object} Connection
     * @description this object gives access to high-level methods accessing
     *   Selenium/Appium server; EACH its method is a factory function, accepting
     *   some configuration and returning function that actually does something
     *   and returns promise
     */
    return {
      /**
       * @member {BrowserLog[]} _browserLogs
       * @access protected
       * @description collection of already fetched browser logs
       */
      _browserLogs: [],

      /**
       * @member {Number} _browserLogsGot
       * @access protected
       * @description amount of logs received by the client
       */
      _browserLogsGot: 0,

      /**
       * @member {Provider} _driver
       * @access protected
       * @description instance of given provider, set of low-level methods to
       *   access Selenium/Appium server
       */
      _driver: null,

      /**
       * @method enter
       * @access public
       * @description launch the testing session
       *
       * @returns {Function}
       *   @returns {Promise<String>} promise of session ID returned by the
       *     Selenium/Appium server
       */
      enter: function enter() {
        var _this = this;

        return function () {
          try {
            // the third argument is used by TestProvider
            _this._driver = new Provider(userName, accessToken, browser.displayName);
          } catch (err) {
            console.error(err.stack);
            throw new Error('error when instantiating Provider');
          }

          return _bluebird2.default.race([_bluebird2.default.delay(Provider.TIMEOUT).then(function () {
            throw new Error('cannot connect to WebDriver in ' + Provider.TIMEOUT + ' ms');
          }), _this._driver.init(browser).then(_ramda.identity, function (err) {
            throw new Error('error for browser ' + browser.name + ' ' + browser.version + ': ' + err.message);
          })]);
        };
      },

      /**
       * @method quit
       * @access public
       * @description finishes the testing session
       *
       * @returns {Function}
       *   @returns {Promise}
       */
      quit: function quit() {
        var _this2 = this;

        return function () {
          return _this2._driver.quit();
        };
      },

      /**
       * @method open
       * @access public
       * @description open given page and initialize environment on it
       *
       * @param {String} url
       *
       * @returns {Function}
       *   @returns {Promise}
       */
      open: function open(url) {
        var _this3 = this;

        return function () {
          return _bluebird2.default.race([_bluebird2.default.delay(Provider.TIMEOUT).then(function () {
            throw new Error('cannot open page ' + url + ' in ' + Provider.TIMEOUT + ' ms');
          }), _this3._driver.open(url).then(function () {
            return _this3._driver.execute('\n                ' + RESULTS_ARRAY_NAME + ' = ' + RESULTS_ARRAY_NAME + ' || [];\n                window.__saveResult = window.__saveResult || function(result) {\n                  ' + RESULTS_ARRAY_NAME + '.push(result);\n                };\n              ');
          })]);
        };
      },

      /**
       * @method getBrowserLogs
       * @access public
       * @description fetch browser logs with level equal or higher to provided
       *   one
       *
       * @param {String} [levelName='INFO']
       *
       * @returns {Function}
       *   @returns {Promise<BrowserLog[]>}
       */
      getBrowserLogs: function getBrowserLogs() {
        var _this4 = this;

        var levelName = arguments.length <= 0 || arguments[0] === undefined ? 'INFO' : arguments[0];

        var level = _logUtils.byName[levelName] || _logUtils.byName.ERROR;
        var isLogLevelLowerThanRequired = (0, _ramda.pipe)((0, _ramda.propOr)(Infinity, 'level'), (0, _ramda.gt)(level));

        return function () {
          return _this4._driver.getLogTypes().then(function () {
            var types = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
            return containsBrowser(types) ? _this4._driver.getLogs('browser') : _bluebird2.default.resolve([]);
          }, function () {
            return [];
          } // supress error
          ).then(function () {
            var _browserLogs;

            var logs = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

            (_browserLogs = _this4._browserLogs).push.apply(_browserLogs, _toConsumableArray(logs));
            var notGot = _this4._browserLogs.slice(_this4._browserLogsGot);
            _this4._browserLogsGot = _this4._browserLogs.length;

            return notGot;
          }).then((0, _ramda.pipe)((0, _ramda.map)(_logUtils.parse), (0, _ramda.reject)(_logUtils.isIgnored), (0, _ramda.reject)(isLogLevelLowerThanRequired))).then(function (logs) {
            return _this4._browserLogs = logs;
          });
        };
      },

      /**
       * @method getResults
       * @access public
       * @description fetch results of the testing session
       *
       * @returns {Function}
       *   @returns {Promise<Array>}
       */
      getResults: function getResults() {
        var _this5 = this;

        // it more safe to send stringified results through WD and parse it here
        // ex. MS Edge likes return arrays as object with numeric keys
        // on the other hand, strngification fails in IE 9, so we need a fallback
        return function () {
          return _this5._driver.execute('try {\n            return JSON.stringify(' + RESULTS_ARRAY_NAME + ');\n          } catch(err) {\n            return ' + RESULTS_ARRAY_NAME + ';\n          }').then(function (jsonOrNot) {
            try {
              return JSON.parse(jsonOrNot);
            } catch (err) {
              return jsonOrNot;
            }
          });
        };
      },

      /**
       * @method execute
       * @access public
       * @description execute some code
       *
       * @param {String} code
       *
       * @returns {Function}
       *   @returns {Promise<*>} - promise of execution results
       */
      execute: function execute(code) {
        var _this6 = this;

        return function () {
          return _this6._driver.execute(code);
        };
      },

      /**
       * @method sleep
       * @access public
       * @description suspends testing session for given time
       *
       * @param {Number} time - in milliseconds
       *
       * @returns {Function}
       *   @returns {Promise}
       */
      sleep: function sleep(time) {
        var _this7 = this;

        return function () {
          return _this7._driver.sleep(time);
        };
      }
    };
  };

  exports.getConcurrencyLimit = Provider.getConcurrencyLimit;

  return exports;
}