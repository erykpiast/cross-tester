import {
  extend,
  isNull,
  isObject,
  isString
} from 'lodash';

import { concurrent, andReturn, andThrow, call } from './promises-util';
import parseBrowsers from './parse-browsers';
import * as SauceLabs from './providers/saucelabs';


const providers = {
  [SauceLabs.name]: SauceLabs
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
 *   @property {String} [provider='saucelabs']
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
  provider = 'saucelabs',
  browsers,
  code = '',
  credentials,
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

  const { createTest, getConcurrencyLimit } = providers[provider];
  const { userName, accessToken } = credentials;

  // define tests for all the websites in all browsers (from current config file)
  const testingSessions = Object.keys(parsed)
  .map((browserName) => ({
    test: createTest(parsed[browserName], userName, accessToken),
    browser: extend({
      name: browserName
    }, parsed[browserName])
  }))
  .map(({ test, browser }) =>
    () =>
      Promise.resolve()
      .then(print(`started testing session in browser ${browser.name}`))
      .then(test.enter())
      .then(print('connected'))
      // we need very simple page always available online
      .then(test.open('about:blank'))
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
          browser: browser.name,
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
          browser: browser.name,
          results: [{
            type: 'FAIL',
            message: err.message
          }],
          logs: []
        };
      })
      .then(print('testing session finished'))
  );

  // run all tests with some concurrency
  return getConcurrencyLimit(userName, accessToken).then((concurrencyLimit) =>
    concurrent(testingSessions, concurrencyLimit)
      .then((resultsForAllTests) =>
        resultsForAllTests.reduce((map, { browser, results, logs } = {}) => {
          map[browser] = { results, logs };

          return map;
        }, {})
      )
    );
    
  
  function print(message) {
    return andReturn(() => Promise.resolve(verbose ? console.log(message) : 0));
  }
}