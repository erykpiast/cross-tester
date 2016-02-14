import {
  mergeAll,
  nth,
  partialRight,
  useWith
} from 'ramda';
import webdriver from 'wd';
import request from 'request-promise';
import { lt as semverLt } from 'semver';
import {
  OS,
  BROWSER,
  DEVICE
} from '../parse-browsers/constants';

const isUndefined = (v) => 'undefined' === typeof v;
const extendVersion = (v) => {
  const splitted = v.split('.');
  return Array.from(new Array(3))
    .map((v, i) => splitted[i] || '0')
    .join('.');
};
const versionIsLower = useWith(semverLt, [extendVersion, extendVersion]);


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
export default class SauceLabsProvider /*implements Provider*/ {
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
    this._driver = webdriver.remote({
      hostname: 'ondemand.saucelabs.com',
      port: 80,
      user: this._credentials.userName,
      pwd: this._credentials.accessToken
    }, 'promise');

    // maybe we can use this to control timeout?
    // wd.configureHttp({
    //   timeout: 10000,
    //   retries: 3,
    //   retryDelay: 100
    // });
    return this._driver.init(this.constructor.parseBrowser(browser))
      .then(nth(1), (err) => {
        if(err.message.match(/Browser combination invalid/)) {
          throw new Error('requested browser is not supported');
        } else if (err.message.match(/The environment you requested was unavailable/)) {
          throw new Error('requested browser is not available at the moment');
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
    return this._driver.logTypes();
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
    return this._driver.log(type);
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
    return this._driver.execute(code);
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
    const API_ROOT = 'https://saucelabs.com/rest/v1';
    return request(`${API_ROOT}/users/${userName}/concurrency`, {
      auth: {
        user: userName,
        pass: accessToken,
        sendImmediately: false
      }
    }).then((res) => {
      const parsed = JSON.parse(res);
      return parseInt(parsed.concurrency[userName].remaining.mac, 10);
    }, () => 8);
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
    const isVersionHandledByOldAppiumApi = partialRight(versionIsLower, ['4.4']);
    let appium = false;
    let appiumLegacy = false;
    let deviceName = browser.device;
    let browserName = browser.name;
    let browserVersion = browser.version;

    if ((browser.os === OS.IOS) || (browser.os === OS.ANDROID)) {
      appium = true;
    }

    if ((browser.os === OS.ANDROID) &&
      isVersionHandledByOldAppiumApi(browser.osVersion)
    ) {
      appiumLegacy = true;
    }

    if (browser.name === BROWSER.SAFARI_MOBILE) {
      browserName = 'safari';
    }

    if (browser.device === DEVICE.IPHONE) {
      deviceName = 'iphone simulator';
    }

    if (browser.device === DEVICE.IPAD) {
      deviceName = 'ipad simulator';
    }

    if ((browser.os === OS.ANDROID) && isUndefined(browser.device)) {
      deviceName = 'android emulator';
    }

    if ((browser.os === OS.ANDROID) &&
      !isVersionHandledByOldAppiumApi(browser.osVersion)
    ) {
      browserName = 'browser';
    }

    if (browser.name === BROWSER.EDGE) {
      browserName = 'microsoftedge';
    }

    // do it like that until only available version on SauceLabs and BrowserStack
    // is different
    if ((browser.name === BROWSER.EDGE) && isUndefined(browser.version)) {
      browserVersion = '20.10240';
    }

    let config = {
      browserName,
      name: browser.displayName
    };

    if (appium) {
      config = {
        ...config,
        deviceName,
        deviceOrientation: 'portrait',
        platformName: browser.os,
        platformVersion: browser.osVersion,
        appiumVersion: '1.4.16'
      };

      if (appiumLegacy) {
        return {
          ...config,
          browserName: '',
          automationName: 'Selendroid'
        };
      }
      
      return config;
    }
    
    return {
      ...config,
      version: browserVersion,
      platform: browser.os + (browser.osVersion ? ` ${browser.osVersion}` : ''),
    };
  }

  /**
   * @constant {Number} TIMEOUT
   * @description maximal time to wait for server response
   */
  static get TIMEOUT() {
    return 3 * 60 * 1000;
  }

  /**
   * @constant {String} name
   * @description name of the provider
   */
  static get name() {
    return 'saucelabs';
  }
}
