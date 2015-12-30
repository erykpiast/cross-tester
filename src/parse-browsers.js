// WARNING!
// fake mouse moves to the middle of the screen are generated on Windows
// use MAC platform when possible

// Apple devices version market share
// http://david-smith.org/iosversionstats/
import {
  each,
  extend,
  omit,
  mapValues,
  isObject,
  isString,
  isNumber
} from 'lodash';

function _removeWorkingKeys(obj) {
  return mapValues(obj, (browser) =>
    omit(browser, [ 'versions', 'deviceType', 'deviceName', 'versionName', 'osVersion' ])
  );
}


/**
 * @function parseBrowsers - make browsers definition object flat and compatible with Selenium
 *
 * @param {Object} nested - nested browsers definition object
 *   @property {Object} BROWSER - definition of single group of browsers; the "browser" key is human-readable name (like Chrome, Internet Explorer)
 *     @property {String} browserName - name of the browser for Selenium (like firefox, chrome, iPhone)
 *     @property {String} deviceName - name of the device to run the browser on (mostly for Apple devices, like iPhone, iPad)
 *     @property {Object} versions - versions of the browser
 *       @property {String|Object} VERSION - single version of the browser; the "version" key is human-readable name (like previous, current);
 *         - if it's a string, it's just copied to "version" property of target object
 *         - if it's an object it has properties:
 *         @property {String} osVersion - version of operating system (mostly for iOS, like 7.1, 8)
 *         @property {String[]} devices - device models to run the browser on (mostly for Apple devices, like Plus, 5S, Mini 3);
 *           this will be concatenated with value of "deviceName" field and copied to "device" property of target object
 *     @property {String} platform - name of the Selenium platform to run the browser on (like Windows, MAC)
 *     @property {String} osVersion - version of os to run the browser on (like 8.1, 10.10)
 *     @property {String} device - name of the Selenium (Appium?) device to run the browser on (like iPhone 6 Plus, iPad 3)
 *     @property {*} ANY - whatever you want, it will be copied to target object (like realMobile)
 *
 * @return {Object} flat browsers definition object
 *   @property {Object} BROWSER - definition of single browser; the "browser" key is in format
 *     - for "device browsers" like iPhone and iPad Safari:
 *         `${browserName} ${versionName} (${version.osVersion}) - ${browser.deviceName} ${deviceModel}`
 *     - for any other browser:
 *         `${browserName} ${versionName} (${version})`
 *     @property {String} browserName - name of the browser for Selenium (like firefox, chrome, iPhone)
 *     @property {String} version - version of the browser for Selenium (like 11, 41, 8.1)
 *     @property {String} platform - name of the Selenium platform to run the browser on (like Windows, MAC)
 *     @property {String} os_version - version of os to run the browser on (like 8.1, 10.10)
 *     @property {String} device - name of the Selenium (Appium?) device to run the browser on (like iPhone 6 Plus, iPad 3)
 *     @property {*} ANY - any property (except versions, deviceType, deviceName, versionName) from source object (like realMobile)
 */
export default function parseBrowsers(nested) {
  const flat = { };

  each(nested, (browser, browserName) => {
    if(!isObject(browser.versions)) {
      throw new Error('wrong object format: versions property must be an object');
    }

    each(browser.versions, (version, versionName) => {
      if(isObject(version) && version.hasOwnProperty('devices') && Array.isArray(version.devices)) {
        version.devices.forEach((deviceModel) => {
          const key = `${browserName} ${version.osVersion} - ${browser.deviceName} ${deviceModel}`;

          flat[key] = extend({}, browser, {
            browserName: browser.browserName,
            platform: browser.platform,
            os_version: (version.osVersion || browser.osVersion).toString(),
            device: `${browser.deviceName} ${deviceModel}`
          });
        });
      } else if(isString(version) || isNumber(version)) {
        const key = `${browserName} ${version}`;

        flat[key] = extend({}, browser, {
          browserName: browser.browserName,
          platform: browser.platform + (browser.hasOwnProperty('osVersion') ? ` ${browser.osVersion}` : ''),
          version: version.toString()
        });
      } else if(version === null) {
        console.warn(`There is no defined version for ${browserName} ${versionName}`);
      } else {
        throw new Error('wrong object format: version has to be an object or a string');
      }
    });
  });

  return _removeWorkingKeys(flat);
}