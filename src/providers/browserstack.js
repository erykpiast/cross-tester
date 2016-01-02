import webdriver from 'browserstack-webdriver';
// it's soo cool to override globals! (yes, Promise is one for some time)
import Promise from 'bluebird';
import { parse as parseUrl } from 'url';
import request from 'request-promise';
import { assign } from 'lodash';


const levels = {
  'SEVERE': {
    value: 1100,
    color: 'red'
  },
  'ERROR': {
    value: 1000,
    color: 'red'
  },
  'WARNING': {
    value: 900,
    color: 'yellow'
  },
  'INFO': {
    value: 800,
    color: 'cyan'
  },
  'LOG': {
    value: 800,
    color: 'cyan'
  },
  'DEBUG': {
    value: 700,
    color: 'magenta'
  }
};

const ignoredLogs = [
  // useful hints from Firefox, we don't need them to be printed
  'Using //@ to indicate sourceURL pragmas is deprecated',
  'Using //@ to indicate sourceMappingURL pragmas is deprecated',
  'Use of getPreventDefault() is deprecated',
  'Use of Mutation Events is deprecated',
  'Empty string passed to getElementById()',
  `Use of attributes' nodeValue attribute is deprecated`,
  'This site makes use of a SHA-1 Certificate',
  'Use of getAttributeNode() is deprecated',
  'mutating the [[Prototype]] of an object will cause your code to run very slowly',
  `Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience`,
  'An unbalanced tree was written using document.write() causing data from the network to be reparsed',
  `HTMLVideoElement.webkitSupportsFullscreen' is deprecated`,
  `Expected ,' in media list but found 'screen`,
  `Expected ',' in media list but found 'and('`,
  'Unexpected end of file while searching for closing } of invalid rule set',
  'Property contained reference to invalid variable',
  // CSS related
  'Declaration dropped',
  'Ruleset ignored due to bad selector',
  'Expected declaration but found',
  'Expected media feature name but found',
  'Unrecognized at-rule',
  'Keyframe rule ignored due to bad selector',
  // addons stuff
  'Could not read chrome manifest',
  'blocklist is disabled',
  'Trying to re-register CID',
  'chrome-extension://',
  'resource://',
  'Native module at path',
  'Failed to load native module at path',
  'Component returned failure code',
  'While registering XPCOM module',
  // Facebook script
  'Invalid App Id: Must be a number or numeric string representing the application id.',
  'The "fb-root" div has not been created, auto-creating',
  'FB.getLoginStatus() called before calling FB.init().',
  'FB.init has already been called - this could indicate a problem',
  // SalesManago
  'app2.salesmanago.pl',
  'Displaying ad:',
  'No slot for:',
  'SM AP:',
  // Qualtrics
  'Please remove it from your site or contact your Qualtrics Administrator',
  // just useless here
  'server does not support RFC 5746, see CVE-2009-3555',
  'Mixed Content',
  'downloadable font',
  'Unexpected end of file while searching for end of @media, @supports or @-moz-document rule',
  'Blocked loading mixed active content',
  'The character encoding of the HTML document was not declared',
  'A call to document.write() from an asynchronously-loaded external script was ignored',
  `Failed to execute 'write' on 'Document'`,
  'Password fields present on an insecure (http://) page',
  'Password fields present in a form with an insecure (http://) form action',
  'WebGL: Error during native OpenGL init',
  'WebGL: WebGL creation failed',
  'to start media query expression but found',
  'The page was reloaded, because the character encoding declaration of the HTML document was not found when prescanning the first 1024 bytes of the file',
  'Refused to set unsafe header',
  'The character encoding of a framed document was not declared',
  'While creating services from category',
  'unrecognized command line flag',
  'Only application manifests may use',
  'Get a connection to permissions.sqlite.',
  'DB table(moz_perms) is created',
  'Browser.SelfSupportBackend',
  'Invalid CSS'
];

