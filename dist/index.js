'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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
  var getConcurrencyLimit = _providers$provider.getConcurrencyLimit;
  var parseBrowser = _providers$provider.parseBrowser;
  var userName = credentials.userName;
  var accessToken = credentials.accessToken;

  // define tests for all the websites in all browsers (from current config file)

  var testingSessions = Object.keys(parsed).map(function (browserName) {
    var browserConfig = (0, _lodash.extend)(parseBrowser(parsed[browserName], browserName), {
      displayName: browserName
    });

    return {
      test: createTest(browserConfig, userName, accessToken),
      browser: browserConfig
    };
  }).map(function (_ref2) {
    var test = _ref2.test;
    var browser = _ref2.browser;

    var browserName = browser.displayName;

    function print(message) {
      return (0, _promisesUtil.andReturn)(function () {
        return Promise.resolve(verbose ? console.log(browserName + ' - ' + message) : 0);
      });
    }

    return function () {
      return Promise.resolve().then(print('starting')).then(test.enter()).then(print('connected')).then(test.open(url)).then(test.execute(code)).then(print('code executed'))
      // wait a while for script execution; later on some callback-based
      // solution should be used
      .then(test.sleep(timeout)).then(function () {
        return Promise.all([(0, _promisesUtil.call)(test.getResults()).then(print('results gathered')), (0, _promisesUtil.call)(test.getBrowserLogs()).then(print('logs gathered'))]).then(function (_ref3) {
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
      (0, _promisesUtil.andReturn)(test.quit()), (0, _promisesUtil.andThrow)(test.quit())).catch(function (err) {
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
    return (0, _promisesUtil.concurrent)(testingSessions, concurrencyLimit).then(function (resultsForAllTests) {
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