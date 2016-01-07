'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _providers;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = undefined;
exports.default = run;

var _ramda = require('ramda');

var _promisesUtil = require('./promises-util');

var _saucelabs = require('./providers/saucelabs');

var SauceLabs = _interopRequireWildcard(_saucelabs);

var _browserstack = require('./providers/browserstack');

var BrowserStack = _interopRequireWildcard(_browserstack);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var isObject = _get__('is')(Object);
var isString = _get__('is')(String);

var providers = (_providers = {}, _defineProperty(_providers, _get__('SauceLabs').name, _get__('SauceLabs')), _defineProperty(_providers, _get__('BrowserStack').name, _get__('BrowserStack')), _providers);

/**
 * @function run
 * @access public
 * @description runs code in each of provided browsers
 *
 * @param {Object} config
 *   @property {Object} credentials
 *     @property {String} userName
 *     @property {String} accessToken
 *   @property {Object} browsers - see documentation for input of parse-browsers
 *     function
 *   @property {String} provider - "saucelabs" or "browserstack"
 *   @property {String} [code] - valid JS code
 *   @property {Boolean} [verbose=false] - if true, prints logs about testing
 *     progress to console
 *   @property {Number} [timeout=1000] - how long to wait before gathering
 *     results (after executing code)
 *   @property {String} [url=http://blank.org] - page to open; by default it's
 *     blank, but you may wish to use some JSBin instead of providing the code
 *
 * @return {Promise<Object>} collection of results and logs for each browser
 *   (objects containing arrays grouped by names)
 */
function run() {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var provider = _ref.provider;
  var browsers = _ref.browsers;
  var credentials = _ref.credentials;
  var _ref$code = _ref.code;
  var code = _ref$code === undefined ? '' : _ref$code;
  var _ref$url = _ref.url;
  var url = _ref$url === undefined ? 'http://blank.org' : _ref$url;
  var _ref$verbose = _ref.verbose;
  var // we need very simple page always available online
  verbose = _ref$verbose === undefined ? false : _ref$verbose;
  var _ref$timeout = _ref.timeout;
  var timeout = _ref$timeout === undefined ? 1000 : _ref$timeout;

  if (!_get__('providers').hasOwnProperty(provider)) {
    throw new Error('Provider "' + provider + '" is not available. Use one of those: ' + Object.keys(_get__('providers')).join(','));
  }

  if (!_get__('isString')(code)) {
    throw new TypeError('"code" must be a string');
  }

  if (!_get__('isObject')(credentials) || _get__('isNil')(credentials) || !_get__('isString')(credentials.userName) || !_get__('isString')(credentials.accessToken)) {
    throw new TypeError('"credentials" must be an object with not empty fields "userName" and "accessToken"');
  }

  var _get__$provider = _get__('providers')[provider];

  var createTest = _get__$provider.createTest;
  var getConcurrencyLimit = _get__$provider.getConcurrencyLimit;
  var parseBrowser = _get__$provider.parseBrowser;
  var userName = credentials.userName;
  var accessToken = credentials.accessToken;

  // define tests for all the websites in all browsers (from current config file)

  var testingSessions = browsers.map(function (browser) {
    var browserConfig = parseBrowser(browser);
    return {
      test: createTest(browserConfig, userName, accessToken),
      browser: browserConfig
    };
  }).map(function (_ref2) {
    var test = _ref2.test;
    var browser = _ref2.browser;

    var browserName = browser.displayName;

    function print(message) {
      return _get__('andReturn')(function () {
        return Promise.resolve(verbose ? console.log(browserName + ' - ' + message) : 0);
      });
    }

    return function () {
      return Promise.resolve().then(print('starting')).then(test.enter()).then(print('connected')).then(test.open(url)).then(test.execute(code)).then(print('code executed'))
      // wait a while for script execution; later on some callback-based
      // solution should be used
      .then(test.sleep(timeout)).then(function () {
        return Promise.all([_get__('call')(test.getResults()).then(print('results gathered')), _get__('call')(test.getBrowserLogs()).then(print('logs gathered'))]).then(function (_ref3) {
          var _ref4 = _slicedToArray(_ref3, 2);

          var results = _ref4[0];
          var logs = _ref4[1];
          return {
            browser: browserName,
            results: results,
            logs: logs
          };
        });
      }).then(
      // quit no matter if test succeed or not
      _get__('andReturn')(test.quit()), _get__('andThrow')(test.quit())).catch(function (err) {
        // suppress any error
        // we don't want to break a chain, but continue tests in other browsers
        return {
          browser: browserName,
          results: [{
            type: 'FAIL',
            message: err.message
          }],
          logs: []
        };
      }).then(print('finished'));
    };
  });

  // run all tests with some concurrency
  return getConcurrencyLimit(userName, accessToken).then(function (concurrencyLimit) {
    return _get__('concurrent')(testingSessions, concurrencyLimit).then(function (resultsForAllTests) {
      return resultsForAllTests.reduce(function (map) {
        var _ref5 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        var browser = _ref5.browser;
        var results = _ref5.results;
        var logs = _ref5.logs;

        map[browser] = { results: results, logs: logs };

        return map;
      }, {});
    });
  });
}
var typeOfOriginalExport = typeof print === 'undefined' ? 'undefined' : _typeof(print);

function addNonEnumerableProperty(name, value) {
  Object.defineProperty(print, name, {
    value: value,
    enumerable: false,
    configurable: true
  });
}

if ((typeOfOriginalExport === 'object' || typeOfOriginalExport === 'function') && Object.isExtensible(print)) {
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
    case 'is':
      return _ramda.is;

    case 'SauceLabs':
      return SauceLabs;

    case 'BrowserStack':
      return BrowserStack;

    case 'providers':
      return providers;

    case 'isString':
      return isString;

    case 'isObject':
      return isObject;

    case 'isNil':
      return _ramda.isNil;

    case 'andReturn':
      return _promisesUtil.andReturn;

    case 'call':
      return _promisesUtil.call;

    case 'andThrow':
      return _promisesUtil.andThrow;

    case 'concurrent':
      return _promisesUtil.concurrent;
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
