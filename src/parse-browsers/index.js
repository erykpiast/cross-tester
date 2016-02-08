import {
  pickBy,
  complement,
  is,
  pipe,
  map,
  flatten,
  contains,
  isNil
} from 'ramda';
import {
  OS,
  BROWSER
} from './constants';
import {
  browserVersion as guessBrowserVersion,
  osName as guessOsName,
  osVersion as guessOsVersion,
  deviceName as guessDeviceName
} from './guess';
import {
  browserName as normalizeBrowserName,
  browserVersion as normalizeBrowserVersion,
  osName as normalizeOsName,
  osVersion as normalizeOsVersion,
  deviceName as normalizeDeviceName
} from './normalize';

const isObject = is(Object);
const isArray = is(Array);
const isUndefined = (v) => 'undefined' === typeof v;
const entries = (o) => Object.keys(o).map((key) => [o[key], key]);
const omitUndefinedKeys = pickBy(complement(isUndefined));
const toLowerCase = (v) => isNil(v) ? v : v.toString().toLowerCase();
const mapToLowerCase = map(toLowerCase);

/**
 * @type {Object} BrowserDefinition
 * @description describes browser configuration in standarized way
 *
 * @property {String} displayName - human-readable name
 * @property {String} name - standarized, formal name of the browser
 * @property {String} version - numeric version of the browser
 * @property {String} os - standarized name of the OS
 * @property {String} osVersion - numeric version of the OS
 * @property {String} [device=undefined] - standarized, full name of the device
 */

/**
 * @function parseBrowsers
 * @access public
 * @description create BrowserDefinition object from eventually not completed
 *   configuration
 *
 * @param {Object} config - collection of congiguration objects; key is display
 *   name, value is configuration for the browser; number of keys in the object
 *   does not determine number of output BrowserDefinition objects; depending on
 *   existence of `versions` and `devices` fields it may be many times more
 *   @property {String} name - formal browser name
 *   @property {String} [version] - numeric version of the browser, may be defined
 *     in `versions` object
 *   @property {String} [os] - name of the os, may be defined in `versions` object
 *     or not defined at all
 *   @property {String} [osVersion] - version (numeric or codename) of the OS,
 *     may be defined in `versions` object or not defined at all
     @property {String} [device] - full or partial name of the device,
       may be defined in `versions` object or not defined at all
 *   @property {Object} [versions] - required if `version` key is not present
 *     key is display name for the version, value may be numeric version or
 *     version configuration object
 *     @property {String} [version]
 *     @property {String} [os]
 *     @property {String} [osName]
 *     @property {String} [device]
 *     @property {String[]} [devices] - collection of devices to run the browser
 *       on, full or partial names (concatenated) with `deviceName` if provided
 *       on any level
 *
 * @returns {BrowserDefinition[]}
 */
export default function parseBrowsers(config) {
  return pipe(
    entries,
    map(([browser, displayName]) => {
      if(isObject(browser.versions)) {
        return _parseMultiVersionDefinition(browser, displayName);
      }

      return _parseSingleVersionDefinition(browser, displayName);
    }),
    flatten,
    map(omitUndefinedKeys)
  )(config);
}


/**
 * @function _parseSingleVersionDefinition
 * @access private
 * @description try to create BrowserDefinition object based on given parameters
 *
 * @param {Object} browser - browser parameters
 *   @property {String} name - formal name of the browser
 *   @property {String} version - numeric version of the browser
 *   @property {String} [os] - name of OS to run the browser
 *   @property {String} [osVersion] - version of the OS; numeric or name
 *   @property {String} [deviceName] - full name of the device
 * @param {String} displayName
 *
 * @returns {BrowserDefinition}
 */
function _parseSingleVersionDefinition(browser, displayName) {
  const browserName = normalizeBrowserName(browser.name);
  if (isUndefined(browserName)) {
    throw new Error('browser name must be defined');
  }

  let browserVersion = normalizeBrowserVersion(browser.version);
  let osName = normalizeOsName(browser.os);
  let osVersion = normalizeOsVersion(browser.osVersion);
  let deviceName = normalizeDeviceName(browser.device);

  return _createBrowserDefinitionObject({
    displayName,
    browserName,
    browserVersion,
    osName,
    osVersion,
    deviceName
  });
}


