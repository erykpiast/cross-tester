import {
  contains,
  identity,
  invertObj,
  map,
  mergeAll
} from 'ramda';
import webdriver from 'browserstack-webdriver';
import request from 'request-promise';
import {
  OS,
  BROWSER,
  DEVICE,
  OS_VERSION_MAPPING
} from '../parse-browsers/constants';

const isUndefined = (v) => 'undefined' === typeof v;


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
      .withCapabilities({ ...this.constructor.parseBrowser(browser),
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
   * @description retrieve logs of given type
   *
   * @param {String} type
   *
   * @returns {Promise<Log[]>} promise of collection of logs of given type
   */
  getLogs(type) {
    return this._logger.get(type).then(map((log) => ({
      ...log,
      level: log.level.name
    })));
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
    let browserVersion = browser.version;

    if (osName === OS.OSX) {
      osVersion = invertObj(OS_VERSION_MAPPING[OS.OSX])[osVersion];
    }

    if ((browser.os === OS.IOS) || (browser.os === OS.ANDROID)) {
      appium = true;
    }

    if (browser.name === BROWSER.SAFARI_MOBILE) {
      osName = 'os x';

      if (!isUndefined(browser.device) && contains(DEVICE.IPAD, browser.device)) {
        browserName = 'ipad';
      } else {
        browserName = 'iphone';
      }
    }

    if (browser.name === BROWSER.ANDROID) {
      browserName = 'android';
    }

    if (browser.name === BROWSER.IE) {
      browserName = 'ie';
    }

    if (browser.device === DEVICE.IPHONE || isUndefined(browser.device)) {
      deviceName = ({
        '9.1': 'iphone 6s',
        '8': 'iphone 6',
        '8.3': 'iphone 6',
        '7': 'iphone 5s',
        '6': 'iphone 5',
        '5.1': 'iphone 4s',
        '5': 'iphone 4s'
      })[browser.osVersion];
    }

    if (browser.device === DEVICE.IPAD) {
      deviceName = ({
        '9.1': 'ipad air 2',
        '8.3': 'ipad air',
        '8': 'ipad air',
        '7': 'ipad 4th',
        '6': 'ipad 3rd (6.0)',
        '5.1': 'ipad 3rd',
        '5': 'ipad 2 (5.0)'
      })[browser.osVersion];
    }

    if ((browser.os === OS.ANDROID) && isUndefined(browser.device)) {
      deviceName = ({
        '5': 'google nexus 5',
        '4.4': 'samsung galaxy s5',
        '4.3': 'samsung galaxy s4',
        '4.2': 'google nexus 4',
        '4.1': 'samsung galaxy s3',
        '4': 'google nexus',
      })[browser.osVersion];
    }

    // do it like that until only available version on SauceLabs and BrowserStack
    // is different
    if ((browser.name === BROWSER.EDGE) && isUndefined(browser.version)) {
      browserVersion = '13';
    }

    const config = {
      name: browser.displayName
    };

    if (appium) {
      return {
        ...config,
        browserName,
        device: deviceName,
        platform: ({
          [OS.IOS]: 'mac',
          [OS.ANDROID]: 'android'
        })[browser.os]
      };
    }

    return {
      ...config,
      browser: browserName,
      browser_version: browserVersion,
      os: osName,
      os_version: osVersion
    };
  }

  /**
   * @constant {Number} TIMEOUT
   * @description maximal time to wait for server response
   */
  static get TIMEOUT() {
    return 10 * 60 * 1000;
  }

  /**
   * @constant {String} name
   * @description name of the provider
   */
  static get name() {
    return 'browserstack';
  }
}