const RESULTS_ARRAY_NAME = 'window.__results__';

const DEFAULT_TIMEOUT = 300 * 1000;
const chromeLogMessagePattern = /^(javascript|(?:(?:https?|chrome-extension)\:\/\/\S+))\s+(\d+:\d+)\s+(.*)$/i;
const firefoxAddonLogPattern = /^(\d{13})\t(\S*(?:addons|extensions)\S*)\t([A-Z]+)\t(.*)\n?$/i;
const androidEmulatorLogMessagePattern = /^\[([0-9\-\A-Z:]+)\](?:\s+\[[A-Z]+\]\s+[A-Z]{1}\/[a-z0-9\/\._]+\s*(?:\[[^\]]+\])?\(\s+\d+\)\:\s+)?(?:\-+\s+beginning\s+of\s+[a-z]+)?(.*)$/i;
const androidEmulatorLogBrowserMessagePattern = /^\[([0-9\-\A-Z:]+)\]\s+\[[A-Z]+\]\s+I\/chromium\(\s+\d+\)\:\s+\[([A-Z]+)\:CONSOLE\(\d+\)\]\s+\"(.*)",\s+source\:\s+(\S*)\s+\((\d+)\)$/i;


export const name = 'browserstack';

/**
 * @function getConcurrencyLimit - returns concurrency limit for the account
 *
 * @param {String} userName
 * @param {String} accessToken
 *
 * @return {Promise<Number>} number of available concurrent VMs for the account
 */
