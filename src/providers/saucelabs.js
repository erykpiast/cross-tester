import webdriver from 'wd';
// it's soo cool to override globals! (yes, Promise is one for some time)
import Promise from 'bluebird';
import { parse as parseUrl } from 'url';
import request from 'request-promise';


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
  'Browser.SelfSupportBackend'
];

const RESULTS_ARRAY_NAME = 'window.__results__';

const DEFAULT_TIMEOUT = 60 * 1000;
const chromeLogMessagePattern = /^(javascript|(?:(?:https?|chrome-extension)\:\/\/\S+))\s+(\d+:\d+)\s+(.*)$/i;
const firefoxAddonLogPattern = /^(\d{13})\t(\S*(?:addons|extensions)\S*)\t([A-Z]+)\t(.*)\n?$/i;
const androidEmulatorLogMessagePattern = /^\[([0-9\-\A-Z:]+)\](?:\s+\[[A-Z]+\]\s+[A-Z]{1}\/[a-z0-9\/\._]+\s*(?:\[[^\]]+\])?\(\s+\d+\)\:\s+)?(?:\-+\s+beginning\s+of\s+[a-z]+)?(.*)$/i;
const androidEmulatorLogBrowserMessagePattern = /^\[([0-9\-\A-Z:]+)\]\s+\[[A-Z]+\]\s+I\/chromium\(\s+\d+\)\:\s+\[([A-Z]+)\:CONSOLE\(\d+\)\]\s+\"(.*)",\s+source\:\s+(\S*)\s+\((\d+)\)$/i;


export const name = 'saucelabs';

/**
 * @function getConcurrencyLimit - returns concurrency limit for the account
 *
 * @param {String} userName
 * @param {String} accessToken
 *
 * @return {Promise<Number>} number of available concurrent VMs for the account
 */
export function getConcurrencyLimit(userName, accessToken) {
  const API_ROOT = 'https://saucelabs.com/rest/v1/';
  return request(API_ROOT + `users/${userName}/concurrency`, {
    auth: {
      user: userName,
      pass: accessToken,
      sendImmediately: false
    }
  }).then((res) => {
    const parsed = JSON.parse(res);
    return parseInt(parsed.concurrency[userName].remaining.mac, 0);
  });
}

export function createTest(browser, userName, accessToken) {
  let driver;
  let browserLogs = [];
  let browserLogsGot = 0;


  function enter() {
    return () => {
      driver = webdriver.remote({
        hostname: 'ondemand.saucelabs.com',
        port: 80,
        user: userName,
        pwd: accessToken
      }, 'promise');

      // maybe we can use this?
      // wd.configureHttp({
      //   timeout: 10000,
      //   retries: 3,
      //   retryDelay: 100
      // });
      return Promise.race([
        Promise.delay(DEFAULT_TIMEOUT).then(() => {
          throw new Error(`cannot connect to SauceLabs in ${DEFAULT_TIMEOUT} seconds`);
        }),
        driver.init(browser)
        .then((_session_) => {
          return _session_[1];
        }, (err) => {
          if(err.message.match(/(The environment you requested was unavailable)|(Browser combination invalid)/)) {
            throw new Error(`browser ${browser.browserName} ${browser.version} is not supported (${err.message})`);
          } else {
            throw err;
          }
        })
      ]);
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

    return () => driver.logTypes().then(
      (types) =>
        (Array.isArray(types) && types.indexOf('browser') !== -1 ?
          driver.log('browser') :
          Promise.resolve([])
        ),
      () => [] // supress error
    )
    .then((logs) =>
      browserLogs = browserLogs.concat(logs)
    ).then((logs) => {
      const notGot = logs.slice(browserLogsGot);

      browserLogsGot = logs.length;

      return notGot.filter((log) =>
        levels[log.level].value >= level
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
    return () => driver.execute(`return JSON.stringify(${RESULTS_ARRAY_NAME});`)
      .then((json) => JSON.parse(json));
  }


  function execute(code) {
    return () => driver.safeExecute(code);
  }


  function sleep(time) {
    return () => driver.sleep(time);
  }


  function open(url) {
    return () =>
      Promise.race([
        Promise.delay(DEFAULT_TIMEOUT).then(() => {
          throw new Error(`cannot open page ${url} in ${DEFAULT_TIMEOUT} seconds`);
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
