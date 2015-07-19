// WARNING!
// fake mouse moves to the middle of the screen are generated on Windows
// use MAC platform when possible

// Apple devices version market share
// http://david-smith.org/iosversionstats/
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = parseBrowsers;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodashForeach = require('lodash.foreach');

var _lodashForeach2 = _interopRequireDefault(_lodashForeach);

var _lodashAssign = require('lodash.assign');

var _lodashAssign2 = _interopRequireDefault(_lodashAssign);

var _lodashMapvalues = require('lodash.mapvalues');

var _lodashMapvalues2 = _interopRequireDefault(_lodashMapvalues);

var _lodashOmit = require('lodash.omit');

var _lodashOmit2 = _interopRequireDefault(_lodashOmit);

function _removeWorkingKeys(obj) {
    return (0, _lodashMapvalues2['default'])(obj, function (browser) {
        return (0, _lodashOmit2['default'])(browser, ['versions', 'deviceType', 'deviceName', 'versionName']);
    });
}

/**
 * @function parseBrowsers - make browsers definition object flat and compatible with Selenium
 * @param {Object} nested - nested browsers definition object
 * @property {Object} nested[browser] - definition of single group of browsers; the "browser" key is human-readable name (like Chrome, Internet Explorer)
 *     @property {String} nested[browser].browserName - name of the browser for Selenium (like firefox, chrome, iPhone)
 *     @property {String} nested[browser].deviceName - name of the device to run the browser on (mostly for Apple devices, like iPhone, iPad)
 *     @property {Object} nested[browser].versions - versions of the browser
 *         @property {String|Object} nested[browser].versions[version] - single version of the browser; the "version" key is human-readable name (like previous, current);
 *              - if it's a string, it's just copied to "version" property of target object
 *              - if it's an object it has properties:
 *             @property {String} nested[browser].versions[version].osVersion - version of operating system (mostly for iOS, like 7.1, 8)
 *             @property {Array} nested[browser].versions[version].devices - device models to run the browser on (mostly for Apple devices, like Plus, 5S, Mini 3);
 *                 this will be concatenated with value of "deviceName" field and copied to "device" property of target object
 *     @property {String} nested[browser].platform - name of the Selenium platform to run the browser on (like Windows, MAC)
 *     @property {String} nested[browser].os_version - version of os to run the browser on (like 8.1, 10.10)
 *     @property {String} nested[browser].device - name of the Selenium (Appium?) device to run the browser on (like iPhone 6 Plus, iPad 3)
 *     @property {*} nested[browser][any] - whatever you want, it will be copied to target object (like realMobile)
 * @return {Object} flat browsers definition object
 * @property {Object} flat[browser] - definition of single browser; the "browser" key is in format
 *     - for "device browsers" like iPhone and iPad Safari:
 *         `${browserName} ${versionName} (${version.osVersion}) - ${browser.deviceName} ${deviceModel}`
 *     - for any other browser:
 *         `${browserName} ${versionName} (${version})`
 *     @property {String} flat[browser].browserName - name of the browser for Selenium (like firefox, chrome, iPhone)
 *     @property {String} flat[browser].version - version of the browser for Selenium (like 11, 41, 8.1)
 *     @property {String} flat[browser].platform - name of the Selenium platform to run the browser on (like Windows, MAC)
 *     @property {String} flat[browser].os_version - version of os to run the browser on (like 8.1, 10.10)
 *     @property {String} flat[browser].device - name of the Selenium (Appium?) device to run the browser on (like iPhone 6 Plus, iPad 3)
 *     @property {*} flat[browser][any] - any property (except versions, deviceType, deviceName, versionName) from source object (like realMobile)
 */

function parseBrowsers(nested) {
    var flat = {};

    (0, _lodashForeach2['default'])(nested, function (browser, browserName) {
        if ('object' !== typeof browser.versions || browser.versions === null) {
            throw new Error('wrong object format: version property has to be an object');
        }

        (0, _lodashForeach2['default'])(browser.versions, function (version, versionName) {
            if ('object' === typeof version && version !== null && version.hasOwnProperty('devices') && Array.isArray(version.devices)) {
                version.devices.forEach(function (deviceModel) {
                    var key = browserName + ' ' + version.osVersion + ' - ' + browser.deviceName + ' ' + deviceModel;

                    flat[key] = (0, _lodashAssign2['default'])({
                        'browserName': browser.browserName,
                        'platform': browser.platform,
                        'os_version': version.osVersion.toString(),
                        'device': browser.deviceName + ' ' + deviceModel
                    }, browser);
                });
            } else if ('string' === typeof version || 'number' === typeof version) {
                var key = browserName + ' ' + version;

                flat[key] = (0, _lodashAssign2['default'])({
                    'browserName': browser.browserName,
                    'platform': browser.platform,
                    'version': version.toString()
                }, browser);
            } else if (version === null) {
                console.warn('There is no defined version for ' + browserName + ' ' + versionName);
            } else {
                throw new Error('wrong object format: version has to be an object or a string');
            }
        });
    });

    return _removeWorkingKeys(flat);
}

module.exports = exports['default'];