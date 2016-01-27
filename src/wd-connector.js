import {
  contains,
  gt,
  identity,
  map,
  pipe,
  propOr,
  reject
} from 'ramda';
import Promise from 'bluebird';

import {
  parse as parseLog,
  isIgnored as isLogIgnored,
  byName as logLevelByName
} from './log-utils';


const RESULTS_ARRAY_NAME = 'window.__results__';
const containsBrowser = contains('browser');


/**
 * @function createConnector
 * @access public
 * @description create connect function for given provider
 *
 * @param {ProviderClass} Provider
 *
 * @returns {Function}
 */
export default function createConnector(Provider) {
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
  const exports = function connect(browser, userName, accessToken) {
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
      enter() {
        return () => {
          try {
            // the third argument is used by TestProvider
            this._driver = new Provider(userName, accessToken, browser.displayName);
          } catch(err) {
            console.error(err.stack);
            throw new Error('error when instantiating Provider');
          }

          return Promise.race([
            Promise.delay(Provider.TIMEOUT).then(() => {
              throw new Error(`cannot connect to WebDriver in ${Provider.TIMEOUT} ms`);
            }),
            this._driver.init(browser)
              .then(identity, (err) => {
                throw new Error(`error for browser ${browser.name} ${browser.version}: ${err.message}`);
              })
          ]);
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
      quit() {
        return () => this._driver.quit();
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
      open(url) {
        return () =>
          Promise.race([
            Promise.delay(Provider.TIMEOUT).then(() => {
              throw new Error(`cannot open page ${url} in ${Provider.TIMEOUT} ms`);
            }),
            this._driver.open(url)
              .then(() => this._driver.execute(`
                ${RESULTS_ARRAY_NAME} = ${RESULTS_ARRAY_NAME} || [];
                window.__saveResult = window.__saveResult || function(result) {
                  ${RESULTS_ARRAY_NAME}.push(result);
                };
              `))
          ]);
      },

      /**
       * @method getBrowserLogs
       * @access public
       * @description fetch browser logs with level equal or higher to provided
       *   one
       *
       * @param {String} [levelName='INFO']
       *
       * @returns {Function}
       *   @returns {Promise<BrowserLog[]>}
       */
      getBrowserLogs(levelName = 'INFO') {
        const level = logLevelByName[levelName] || logLevelByName.ERROR;
        const isLogLevelLowerThanRequired = pipe(
          propOr(Infinity, 'level'),
          gt(level)
        );

        return () => this._driver.getLogTypes().then(
          (types = []) =>
            (containsBrowser(types) ?
              this._driver.getLogs('browser') :
              Promise.resolve([])
            ),
          () => [] // supress error
        )
        .then((logs = []) => {
          this._browserLogs.push(...logs);
          const notGot = this._browserLogs.slice(this._browserLogsGot);
          this._browserLogsGot = this._browserLogs.length;

          return notGot;
        })
        .then(
          pipe(
            map(parseLog),
            reject(isLogIgnored),
            reject(isLogLevelLowerThanRequired)
          )
        )
        .then((logs) =>
          this._browserLogs = logs
        );
      },

      /**
       * @method getResults
       * @access public
       * @description fetch results of the testing session
       *
       * @returns {Function}
       *   @returns {Promise<Array>}
       */
      getResults() {
        // it more safe to send stringified results through WD and parse it here
        // ex. MS Edge likes return arrays as object with numeric keys
        // on the other hand, strngification fails in IE 9, so we need a fallback
        return () => this._driver.execute(`try {
            return JSON.stringify(${RESULTS_ARRAY_NAME});
          } catch(err) {
            return ${RESULTS_ARRAY_NAME};
          }`)
          .then((jsonOrNot) => {
            try {
              return JSON.parse(jsonOrNot);
            } catch(err) {
              return jsonOrNot;
            }
          });
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
      execute(code) {
        return () => this._driver.execute(code);
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
      sleep(time) {
        return () => this._driver.sleep(time);
      }
    };
  };

  exports.getConcurrencyLimit = Provider.getConcurrencyLimit;

  return exports;
}
