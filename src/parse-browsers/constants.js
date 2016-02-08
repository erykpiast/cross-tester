/**
 * @module constants
 * @description only source of names; ANY name should be hardcoded, constant
 *   have to be used EVERYWHERE
 *
 *   NOTE: lower case letters are intentional, it's easier to follow convention
 *   everywhere and use simple === to compare strings
 */

/**
 * @constant {Object} BROWSER
 * @access public
 * @description collection of normalized browser names
 */
export const BROWSER = {
  IE: 'internet explorer',
  FF: 'firefox',
  CHROME: 'chrome',
  SAFARI: 'safari',
  EDGE: 'edge',
  ANDROID: 'android browser',
  SAFARI_MOBILE: 'safari mobile'
};


/**
 * @constant {Object} BROWSER_ALIAS
 * @access public
 * @description collection of equivalent names for each browser
 */
export const BROWSER_ALIAS = {
  [BROWSER.IE]: [
    'ie',
    'msie',
    'explorer',
    'internet explorer',
    'ms internet explorer',
    'microsoft internet explorer'
  ],
  [BROWSER.FF]: [
    'ff',
    'firefox',
    'mozilla firefox',
    'mozilla'
  ],
  [BROWSER.CHROME]: [
    'chrome',
    'google chrome'
  ],
  [BROWSER.SAFARI]: [
    'safari',
    'apple safari',
    'desktop safari',
    'safari desktop'
  ],
  [BROWSER.EDGE]: [
    'edge',
    'microsoft edge',
    'ms edge'
  ],
  [BROWSER.ANDROID]: [
    'android browser',
    'google android browser',
    'android'
  ],
  [BROWSER.SAFARI_MOBILE]: [
    'safari mobile',
    'mobile safari',
    'ios safari',
    'safari'
  ]
};


/**
 * @constant {Object} OS
 * @access public
 * @description collection of normalized OS names
 */
export const OS = {
  IOS: 'ios',
  ANDROID: 'android',
  WINDOWS: 'windows',
  OSX: 'os x',
  LINUX: 'linux'
};


/**
 * @constant {Object} OS_PREFERABLE_VERSION
 * @access public
 * @description mapping from OS name to its the most prefered version (to use
 *   if no version provided); chosen based on number of available browser versions;
 *   probably should base on popularity...
 */
export const OS_PREFERABLE_VERSION = {
  [OS.IOS]: '9.1',
  [OS.ANDROID]: '5.0',
  [OS.WINDOWS]: '7',
  [OS.OSX]: '10.11',
  [OS.LINUX]: 'linux'
};


/**
 * @constant {Object} OS_ALIAS
 * @access public
 * @description collection of equivalent names for each OS
 */
export const OS_ALIAS = {
  [OS.IOS]: [
    'ios',
    'apple ios'
  ],
  [OS.ANDROID]: [
    'android',
    'google android'
  ],
  [OS.WINDOWS]: [
    'windows',
    'microsoft windows',
    'ms windows',
    'win'
  ],
  [OS.OSX]: [
    'os x',
    'apple os x',
    'mac os x',
    'mac os',
    'mac'
  ],
  [OS.LINUX]: [
    'linux',
    'the best os'
  ]
};


/**
 * @constant {Object} OS_VERSION_MAPPING
 * @access public
 * @description collection of mapping from OS version name to number; notice,
 *   that some names refers to version ranges (ex. Android Jelly Bean it's
 *   from 4.1 to 4.3), then the newest version is taken
 */
export const OS_VERSION_MAPPING = {
  [OS.ANDROID]: {
    'ice cream sandwich': '4',
    'jelly bean': '4.3',
    'kitkat': '4.4',
    'lollipop': '5.1'
  },
  [OS.OSX]: {
    'snow leopard': '10.6',
    'lion': '10.7',
    'mountain lion': '10.8',
    'mavericks': '10.9',
    'yosemite': '10.10',
    'el capitan': '10.11'
  }
};


/**
 * @constant {Object} SYSTEM_BROWSER
 * @access public
 * @description map from browser version to version of OS that it works with
 */
export const SYSTEM_BROWSER = {
  [BROWSER.IE]: {
    '11': '10',
    '10': '8',
    '9': '7',
    '8': '7'
  },
  [BROWSER.EDGE]: {
    '20': '10',
    '12': '10'
  },
  [BROWSER.SAFARI]: {
    '9': '10.11',
    '8': '10.10',
    '7': '10.9',
    '6.2': '10.8',
    '6': '10.7',
    '5.1': '10.6'
  }
};


/**
 * @constant {Object} DEVICE
 * @access public
 * @description collection of normalized device names
 */
export const DEVICE = {
  IPHONE: 'iphone',
  IPAD: 'ipad',
  ANDROID_EMULATOR: 'android emulator',
  IPHONE_SIMULATOR: 'iphone simulator',
  IPAD_SIMULATOR: 'ipad simulator'
};
