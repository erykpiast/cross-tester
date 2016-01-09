import {
  contains,
  invertObj
} from 'ramda';
import {
  OS,
  OS_PREFERABLE_VERSION,
  BROWSER,
  SYSTEM_BROWSER,
  DEVICE
} from './constants';


/**
 * @function browserVersion
 * @access public
 * @description try to find the best browser version for specified OS version
 *   or the latest one
 *
 * @param {String} on - OS name
 * @param {String} ov - OS version
 * @param {String} bn - browser name
 *
 * @returns {String}
 */
export function browserVersion(on, ov, bn) {
  if (
    ((on === OS.MAC) && (bn === BROWSER.SAFARI)) ||
    ((on === OS.WINDOWS) && (bn === BROWSER.IE))
  ) {
    return invertObj(SYSTEM_BROWSER[bn])[ov];
  }

  if (
    ((on === OS.IOS) && (bn === BROWSER.SAFARI_MOBILE)) ||
    ((on === OS.ANDROID) && (bn === BROWSER.ANDROID))
  ) {
    return ov;
  }

  return 'latest';
}

/**
 * @function osName
 * @access public
 * @description try to find the best OS for given browser
 *
 * @param {String} bn - browser name
 *
 * @returns {String|undefined}
 */
export function osName(bn) {
  if ((bn === BROWSER.IE) || (bn === BROWSER.EDGE)) {
    return OS.WINDOWS;
  }

  if ((bn === BROWSER.SAFARI) || (bn === BROWSER.CHROME)) {
    return OS.OSX;
  }

  if (bn === BROWSER.FF) {
    return OS.LINUX;
  }

  if (bn === BROWSER.ANDROID) {
    return OS.ANDROID;
  }

  if (bn === BROWSER.SAFARI_MOBILE) {
    return OS.IOS;
  }
}


/**
 * @function osVersion
 * @access public
 * @description try to find the best version of given OS for browser version
 *
 * @param {String} on - OS name
 * @param {String} bn - browser name
 * @param {String} bv - browser version
 *
 * @returns {String|undefined}
 */
export function osVersion(on, bn, bv) {
  if (
    ((on === OS.MAC) && (bn === BROWSER.SAFARI)) ||
    ((on === OS.WINDOWS) && contains(bn)([BROWSER.IE, BROWSER.EDGE]))
  ) {
    return SYSTEM_BROWSER[bn][bv];
  }

  if (
    ((on === OS.IOS) && (bn === BROWSER.SAFARI_MOBILE)) ||
    ((on === OS.ANDROID) && (bn === BROWSER.ANDROID))
  ) {
    return bv;
  }

  return OS_PREFERABLE_VERSION[on];
}


/**
 * @function deviceName
 * @access public
 * @description try to find the best device for the browser
 *
 * @param {String} on - OS name
 * @param {String} bn - browser name
 *
 * @returns {String|undefined}
 */
export function deviceName(on, bn) {
  if ((on === OS.IOS) && (bn === BROWSER.SAFARI_MOBILE)) {
    return DEVICE.IPHONE_SIMULATOR;
  }

  if ((on === OS.ANDROID) && (bn === BROWSER.ANDROID)) {
    return DEVICE.ANDROID_EMULATOR;
  }
}
