/* global suite, test, setup, teardown */
import { default as chai, assert } from 'chai';
import chaiSpies from 'chai-spies';
import chaiSpiesTdd from 'chai-spies-tdd';

chai.use(chaiSpies);
chai.use(chaiSpiesTdd);

import BrowserStack from '../src/wd-providers/browserstack';

suite('BrowserStack provider - parseBrowser function', () => {
  test('API', () => {
    assert.isFunction(BrowserStack.parseBrowser, 'static function defined');
  });
  
  test('returned value', () => {
    assert.isObject(BrowserStack.parseBrowser({}), 'function returns an object');
  });

  suite('output format', () => {
    suite('platforms', () => {
      test('desktop', () => {
        const input = {
          displayName: 'Safari 9 on Yosemite',
          name: 'safari',
          version: '9.0',
          os: 'os x',
          osVersion: '10.10'
        };
        const output = BrowserStack.parseBrowser(input);

        assert.property(output, 'browser');
        assert.property(output, 'browser_version');
        assert.property(output, 'os');
        assert.property(output, 'os_version');
        assert.property(output, 'name');
      });

      test('mobile', () => {
        const input = {
          displayName: 'Mobile Safari 9 on iPhone',
          name: 'safari mobile',
          version: '9.1',
          device: 'iphone',
          os: 'ios',
          osVersion: '9.1'
        };
        const output = BrowserStack.parseBrowser(input);

        assert.property(output, 'browserName');
        assert.property(output, 'device');
        assert.property(output, 'platform');
        assert.property(output, 'name');
      });
    });

    suite('OS', () => {
      test('OS X', () => {
        const input = {
          displayName: 'Safari 8 on Mac OS',
          name: 'safari',
          version: '8.0',
          os: 'os x',
          osVersion: '10.10'
        };
        const output = BrowserStack.parseBrowser(input);

        assert.equal(output.os, 'os x', 'OS name is valid');
        assert.equal(output.os_version, 'yosemite', 'numeric version is translated to name');
      });

      test('Windows', () => {
        const input = {
          displayName: 'Chrome 40 on Windows',
          name: 'chrome',
          version: '40.0',
          os: 'windows',
          osVersion: '7'
        };
        const output = BrowserStack.parseBrowser(input);

        assert.equal(output.os, 'windows', 'OS name is valid');
        assert.equal(output.os_version, '7', 'OS version is valid');
      });

      test('iOS', () => {
        const input = {
          displayName: 'Mobile Safari 9 on iPhone',
          name: 'safari mobile',
          version: '9.1',
          os: 'ios',
          osVersion: '9.1'
        };
        const output = BrowserStack.parseBrowser(input);

        assert.equal(output.platform, 'mac', 'platform name is valid');
        assert.isAbove(output.device.length, 0, 'device is set');
      });

      test('Android', () => {
        const input = {
          displayName: 'Android KitKat Browser',
          name: 'android browser',
          version: '4.4',
          os: 'android',
          osVersion: '4.4'
        };
        const output = BrowserStack.parseBrowser(input);

        assert.equal(output.platform, 'android', 'platform name is valid');
        assert.isAbove(output.device.length, 0, 'device is set');
      });
    });

    suite('browser', () => {
      test('Chrome', () => {
        const input = {
          displayName: 'Chrome 40',
          name: 'chrome',
          version: '40',
          os: 'windows',
          osVersion: '7'
        };
        const output = BrowserStack.parseBrowser(input);

        assert.equal(output.browser, 'chrome', 'browser name is valid');
        assert.equal(output.browser_version, '40', 'browser version is set');
      });

      test('Firefox', () => {
        const input = {
          displayName: 'Firefox 40',
          name: 'firefox',
          version: '40',
          os: 'windows',
          osVersion: '7'
        };
        const output = BrowserStack.parseBrowser(input);

        assert.equal(output.browser, 'firefox', 'browser name is valid');
        assert.equal(output.browser_version, '40', 'browser version is set');
      });

      test('IE', () => {
        const input = {
          displayName: 'IE 10',
          name: 'internet explorer',
          version: '10',
          os: 'windows',
          osVersion: '7'
        };
        const output = BrowserStack.parseBrowser(input);

        assert.equal(output.browser, 'ie', 'browser name is valid');
        assert.equal(output.browser_version, '10', 'browser version is set');
      });

      test('Edge', () => {
        let input, output;

        input = {
          displayName: 'MS Edge',
          name: 'edge',
          version: '13',
          os: 'windows',
          osVersion: '10'
        };
        output = BrowserStack.parseBrowser(input);

        assert.equal(output.browser, 'edge', 'browser name is valid');
        assert.equal(output.browser_version, '13', 'browser version is set');

        // MS edge is special case because available version differs between
        // providers
        input = {
          displayName: 'MS Edge',
          name: 'edge',
          os: 'windows',
          osVersion: '10'
        };
        output = BrowserStack.parseBrowser(input);

        assert.equal(output.browser_version, '13', 'browser version is set');
      });

      test('Android Browser', () => {
        const input = {
          displayName: 'Android KitKat Browser',
          name: 'android browser',
          version: '4.4',
          os: 'android',
          osVersion: '4.4'
        };
        const output = BrowserStack.parseBrowser(input);

        assert.equal(output.browserName, 'android', 'browser name is valid');
      });

      test('Safari Mobile', () => {
        let input, output;

        input = {
          displayName: 'Mobile Safari 9 on iPhone',
          name: 'safari mobile',
          version: '9.1',
          os: 'ios',
          osVersion: '9.1'
        };
        output = BrowserStack.parseBrowser(input);

        assert.equal(output.browserName, 'iphone', 'browser name is valid');

        input = {
          displayName: 'Mobile Safari 9 on iPhone',
          name: 'safari mobile',
          version: '9.1',
          device: 'iphone',
          os: 'ios',
          osVersion: '9.1'
        };
        output = BrowserStack.parseBrowser(input);

        assert.equal(output.browserName, 'iphone', 'browser name is valid');

        input = {
          displayName: 'Mobile Safari 9 on iPhone',
          name: 'safari mobile',
          version: '9.1',
          device: 'ipad',
          os: 'ios',
          osVersion: '9.1'
        };
        output = BrowserStack.parseBrowser(input);

        assert.equal(output.browserName, 'ipad', 'browser name is valid');
      });
    });
  });
});