/**
 * @function _parseMultiVersionDefinition
 * @access private
 * @description try to create BrowserDefinition object based on given parameters;
 *   one definition is created for each device for each version
 *
 * @param {Object} browser - browser parameters
 *   @property {String} name - formal name of the browser
 *   @property {Object} versions - collection of versions definitions; key in the
 *     object is display name
 *     @property {String} version - numeric version of the browser
 *     @property {String} [os] - name of OS to run the browser version
 *     @property {String} [osVersion] - version of the OS; numeric or name
 *     @property {String} [deviceName] - full name of the device or base name
 *       if `devices` collection is provided
 *     @property {String[]} [devices] - collection of device models; each one
 *       is concatenated with base deviceName (if provided) and produces new
 *       version entity
 *   @property {String} [os] - name of OS to run the browser
 *   @property {String} [osVersion] - version of the OS; numeric or name
 *   @property {String} [deviceName] - full name of the device
 * @param {String} displayName
 *
 * @returns {BrowserDefinition}
 */
function _parseMultiVersionDefinition(browser, displayName) {
  return pipe(
    entries,
    map(([ version, versionName ]) => {
      if(isObject(version)) {
        const browserName = normalizeBrowserName(browser.name);
        if (isUndefined(browserName)) {
          throw new Error('browser name must be defined');
        }

        let browserVersion = normalizeBrowserVersion(version.version || browser.version);
        let osName = normalizeOsName(version.os || browser.os);
        let osVersion = normalizeOsVersion(version.osVersion || browser.osVersion, osName);
        let deviceName = normalizeDeviceName(version.device || browser.device);

        if (isArray(version.devices)) {
          return map((deviceModel) => _createBrowserDefinitionObject({
            displayName: `${displayName} ${versionName}`,
            browserName,
            browserVersion,
            osName,
            osVersion,
            deviceName: isUndefined(deviceName) ?
              deviceModel :
              [ deviceName, deviceModel ].join(' ')
          }), version.devices);
        }

        return _createBrowserDefinitionObject({
          displayName: `${displayName} ${versionName}`,
          browserName,
          browserVersion,
          osName,
          osVersion,
          deviceName
        });
      }

      return _parseSingleVersionDefinition(
        { ...browser, version },
        `${displayName} ${versionName}`
      );
    }),
    flatten
  )(browser.versions);
}


/* eslint-disable no-param-reassign */
function _createBrowserDefinitionObject({
  displayName,
  browserName,
  browserVersion,
  osName,
  osVersion,
  deviceName
}) {
  if(isUndefined(osName)) {
    osName = guessOsName(browserName);

    if (isUndefined(osName)) {
      throw new Error('OS name must be defined');
    }
  }

  if(isUndefined(osVersion)) {
    osVersion = guessOsVersion(osName, browserName, browserVersion);

    if (isUndefined(osVersion)) {
      throw new Error('OS version must be defined');
    }
  }

  // NOTE: it's special case
  if ((browserName === BROWSER.SAFARI) && (osName === OS.IOS)) {
    browserName = BROWSER.SAFARI_MOBILE;
  }

  if(isUndefined(deviceName) && _isDeviceNameRequired(osName)) {
    deviceName = guessDeviceName(osName, browserName);

    if (isUndefined(deviceName)) {
      throw new Error('device name must be defined');
    }
  }

  if(isUndefined(browserVersion)) {
    browserVersion = guessBrowserVersion(osName, osVersion, browserName);

    if (isUndefined(browserVersion)) {
      throw new Error('browser version must be defined');
    }
  }

  return {
    displayName, ...mapToLowerCase({
      name: browserName,
      version: browserVersion,
      os: osName,
      osVersion: osVersion,
      device: deviceName
    })
  };
}
/* eslint-enable no-param-reassign */


/**
 * @function _isDeviceNameRequired
 * @access private
 * @description check if device is required for the OS
 *
 * @param {String} osName
 *
 * @returns {Boolean}
 */
function _isDeviceNameRequired(osName) {
  return contains(osName)([OS.ANDROID, OS.IOS]);
}
