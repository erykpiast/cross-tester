import {
  isNil,
  is
} from 'ramda';

import { concurrent, andReturn, andThrow, call } from './promises-util';
import createConnector from './wd-connector';

const isObject = is(Object);
const isString = is(String);

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
export default function run({
  Provider,
  browsers,
  credentials,
  code = '',
  url = 'http://blank.org', // we need very simple page always available online
  verbose = false,
  timeout = 1000
} = {}) {
  if(!isString(code)) {
    throw new TypeError('"code" must be a string');
  }

  if(!isObject(credentials) || isNil(credentials) ||
    !isString(credentials.userName) ||
    !isString(credentials.accessToken)
  ) {
    throw new TypeError('"credentials" must be an object with not empty fields "userName" and "accessToken"');
  }

  const connect = createConnector(Provider);
  const { userName, accessToken } = credentials;

  // define tests for all the websites in all browsers (from current config file)
  const testingSessions = browsers
  .map((browser) => {
    return {
      test: connect(browser, userName, accessToken),
      browserName: browser.displayName
    };
  })
  .map(({ test, browserName }) => {
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
        if (verbose) {
          console.error(err.stack);
        }
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
  return Provider.getConcurrencyLimit(userName, accessToken)
    .then((concurrencyLimit) => concurrent(testingSessions, concurrencyLimit))
    .then((resultsForAllTests) => {
      return resultsForAllTests.reduce((map, { browser, results, logs } = {}) => {
        map[browser] = { results, logs };

        return map;
      }, {});
    });
}