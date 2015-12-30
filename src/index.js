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
 * @param
 */
export default function run({ provider, browsers, code, credentials } = {}) {
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
      .then(print(`started ${browser.name}`))
      .then(test.enter())
      .then(print('entered'))
      // we need very simple page always available online
      .then(test.open('about:blank'))
      .then(print('page opened'))
      .then(test.execute(code))
      .then(print('code executed'))
       // wait a while for script execution; later on some callback-based
       // solution should be used
      .then(test.sleep(1000))
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
      .then(print('results and logs gathered'))
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
      .then(print('quited'))
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
}


function print(message) {
  return andReturn(() => Promise.resolve(console.log(message)));
}