export function getConcurrencyLimit(userName, accessToken) {
  const API_ROOT = 'https://www.browserstack.com/';
  return request(API_ROOT + `automate/plan.json`, {
    auth: {
      user: userName,
      pass: accessToken,
      sendImmediately: false
    }
  }).then((res) => {
    const parsed = JSON.parse(res);
    return parseInt(parsed.parallel_sessions_max_allowed, 0);
  });
}


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
export function createTest(browser, userName, accessToken) {
  let driver;
  let browserLogs = [];
  let browserLogsGot = 0;


  function enter() {
    return () => {
      driver = new webdriver.Builder()
        .usingServer('http://hub.browserstack.com/wd/hub')
        .withCapabilities(assign({}, browser, {
          'browserstack.user': userName,
          'browserstack.key': accessToken,
          'loggingPrefs': { 'browser': 'ALL' },
        }))
        .build();

      return Promise.race([
        Promise.delay(DEFAULT_TIMEOUT).then(() => {
          throw new Error(`cannot connect to SauceLabs in ${DEFAULT_TIMEOUT} ms`);
        }),
        driver.session_.then((session) => session, (err) => {
          if(err.message.match(/(Browser_Version not supported)|(Browser combination invalid)/)) {
            throw new Error(`browser ${browser.browserName} ${browser.version} is not supported (${err.message})`);
          } else {
            throw err;
          }
        })
      ]);

      // maybe we can use this?
      // wd.configureHttp({
      //   timeout: 10000,
      //   retries: 3,
      //   retryDelay: 100
      // });
    };
  }


  function _formatUrl(url) {
    const { protocol, hostname, port, pathname } = parseUrl(url);

    return [
      protocol ? `${protocol}//` : '',
      hostname,
      port && (port !== 80) ? ':' + port : '',
      pathname
    ].join('');
  }


  function getBrowserLogs(levelName) {
    const level = ((levels[levelName] || { value: 0 }).value || levels.INFO.value);
    const logger = new webdriver.WebDriver.Logs(driver);

    return () => logger
    .getAvailableLogTypes()
    .then(
      (types) =>
        (Array.isArray(types) && types.indexOf('browser') !== -1 ?
          logger.get('browser') :
          Promise.resolve([])
        ),
      () => [] // supress error
    )
    .then((logs) =>
      browserLogs = browserLogs.concat(logs),
      (err) => {
        if (/Command not found|not implemented/.test(err.message)) {
          return browserLogs;
        }

        throw err;
      }
    ).then((logs) => {
      const notGot = logs.slice(browserLogsGot);

      browserLogsGot = logs.length;

      return notGot.filter((log) =>
        levels[log.level.name].value >= level
      );
    })
    .then((logs) =>
    // parse Firefox logs from addons and Chrome logs
      logs.map((log) => {
        // parse logs from Firefox addons
        const addonLog = log.message.match(firefoxAddonLogPattern);
        if(addonLog) {
          return {
            addon: true,
            timestamp: addonLog[1],
            level: addonLog[3],
            message: `${addonLog[2]}: ${addonLog[4]}`
          };
        }

        // parse logs from Chrome
        const chromeLogMessage = log.message.match(chromeLogMessagePattern);
        if(chromeLogMessage) {
          return {
            addon: chromeLogMessage[1].indexOf('chrome-extension://') === 0,
            timestamp: log.timestamp,
            level: log.level,
            file: _formatUrl(chromeLogMessage[1]),
            line: chromeLogMessage[2],
            message: chromeLogMessage[3]
          };
        }

        // parse logs from Android emulator
        if(log.message.match(androidEmulatorLogMessagePattern)) {
          const androidEmulatorBrowserMessage = log.message.match(androidEmulatorLogBrowserMessagePattern);
          if(androidEmulatorBrowserMessage) {
            return {
              addon: false,
              timestamp: Date.parse(androidEmulatorBrowserMessage[1]),
              level: androidEmulatorBrowserMessage[2],
              file: androidEmulatorBrowserMessage[4] ? _formatUrl(androidEmulatorBrowserMessage[4]) : '',
              line: androidEmulatorBrowserMessage[5],
              message: androidEmulatorBrowserMessage[3]
            };
          } else {
            return null;
          }
        }

        // try to parse custom logs where message is stringified object
        let parsed;
        try {
          parsed = JSON.parse(log.message);
        } catch(err) { }

        if(parsed && ('object' === typeof parsed.message) && (parsed.message !== null)) {
          return {
            timestamp: Math.round(parsed.message.timestamp * 1000),
            level: parsed.message.level,
            file: _formatUrl(parsed.message.url),
            line: `${parsed.message.line}:${parsed.message.column}`,
            message: parsed.message.text
          };
        }

        return log;
      })
      .filter((log) => !log.addon)
      .filter((log) =>
        !(ignoredLogs.some((messageToIgnore) =>
          log.message.indexOf(messageToIgnore) > -1
        ))
      )
    )
    .then((logs) =>
      (browserLogs = logs)
    );
  }


  function getResults() {
    // it more safe to send stringified results through WD and parse it here
    // ex. MS Edge likes return arrays as object with numeric keys
    return () => driver.executeScript(`return JSON.stringify(${RESULTS_ARRAY_NAME});`)
      .then((json) => JSON.parse(json));
  }


  function execute(code) {
    return () => driver.executeScript(code);
  }


  function sleep(time) {
    return () => driver.sleep(time);
  }


  function open(url) {
    return () =>
      Promise.race([
        Promise.delay(DEFAULT_TIMEOUT).then(() => {
          throw new Error(`cannot open page ${url} in ${DEFAULT_TIMEOUT} ms`);
        }),
        driver.get(url)
          .then(execute(`${RESULTS_ARRAY_NAME} = [];`))
      ]);
  }


  function quit() {
    return () => driver.quit();
  }


  return {
    enter,
    quit,
    open,
    getBrowserLogs,
    getResults,
    execute,
    sleep
  };
}


