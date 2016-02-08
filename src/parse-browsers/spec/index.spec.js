/* global suite, test */
import {
  find,
  propEq
} from 'ramda';
import { default as chai, assert } from 'chai';
import chaiSpies from 'chai-spies';
import chaiSpiesTdd from 'chai-spies-tdd';

chai.use(chaiSpies);
chai.use(chaiSpiesTdd);

import {
  default as parseBrowsers
} from '../index';

suite('parse-browsers', () => {
  suite('API', () => {
    test('export type', () => {
      assert.isFunction(parseBrowsers, 'parseBrowsers is a function');
    });
  });

  suite('single version entries', () => {
    test('parsing complete entries', () => {
      const CHROME = {
        displayName: 'Chrome 40',
        name: 'chrome',
        version: '40',
        os: 'windows',
        osVersion: '7'
      };
      const FF = {
        displayName: 'Firefox 42',
        name: 'firefox',
        version: '42',
        os: 'os x',
        osVersion: '10.10'
      };

      const result = parseBrowsers({
        [CHROME.displayName]: CHROME,
        [FF.displayName]: FF
      });
      assert.sameDeepMembers(result, [CHROME, FF]);
    });

    test('supplementing OS version', () => {
      const CHROME = {
        displayName: 'Chrome 40',
        name: 'chrome',
        version: '40',
        os: 'windows'
      };
      const IE = {
        displayName: 'IE 9',
        name: 'internet explorer',
        version: '11',
        os: 'windows'
      };

      const result = parseBrowsers({
        [CHROME.displayName]: CHROME,
        [IE.displayName]: IE
      });

      assert.isDefined(result[0].osVersion);
      assert.isDefined(result[1].osVersion);
    });

    test('supplementing OS name and OS version', () => {
      const CHROME = {
        displayName: 'Chrome 40',
        name: 'chrome',
        version: '40'
      };
      const IE = {
        displayName: 'IE 9',
        name: 'internet explorer',
        version: '11'
      };

      const result = parseBrowsers({
        [CHROME.displayName]: CHROME,
        [IE.displayName]: IE
      });

      assert.isDefined(result[0].os);
      assert.isDefined(result[0].osVersion);
      assert.isDefined(result[1].os);
      assert.isDefined(result[1].osVersion);
    });

    test('supplementing version of mobile browsers', () => {
      const ANDROID = {
        displayName: 'Android Browser 5.0',
        name: 'android browser',
        os: 'android',
        osVersion: '5.0'
      };
      const SAFARI_MOBILE = {
        displayName: 'iOS Safari 9',
        name: 'safari',
        os: 'ios',
        osVersion: '9.2'
      };

      const result = parseBrowsers({
        [ANDROID.displayName]: ANDROID,
        [SAFARI_MOBILE.displayName]: SAFARI_MOBILE
      });

      assert.isDefined(result[0].version);
      assert.isDefined(result[1].version);
    });

    test('supplementing device name for mobile browsers', () => {
      const ANDROID = {
        displayName: 'Android Browser 5.0',
        name: 'android browser',
        version: '5.0',
        os: 'android',
        osVersion: '5.0'
      };
      const SAFARI_MOBILE = {
        displayName: 'iOS Safari 9',
        name: 'safari',
        version: '9.2',
        os: 'ios',
        osVersion: '9.2'
      };

      const result = parseBrowsers({
        [ANDROID.displayName]: ANDROID,
        [SAFARI_MOBILE.displayName]: SAFARI_MOBILE
      });

      assert.isDefined(result[0].device);
      assert.isDefined(result[1].device);
    });
  });

  suite('multiple versions entries', () => {
    test('creating BrowserDefinition objects from configuration entry with versions collection', () => {
      const BROWSER = {
        displayName: 'Chrome',
        name: 'chrome',
        versions: {
          'Latest': '40',
          'Previous': '39',
          'Old': '20'
        }
      };

      const results = parseBrowsers({
        [BROWSER.displayName]: BROWSER
      });
      assert.lengthOf(results, 3, 'BrowserDefinition object created for each version');
      assert(find(propEq('version', '40'), results), 'version 40 created');
      assert(find(propEq('version', '39'), results), 'version 39 created');
      assert(find(propEq('version', '20'), results), 'version 20 created');
    });

    test('creating BrowserDefinition objects from configuration entry with versions devices collections', () => {
      const BROWSER = {
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

      const results = parseBrowsers({
        [BROWSER.displayName]: BROWSER
      });
      assert.lengthOf(results, 6, 'BrowserDefinition object created for each device for each version');
      assert(find(propEq('device', 'iphone 5s'), results));
      assert(find(propEq('device', 'ipad 4'), results));
      assert(find(propEq('device', 'ipad 3'), results));
      assert(find(propEq('device', 'ipad 2'), results));
      assert(find(propEq('device', 'ipad mini'), results));
      assert(find(propEq('device', 'ipad mini 2'), results));
    });
  });

  suite('aliases', () => {
    const CHROME = {
      displayName: 'Chrome 40',
      version: '40',
      os: 'windows',
      osVersion: '7'
    };
    const FF = {
      displayName: 'Firefox 42',
      version: '42',
      os: 'os x',
      osVersion: '10.10'
    };
    const IE = {
      displayName: 'IE 9',
      version: '9',
      os: 'windows',
      osVersion: '7'
    };
    const EDGE = {
      displayName: 'Edge',
      version: '20',
      os: 'windows',
      osVersion: '10'
    };/* TODO: add tests for those
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
    test('Chrome aliases', () => {
      const result = parseBrowsers({
        [`${CHROME.displayName} 1`]: { ...CHROME, name: 'Google Chrome' },
        [`${CHROME.displayName} 2`]: { ...CHROME, name: 'chrome' }
      });

      result.forEach((r) => {
        assert.deepEqual(r.name, 'chrome');
      });
    });

    test('Firefox aliases', () => {
      const result = parseBrowsers({
        [`${FF.displayName} 1`]: { ...FF, name: 'FF' },
        [`${FF.displayName} 2`]: { ...FF, name: 'mozilla' },
        [`${FF.displayName} 3`]: { ...FF, name: 'firefox' }
      });

      result.forEach((r) => {
        assert.deepEqual(r.name, 'firefox');
      });
    });

    test('IE aliases', () => {
      const result = parseBrowsers({
        [`${IE.displayName} 1`]: { ...IE, name: 'IE' },
        [`${IE.displayName} 2`]: { ...IE, name: 'msie' },
        [`${IE.displayName} 3`]: { ...IE, name: 'explorer' }
      });

      result.forEach((r) => {
        assert.deepEqual(r.name, 'internet explorer');
      });
    });

    test('Edge aliases', () => {
      const result = parseBrowsers({
        [`${EDGE.displayName} 1`]: { ...EDGE, name: 'EDGE' },
        [`${EDGE.displayName} 2`]: { ...EDGE, name: 'ms edge' },
        [`${EDGE.displayName} 3`]: { ...EDGE, name: 'microsoft edge' }
      });

      result.forEach((r) => {
        assert.deepEqual(r.name, 'edge');
      });
    });
    /* eslint-enable max-nested-callbacks */
  });
});