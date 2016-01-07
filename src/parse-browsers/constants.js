/**
 * @constant {Object} BROWSER
 * @access public
 * @description collection of normalized browser names
 */
export const BROWSER = {
  IE: 'Internet Explorer',
  FF: 'Firefox',
  CHROME: 'Chrome',
  SAFARI: 'Safari',
  EDGE: 'Edge',
  ANDROID: 'Android Browser',
  SAFARI_MOBILE: 'Safari Mobile'
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
    'internet explorer',
    'ms internet explorer',
    'microsoft internet explorer'
  ],
  [BROWSER.FF]: [
    'ff',
    'firefox',
    'mozilla firefox'
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
  IOS: 'iOS',
  ANDROID: 'Android',
  WINDOWS: 'Windows',
  OSX: 'OS X',
  LINUX: 'Linux'
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
  [OS.LINUX]: 'Linux'
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
    'Ice Cream Sandwich': '4',
    'Jelly Bean': '4.3',
    'KitKat': '4.4',
    'Lollipop': '5.1'
  },
  [OS.OSX]: {
    'Snow Leopard': '10.6',
    'Lion': '10.7',
    'Mountain Lion': '10.8',
    'Mavericks': '10.9',
    'Yosemite': '10.10',
    'El Capitan': '10.11'
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
  IPHONE: 'iPhone',
  IPAD: 'iPad',
  ANDROID_EMULATOR: 'Android Emulator',
  IPHONE_SIMULATOR: 'iPhone Simulator',
  IPAD_SIMULATOR: 'iPad Simulator'
};
