'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = run;

var _ramda = require('ramda');

var _promisesUtil = require('./promises-util');

var _wdConnector = require('./wd-connector');

var _wdConnector2 = _interopRequireDefault(_wdConnector);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isFunction = (0, _ramda.is)(Function);
var isObject = (0, _ramda.is)(Object);
var isString = (0, _ramda.is)(String);

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
 *   @property {Provider} provider - any class that implements Provider interface
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

  var Provider = _ref.Provider;
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

  if (!isFunction(Provider)) {
    throw new TypeError('"Provider" must be defined');
  }

  if (!isString(code) && !isString(url)) {
    throw new TypeError('"code" or "url" must be defined');
  }

  if (!isObject(credentials) || (0, _ramda.isNil)(credentials) || !isString(credentials.userName) || !isString(credentials.accessToken)) {
    throw new TypeError('"credentials" must be an object with not empty fields "userName" and "accessToken"');
  }

  var connect = (0, _wdConnector2.default)(Provider);
  var userName = credentials.userName;
  var accessToken = credentials.accessToken;

  // define tests for all the websites in all browsers (from current config file)

  var testingSessions = browsers.map(function (browser) {
    return {
      test: connect(browser, userName, accessToken),
      browserName: browser.displayName
    };
  }).map(function (_ref2) {
    var test = _ref2.test;
    var browserName = _ref2.browserName;

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
            results: results.map(function (result) {
              return !result.hasOwnProperty('type') ? {
                type: 'SUCCESS',
                value: result
              } : result;
            }),
            logs: logs
          };
        });
      }).then(
      // quit no matter if test succeed or not
      (0, _promisesUtil.andReturn)(test.quit()), (0, _promisesUtil.andThrow)(test.quit())).catch(function (err) {
        if (verbose) {}
        // console.error(err.stack);

        // suppress any error
        // we don't want to break a chain, but continue tests in other browsers
        return {
          browser: browserName,
          results: [{
            type: 'FAIL',
            value: err.message
          }],
          logs: []
        };
      }).then(print('finished'));
    };
  });

  // run all tests with some concurrency
  return Provider.getConcurrencyLimit(userName, accessToken).then((0, _promisesUtil.concurrent)(testingSessions)).then((0, _utils.objectify)('browser'));
}