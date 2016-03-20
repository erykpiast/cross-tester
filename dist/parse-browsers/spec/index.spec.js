'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _ramda = require('ramda');

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _chaiSpies = require('chai-spies');

var _chaiSpies2 = _interopRequireDefault(_chaiSpies);

var _chaiSpiesTdd = require('chai-spies-tdd');

var _chaiSpiesTdd2 = _interopRequireDefault(_chaiSpiesTdd);

var _index = require('../index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } /* global suite, test */


_chai2.default.use(_chaiSpies2.default);
_chai2.default.use(_chaiSpiesTdd2.default);

suite('parse-browsers', function () {
  suite('API', function () {
    test('export type', function () {
      _chai.assert.isFunction(_index2.default, 'parseBrowsers is a function');
    });
  });

  suite('single version entries', function () {
    test('parsing complete entries', function () {
      var _parseBrowsers;

      var CHROME = {
        displayName: 'Chrome 40',
        name: 'chrome',
        version: '40',
        os: 'windows',
        osVersion: '7'
      };
      var FF = {
        displayName: 'Firefox 42',
        name: 'firefox',
        version: '42',
        os: 'os x',
        osVersion: '10.10'
      };

      var result = (0, _index2.default)((_parseBrowsers = {}, _defineProperty(_parseBrowsers, CHROME.displayName, CHROME), _defineProperty(_parseBrowsers, FF.displayName, FF), _parseBrowsers));
      _chai.assert.sameDeepMembers(result, [CHROME, FF]);
    });

    test('supplementing OS version', function () {
      var _parseBrowsers2;

      var CHROME = {
        displayName: 'Chrome 40',
        name: 'chrome',
        version: '40',
        os: 'windows'
      };
      var IE = {
        displayName: 'IE 9',
        name: 'internet explorer',
        version: '11',
        os: 'windows'
      };

      var result = (0, _index2.default)((_parseBrowsers2 = {}, _defineProperty(_parseBrowsers2, CHROME.displayName, CHROME), _defineProperty(_parseBrowsers2, IE.displayName, IE), _parseBrowsers2));

      _chai.assert.isDefined(result[0].osVersion);
      _chai.assert.isDefined(result[1].osVersion);
    });

    test('supplementing OS name and OS version', function () {
      var _parseBrowsers3;

      var CHROME = {
        displayName: 'Chrome 40',
        name: 'chrome',
        version: '40'
      };
      var IE = {
        displayName: 'IE 9',
        name: 'internet explorer',
        version: '11'
      };

      var result = (0, _index2.default)((_parseBrowsers3 = {}, _defineProperty(_parseBrowsers3, CHROME.displayName, CHROME), _defineProperty(_parseBrowsers3, IE.displayName, IE), _parseBrowsers3));

      _chai.assert.isDefined(result[0].os);
      _chai.assert.isDefined(result[0].osVersion);
      _chai.assert.isDefined(result[1].os);
      _chai.assert.isDefined(result[1].osVersion);
    });

    test('supplementing version of mobile browsers', function () {
      var _parseBrowsers4;

      var ANDROID = {
        displayName: 'Android Browser 5.0',
        name: 'android browser',
        os: 'android',
        osVersion: '5.0'
      };
      var SAFARI_MOBILE = {
        displayName: 'iOS Safari 9',
        name: 'safari',
        os: 'ios',
        osVersion: '9.2'
      };

      var result = (0, _index2.default)((_parseBrowsers4 = {}, _defineProperty(_parseBrowsers4, ANDROID.displayName, ANDROID), _defineProperty(_parseBrowsers4, SAFARI_MOBILE.displayName, SAFARI_MOBILE), _parseBrowsers4));

      _chai.assert.isDefined(result[0].version);
      _chai.assert.isDefined(result[1].version);
    });

    test('supplementing device name for mobile browsers', function () {
      var _parseBrowsers5;

      var ANDROID = {
        displayName: 'Android Browser 5.0',
        name: 'android browser',
        version: '5.0',
        os: 'android',
        osVersion: '5.0'
      };
      var SAFARI_MOBILE = {
        displayName: 'iOS Safari 9',
        name: 'safari',
        version: '9.2',
        os: 'ios',
        osVersion: '9.2'
      };

      var result = (0, _index2.default)((_parseBrowsers5 = {}, _defineProperty(_parseBrowsers5, ANDROID.displayName, ANDROID), _defineProperty(_parseBrowsers5, SAFARI_MOBILE.displayName, SAFARI_MOBILE), _parseBrowsers5));

      _chai.assert.isDefined(result[0].device);
      _chai.assert.isDefined(result[1].device);
    });
  });

  suite('multiple versions entries', function () {
    test('creating BrowserDefinition objects from configuration entry with versions collection', function () {
      var BROWSER = {
        displayName: 'Chrome',
        name: 'chrome',
        versions: {
          'Latest': '40',
          'Previous': '39',
          'Old': '20'
        }
      };

      var results = (0, _index2.default)(_defineProperty({}, BROWSER.displayName, BROWSER));
      _chai.assert.lengthOf(results, 3, 'BrowserDefinition object created for each version');
      (0, _chai.assert)((0, _ramda.find)((0, _ramda.propEq)('version', '40'), results), 'version 40 created');
      (0, _chai.assert)((0, _ramda.find)((0, _ramda.propEq)('version', '39'), results), 'version 39 created');
      (0, _chai.assert)((0, _ramda.find)((0, _ramda.propEq)('version', '20'), results), 'version 20 created');
    });

    test('creating BrowserDefinition objects from configuration entry with versions devices collections', function () {
      var BROWSER = {
        displayName: 'iOS Safari',
        name: 'safari',
        os: 'ios',
        versions: {
          Latest: {
            version: '9.1',
            devices: ['iPhone 5S', 'iPad 4']
          },
          'Previous iPad': {
            version: '8.0',
            device: 'iPad',
            devices: ['2', '3', 'mini', 'mini 2']
          }
        }
      };

      var results = (0, _index2.default)(_defineProperty({}, BROWSER.displayName, BROWSER));
      _chai.assert.lengthOf(results, 6, 'BrowserDefinition object created for each device for each version');
      (0, _chai.assert)((0, _ramda.find)((0, _ramda.propEq)('device', 'iphone 5s'), results));
      (0, _chai.assert)((0, _ramda.find)((0, _ramda.propEq)('device', 'ipad 4'), results));
      (0, _chai.assert)((0, _ramda.find)((0, _ramda.propEq)('device', 'ipad 3'), results));
      (0, _chai.assert)((0, _ramda.find)((0, _ramda.propEq)('device', 'ipad 2'), results));
      (0, _chai.assert)((0, _ramda.find)((0, _ramda.propEq)('device', 'ipad mini'), results));
      (0, _chai.assert)((0, _ramda.find)((0, _ramda.propEq)('device', 'ipad mini 2'), results));
    });
  });

  suite('aliases', function () {
    var CHROME = {
      displayName: 'Chrome 40',
      version: '40',
      os: 'windows',
      osVersion: '7'
    };
    var FF = {
      displayName: 'Firefox 42',
      version: '42',
      os: 'os x',
      osVersion: '10.10'
    };
    var IE = {
      displayName: 'IE 9',
      version: '9',
      os: 'windows',
      osVersion: '7'
    };
    var EDGE = {
      displayName: 'Edge',
      version: '20',
      os: 'windows',
      osVersion: '10'
    }; /* TODO: add tests for those
       const ANDROID = {
       displayName: 'Android Browser 5',
       version: '5.0',
       os: 'android',
       osVersion: '5.0',
       device: 'android emulator'
       };
       const SAFARI_MOBILE = {
       displayName: 'iOS Safari 9',
       version: '9.2',
       os: 'ios',
       osVersion: '9.2',
       device: 'iphone simulator'
       };*/

    /* eslint-disable max-nested-callbacks */
    test('Chrome aliases', function () {
      var _parseBrowsers8;

      var result = (0, _index2.default)((_parseBrowsers8 = {}, _defineProperty(_parseBrowsers8, CHROME.displayName + ' 1', _extends({}, CHROME, { name: 'Google Chrome' })), _defineProperty(_parseBrowsers8, CHROME.displayName + ' 2', _extends({}, CHROME, { name: 'chrome' })), _parseBrowsers8));

      result.forEach(function (r) {
        _chai.assert.deepEqual(r.name, 'chrome');
      });
    });

    test('Firefox aliases', function () {
      var _parseBrowsers9;

      var result = (0, _index2.default)((_parseBrowsers9 = {}, _defineProperty(_parseBrowsers9, FF.displayName + ' 1', _extends({}, FF, { name: 'FF' })), _defineProperty(_parseBrowsers9, FF.displayName + ' 2', _extends({}, FF, { name: 'mozilla' })), _defineProperty(_parseBrowsers9, FF.displayName + ' 3', _extends({}, FF, { name: 'firefox' })), _parseBrowsers9));

      result.forEach(function (r) {
        _chai.assert.deepEqual(r.name, 'firefox');
      });
    });

    test('IE aliases', function () {
      var _parseBrowsers10;

      var result = (0, _index2.default)((_parseBrowsers10 = {}, _defineProperty(_parseBrowsers10, IE.displayName + ' 1', _extends({}, IE, { name: 'IE' })), _defineProperty(_parseBrowsers10, IE.displayName + ' 2', _extends({}, IE, { name: 'msie' })), _defineProperty(_parseBrowsers10, IE.displayName + ' 3', _extends({}, IE, { name: 'explorer' })), _parseBrowsers10));

      result.forEach(function (r) {
        _chai.assert.deepEqual(r.name, 'internet explorer');
      });
    });

    test('Edge aliases', function () {
      var _parseBrowsers11;

      var result = (0, _index2.default)((_parseBrowsers11 = {}, _defineProperty(_parseBrowsers11, EDGE.displayName + ' 1', _extends({}, EDGE, { name: 'EDGE' })), _defineProperty(_parseBrowsers11, EDGE.displayName + ' 2', _extends({}, EDGE, { name: 'ms edge' })), _defineProperty(_parseBrowsers11, EDGE.displayName + ' 3', _extends({}, EDGE, { name: 'microsoft edge' })), _parseBrowsers11));

      result.forEach(function (r) {
        _chai.assert.deepEqual(r.name, 'edge');
      });
    });
    /* eslint-enable max-nested-callbacks */
  });
});