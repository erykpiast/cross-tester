import {
  extend,
  isNull,
  isObject,
  isString
} from 'lodash';

import { concurrent, andReturn, andThrow, call } from './promises-util';
import parseBrowsers from './parse-browsers';
import * as SauceLabs from './providers/saucelabs';
import * as BrowserStack from './providers/browserstack';


const providers = {
  [SauceLabs.name]: SauceLabs,
  [BrowserStack.name]: BrowserStack
};

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
export default function run({
  provider,
  browsers,
  credentials,
  code = '',
  url = 'http://blank.org', // we need very simple page always available online
  verbose = false,
  timeout = 1000
} = {}) {
  if (!providers.hasOwnProperty(provider)) {
    throw new Error(`Provider "${provider}" is not available. Use one of those: ${Object.keys(providers).join(',')}`);
  }

  if(!isString(code)) {
    throw new TypeError('"code" must be a string');
  }

  if(!isObject(credentials) || isNull(credentials) ||
    !isString(credentials.userName) ||
    !isString(credentials.accessToken)
  ) {
    throw new TypeError('"credentials" must be an object with not empty fields "userName" and "accessToken"');
  }

  const parsed = parseBrowsers(browsers);

  const { createTest, getConcurrencyLimit, parseBrowser } = providers[provider];
  const { userName, accessToken } = credentials;

  // define tests for all the websites in all browsers (from current config file)
  const testingSessions = Object.keys(parsed)
  .map((browserName) => {
    const browserConfig = extend(parseBrowser(parsed[browserName], browserName), {
      displayName: browserName
    });

    return {
      test: createTest(browserConfig, userName, accessToken),
      browser: browserConfig
    };
  })
  .map(({ test, browser }) => {
    const browserName = browser.displayName;

    function print(message) {
      return andReturn(() => Promise.resolve(verbose ? console.log(`${browserName} - ${message}`) : 0));
    }

    return () =>
      Promise.resolve()
      .then(print('starting'))
      .then(test.enter())
      .then(print('connected'))
      .then(test.open(url))
      .then(test.execute(code))
      .then(print('code executed'))
       // wait a while for script execution; later on some callback-based
       // solution should be used
      .then(test.sleep(timeout))
      .then(() =>
        Promise.all([
          call(test.getResults())
            .then(print('results gathered')),
          call(test.getBrowserLogs())
            .then(print('logs gathered'))
        ]).then(([results, logs]) => ({
          browser: browserName,
          results,
          logs
        }))
      )
      .then(
        // quit no matter if test succeed or not
        andReturn(test.quit()),
        andThrow(test.quit())
      ).catch((err) => {
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
      })
      .then(print('finished'));
  });

  // run all tests with some concurrency
  return getConcurrencyLimit(userName, accessToken).then((concurrencyLimit) =>
    concurrent(testingSessions, concurrencyLimit)
      .then((resultsForAllTests) => {
        return resultsForAllTests.reduce((map, { browser, results, logs } = {}) => {
          map[browser] = { results, logs };

          return map;
        }, {});
      })
    );
}