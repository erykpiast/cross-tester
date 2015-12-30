'use strict';

var _providers;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = run;

var _lodash = require('lodash');

var _promisesUtil = require('./promises-util');

var _parseBrowsers = require('./parse-browsers');

var _parseBrowsers2 = _interopRequireDefault(_parseBrowsers);

var _saucelabs = require('./providers/saucelabs');

var SauceLabs = _interopRequireWildcard(_saucelabs);

var _browserstack = require('./providers/browserstack');

var BrowserStack = _interopRequireWildcard(_browserstack);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var providers = (_providers = {}, _defineProperty(_providers, SauceLabs.name, SauceLabs), _defineProperty(_providers, BrowserStack.name, BrowserStack), _providers);

/**
 * @function run
 * @access public
 * @description runs code in each of provided browsers
 *
 * @param
 */
function run() {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var provider = _ref.provider;
  var browsers = _ref.browsers;
  var code = _ref.code;
  var credentials = _ref.credentials;

  if (!providers.hasOwnProperty(provider)) {
    throw new Error('Provider "' + provider + '" is not available. Use one of those: ' + Object.keys(providers).join(','));
  }

  if (!(0, _lodash.isString)(code)) {
    throw new TypeError('"code" must be a string');
  }

  if (!(0, _lodash.isObject)(credentials) || (0, _lodash.isNull)(credentials) || !(0, _lodash.isString)(credentials.userName) || !(0, _lodash.isString)(credentials.accessToken)) {
    throw new TypeError('"credentials" must be an object with not empty fields "userName" and "accessToken"');
  }

  var parsed = (0, _parseBrowsers2.default)(browsers);

  var _providers$provider = providers[provider];
  var createTest = _providers$provider.createTest;
  var concurrencyLimit = _providers$provider.concurrencyLimit;
  var userName = credentials.userName;
  var accessToken = credentials.accessToken;

  // define tests for all the websites in all browsers (from current config file)

  var testingSessions = Object.keys(parsed).map(function (browserName) {
    return {
      test: createTest(parsed[browserName], userName, accessToken),
      browser: (0, _lodash.extend)({
        name: browserName
      }, parsed[browserName])
    };
  }).map(function (_ref2) {
    var test = _ref2.test;
    var browser = _ref2.browser;
    return function () {
      return Promise.resolve()
      // we need very simple page always available online
      .then(test.open('http://blank.org/')).then(test.execute(code))
      // wait a while for script execution; later on some callback-based
      // solution should be used
      .then(test.sleep(1000)).then(function () {
        return Promise.all([test.getResults(), test.getBrowserLogs()]).then(function (results, logs) {
          return {
            browser: browser.name,
            results: results,
            logs: logs
          };
        });
      }).then(
      // quit no matter if test succeed or not
      (0, _promisesUtil.andReturn)(function () {
        return test.quit();
      }), (0, _promisesUtil.andThrow)(function () {
        return test.quit();
      })).catch(function (err) {
        // suppress any error,
        // we want to continue tests in other browsers
        console.error(err);
      });
    };
  });

  // run all tests with some concurrency
  return (0, _promisesUtil.concurrent)(testingSessions, concurrencyLimit).then(function (resultsForAllTests) {
    return resultsForAllTests.reduce(function (map, _ref3) {
      var browser = _ref3.browser;
      var results = _ref3.results;
      var logs = _ref3.logs;

      map[browser] = { results: results, logs: logs };

      return map;
    }, {});
  });
}