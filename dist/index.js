'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = run;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodashAssign = require('lodash.assign');

var _lodashAssign2 = _interopRequireDefault(_lodashAssign);

var _promisesUtil = require('./promises-util');

var _parseBrowsers = require('./parse-browsers');

var _parseBrowsers2 = _interopRequireDefault(_parseBrowsers);

var _providersSaucelabs = require('./providers/saucelabs');

function run(browsers, code, _ref) {
    var userName = _ref.userName;
    var accessToken = _ref.accessToken;

    var parsed = (0, _parseBrowsers2['default'])(browsers);
    // define tests for all websites in all browsers (from current config file)
    var testingSessions = Object.keys(parsed).map(function (browserName) {
        return {
            test: (0, _providersSaucelabs.createTest)(parsed[browserName], userName, accessToken),
            browser: (0, _lodashAssign2['default'])({
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
            test.quit(), test.quit())['catch'](function (err) {
                // suppress any error,
                // we want to continue tests in other browsers
                console.error(err);
            });
        };
    });

    // run all tests with some concurrency
    return (0, _promisesUtil.concurrent)(testingSessions, _providersSaucelabs.concurrencyLimit).then(function (resultsForAllTests) {
        return resultsForAllTests.reduce(function (map, _ref3) {
            var browser = _ref3.browser;
            var results = _ref3.results;
            var logs = _ref3.logs;

            map[browser] = { results: results, logs: logs };

            return map;
        });
    });
}

module.exports = exports['default'];