/**
 * @function parseBrowser - adapt browser definition object to format accepted
 *   by provider
 * @access public
 *
 * @param {Object} browser
 *   @property {String} name
 *   @property {String} version
 *   @property {String} os
 *   @property {String} osVersion
 *   @property {String} device
 * @param {String} displayName
 *
 * @return {Object}
 *   @property {String} name - human-readable test name
 *    - for Appium (mobile browsers)
 *   @property {String} browserName
 *   @property {String} version
 *   @property {String} platform
 *   @property {String} device
 *    - for Selenium (desktop browsers)
 *   @property {String} browser
 *   @property {String} browser_version
 *   @property {String} os
 *   @property {String} os_version
 */
export function parseBrowser(browser, displayName) {
  let browserName = ({
    'microsoft edge': 'Edge',
    'edge': 'Edge',
    'ie': 'IE',
    'internet explorer': 'IE',
    'google chrome': 'chrome',
    'mozilla firefox': 'firefox',
    'ff': 'firefox',
    'apple safari': 'Safari',
    'ios safari': 'Safari',
    'safari mobile': 'Safari',
    'iphone': 'Safari',
    'ipad': 'Safari',
    'android browser': 'Android'
  })[browser.name.toLowerCase()] || browser.name;

  let osName = ({
    'mac': 'OS X',
    'android': 'ANDROID',
    'ios': 'MAC'
  })[browser.os.toLowerCase()] || browser.os;

  const osVersion = (({
    'OS X': {
      '10.6': 'Snow Leopard',
      '10.7': 'Lion',
      '10.8': 'Mountain Lion',
      '10.9': 'Mavericks',
      '10.10': 'Yosemite',
      '10.11': 'El Capitan'
    }
  })[osName] || {})[browser.osVersion.toLowerCase()] || browser.osVersion;

  let appium = false;
  let deviceName = (browser.device || '').toLowerCase();
  if ((browserName === 'Safari') && (['iphone', 'ipad'].indexOf((deviceName || '').split(' ')[0]) !== -1)) {
    browserName = 'iPad';
    appium = true;

    // find device based on OS version
    // general names like iPhone or iPad are not enough too
    if ((!deviceName || (deviceName === 'iphone') || (deviceName === 'ipad')) && browser.osVersion) {
      if (deviceName === 'iphone') {
        deviceName = ({
          '8': 'iPhone 6',
          '8.3': 'iPhone 6',
          '7': 'iPhone 5S',
          '6': 'iPhone 5',
          '5.1': 'iPhone 4S',
          '5': 'iPhone 4S'
        })[browser.osVersion.toLowerCase().replace(/\.0$/, '')];
      } else {
        deviceName = ({
          '8': 'iPad Air',
          '8.3': 'iPad Air',
          '7': 'iPad 4th',
          '6': 'iPad 3rd (6.0)',
          '5.1': 'iPad 3rd',
          '5': 'iPad 2 (5.0)'
        })[browser.osVersion.toLowerCase().replace(/\.0$/, '')];
      }
    }
  } else if (browserName === 'Android') {
    appium = true;

    // find device based on OS version
    if (!deviceName && browser.osVersion) {
      deviceName = ({
        '5': 'Google Nexus 5',
        'lollipop': 'Google Nexus 5',
        '4.4': 'Samsung Galaxy S5',
        'kitkat': 'Samsung Galaxy S5',
        '4.3': 'Samsung Galaxy S4',
        'jelly bean': 'Samsung Galaxy S4',
        '4.2': 'Google Nexus 4',
        '4.1': 'Samsung Galaxy S3',
        '4': 'Google Nexus',
        'ice cream sandwich': 'Google Nexus'
      })[browser.osVersion.toLowerCase().replace(/\.0$/, '')];
    }
  }

  const config = {
    name: `CrossTester - ${displayName}`
  };

  if (appium) {
    assign(config, {
      browserName: browserName,
      device: deviceName,
      platform: browserName === 'iPad' ? 'MAC' : 'ANDROID'
    });
  } else {
    assign(config, {
      browser: browserName,
      browser_version: browser.version,
      os: osName,
      os_version: osVersion
    });
  }

  return config;
}
