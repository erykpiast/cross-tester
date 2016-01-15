import { merge, identity, invertObj } from 'ramda';
import webdriver from 'wd';
import request from 'request-promise';
import { OS, BROWSER, DEVICE, OS_VERSION_MAPPING } from './parse-browsers';

const isUndefined = (v) => 'undefined' === typeof v;

export const TIMEOUT = 600 * 1000;

export const name = 'browserstack';


/**
 * @function createTest - creates testing session in single browser
 *
 * @param {Object} browser - browser definition object
 *   @property {String} name - display name
 *   @property {String} browserName - browser name in BS
 *   @property {String} platform - platform name in BS
 * @param {String} userName
 * @param {String} accessToken
 *
 * @return {Object} testing session object
 */
export default class BrowserStackProvider /*implements Provider*/ {
  constructor(userName, accessToken) {
    this._credentials = { userName, accessToken };
  }

  /**
   * @method init
   * @access public
   * @description initialize connection
   *
   * @param {BrowserDefinition} browser
   *
   * @return {Promise<String>} promise of session id
   */
  init(browser) {
    this._driver = new webdriver.Builder()
      .usingServer('http://hub.browserstack.com/wd/hub')
      .withCapabilities({ ...browser,
        'browserstack.user': this._credentials.userName,
        'browserstack.key': this._credentials.accessToken,
        'loggingPrefs': { 'browser': 'ALL' },
      })
      .build();
    this._logger = new webdriver.WebDriver.Logs(this._driver);

    return this._driver.session_
      .then(identity, (err) => {
        if(err.message.match(/(Browser_Version not supported)|(Browser combination invalid)/)) {
          throw new Error('requested browser is not supported');
        } else {
          throw err;
        }
      });
  }

  /**
   * @method getLogTypes
   * @access public
   * @description retrieve available log types in this session
   *
   * @returns {Promise<String[]>} promise of collection of available log types
   */
  getLogTypes() {
    return this._logger.getAvailableLogTypes();
  }

  /**
   * @method getLogs
   * @access public
   * @description retrieve available log types in this session
   *
   * @param {String} type
   *
   * @returns {Promise<String[]>} promise of collection of available log types
   */
  getLogs(type) {
    return this._logger.get(type);
  }

  /**
   * @method execute
   * @access public
   * @description execute piece of code
   *
   * @param {String} code
   *
   * @returns {Promise<*>} result of the execution
   */
  execute(code) {
    return this._driver.executeScript(code);
  }

  /**
   * @method sleep
   * @access public
   * @description suspend testing session for some time
   *
   * @param {Number} time
   *
   * @returns {Promise}
   */
  sleep(time) {
    return this._driver.sleep(time);
  }

  /**
   * @method open
   * @access public
   * @description open provided page
   *
   * @param {String} url
   *
   * @returns {Promise}
   */
  open(url) {
    return this._driver.get(url);
  }

  /**
   * @method quit
   * @access public
   * @description finish session
   *
   * @returns {Promise}
   */
  quit() {
    return this._driver.quit();
  }


  /**
   * @function getConcurrencyLimit
   * @access public
   * @description returns concurrency limit for the account
   *
   * @param {String} userName
   * @param {String} accessToken
   *
   * @return {Promise<Number>} number of available concurrent VMs for the account
   */
  static getConcurrencyLimit(userName, accessToken) {
    const API_ROOT = 'https://www.browserstack.com';
    return request(`${API_ROOT}/automate/plan.json`, {
      auth: {
        user: userName,
        pass: accessToken,
        sendImmediately: false
      }
    }).then((res) => {
      const parsed = JSON.parse(res);
      return parseInt(parsed.parallel_sessions_max_allowed, 10);
    });
  }


  /**
   * @function parseBrowser
   * @access public
   * @description adapt browser definition to format accepted by SauceLabs
   *
   * @return {Object}
   *   @property {String} name - human-readable test name
   *   @property {String} browserName - name of the browser
   *
   *   for desktop browsers and old Appium syntax
   *   @property {String} version - version of the browser
   *   @property {String} platform - platform name and version
   *
   *   for Appium
   *   @property {String} deviceNme - device name
   *
   *   modern syntax for Appium
   *   @property {String} platformName
   *   @property {String} platformVersion
   *   @property {String} appiumVersion
   */
  static parseBrowser(browser) {
    let appium = false;
    let osName = browser.os;
    let osVersion = browser.osVersion;
    let deviceName = browser.device;
    let browserName = browser.name;

    if (osName === OS.OSX) {
      osName = 'MAC';
      osVersion = invertObj(OS_VERSION_MAPPING[OS.OSX])[osVersion];
    }

    if ((browser.os === OS.IOS) || (browser.os === OS.ANDROID)) {
      appium = true;
    }

    if ((browser.os === OS.IOS) && (browser.name === BROWSER.SAFARI_MOBILE)) {
      browserName = 'iPad';
    }

    if (browser.device === DEVICE.IPHONE) {
      deviceName = ({
        '8': 'iPhone 6',
        '8.3': 'iPhone 6',
        '7': 'iPhone 5S',
        '6': 'iPhone 5',
        '5.1': 'iPhone 4S',
        '5': 'iPhone 4S'
      })[browser.osVersion];
    }

    if (browser.device === DEVICE.IPAD) {
      deviceName = ({
        '8': 'iPad Air',
        '8.3': 'iPad Air',
        '7': 'iPad 4th',
        '6': 'iPad 3rd (6.0)',
        '5.1': 'iPad 3rd',
        '5': 'iPad 2 (5.0)'
      })[browser.osVersion];
    }

    if ((browser.os === OS.ANDROID) && isUndefined(browser.device)) {
      deviceName = ({
        '5': 'Google Nexus 5',
        '4.4': 'Samsung Galaxy S5',
        '4.3': 'Samsung Galaxy S4',
        '4.2': 'Google Nexus 4',
        '4.1': 'Samsung Galaxy S3',
        '4': 'Google Nexus',
      })[browser.osVersion];
    }

    const config = {
      name: browser.displayName
    };

    if (appium) {
      merge(config, {
        browserName,
        device: deviceName,
        platform: ({
          [OS.IOS]: 'MAC',
          [OS.ANDROID]: 'ANDROID'
        })[browser.os]
      });
    } else {
      merge(config, {
        browser: browserName,
        browser_version: browser.version,
        os: osName,
        os_version: osVersion
      });
    }

    return config;
  }

  /**
   * @constant {Number} TIMEOUT
   * @description maximal time to wait for server response
   */
  static get TIMEOUT() {
    return 120 * 1000;
  }
}
