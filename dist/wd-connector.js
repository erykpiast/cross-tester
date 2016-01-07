'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = undefined;
exports.default = createConnector;

var _ramda = require('ramda');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _logUtils = require('./log-utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var RESULTS_ARRAY_NAME = 'window.__results__';
var containsBrowser = _get__('contains')('browser');

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
          _this._driver = new Provider(userName, accessToken);

          return _get__('Promise').race([_get__('Promise').delay(Provider.TIMEOUT).then(function () {
            throw new Error('cannot connect to WebDriver in ' + Provider.TIMEOUT + ' ms');
          }), _this._driver.init(browser).then(_get__('identity'), function (err) {
            throw new Error('error for browser ' + browser.browserName + ' ' + browser.version + ': ' + err.message);
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
          return _get__('Promise').race([_get__('Promise').delay(Provider.TIMEOUT).then(function () {
            throw new Error('cannot open page ' + url + ' in ' + Provider.TIMEOUT + ' ms');
          }), _this3._driver.get(url).then(_this3._driver.execute('\n                ' + _get__('RESULTS_ARRAY_NAME') + ' = ' + _get__('RESULTS_ARRAY_NAME') + ' || [];\n                window.__saveResult = window.__saveResult || function(result) {\n                  ' + _get__('RESULTS_ARRAY_NAME') + '.push(result);\n                };\n              '))]);
        };
      },

      /**
       * @method getBrowserLogs
       * @access public
       * @description fetch browser logs with level equal or higher to provided
       *   one
       *
       * @param {String} [levelName='ERROR']
       *
       * @returns {Function}
       *   @returns {Promise<BrowserLog[]>}
       */
      getBrowserLogs: function getBrowserLogs() {
        var _this4 = this;

        var levelName = arguments.length <= 0 || arguments[0] === undefined ? 'ERROR' : arguments[0];

        var level = _get__('logLevelByName')[levelName] || _get__('logLevelByName').ERROR;

        return function () {
          return _this4._driver.getLogTypes().then(function (types) {
            return _get__('containsBrowser')(types) ? _this4._driver.getLogs('browser') : _get__('Promise').resolve([]);
          }, function () {
            return [];
          } // supress error
          ).then(function (logs) {
            var _browserLogs;

            (_browserLogs = _this4._browserLogs).push.apply(_browserLogs, _toConsumableArray(logs));
            var notGot = _this4._browserLogs.slice(_this4._browserLogsGot);
            _this4._browserLogsGot = _this4._browserLogs.length;

            return notGot;
          }).then(function (logs) {
            return(
              // parse Firefox logs from addons and Chrome logs
              logs.map(_get__('parseLog')).filter(_get__('isLogIgnored')).filter(function (log) {
                return (_get__('logLevelByName')[log.level] || Infinity) >= level;
              })
            );
          }).then(function (logs) {
            _this4._browserLogs = logs;
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
          return _this5._driver.execute('try {\n            return JSON.stringify(' + _get__('RESULTS_ARRAY_NAME') + ');\n          } catch(err) {\n            return ' + _get__('RESULTS_ARRAY_NAME') + ';\n          }').then(function (jsonOrNot) {
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
var typeOfOriginalExport = typeof createConnector === 'undefined' ? 'undefined' : _typeof(createConnector);

function addNonEnumerableProperty(name, value) {
  Object.defineProperty(createConnector, name, {
    value: value,
    enumerable: false,
    configurable: true
  });
}

if ((typeOfOriginalExport === 'object' || typeOfOriginalExport === 'function') && Object.isExtensible(createConnector)) {
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
    case 'contains':
      return _ramda.contains;

    case 'Promise':
      return _bluebird2.default;

    case 'identity':
      return _ramda.identity;

    case 'RESULTS_ARRAY_NAME':
      return RESULTS_ARRAY_NAME;

    case 'logLevelByName':
      return _logUtils.byName;

    case 'containsBrowser':
      return containsBrowser;

    case 'parseLog':
      return _logUtils.parse;

    case 'isLogIgnored':
      return _logUtils.isIgnored;
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