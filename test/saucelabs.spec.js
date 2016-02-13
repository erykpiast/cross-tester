/* global suite, test, setup, teardown */
import { default as chai, assert } from 'chai';
import chaiSpies from 'chai-spies';
import chaiSpiesTdd from 'chai-spies-tdd';

chai.use(chaiSpies);
chai.use(chaiSpiesTdd);

import SauceLabs from '../src/wd-providers/saucelabs';

suite('SauceLabs provider - parseBrowser function', () => {
  test('API', () => {
    assert.isFunction(SauceLabs.parseBrowser, 'static function defined');
  });

  test('returned value', () => {
    assert.isObject(SauceLabs.parseBrowser({}), 'function returns an object');
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
        const output = SauceLabs.parseBrowser(input);

        assert.property(output, 'browserName');
        assert.property(output, 'version');
        assert.property(output, 'platform');
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
        const output = SauceLabs.parseBrowser(input);

        assert.property(output, 'browserName');
        assert.property(output, 'platformName');
        assert.property(output, 'platformVersion');
        assert.property(output, 'name');
        assert.property(output, 'deviceName');
        assert.property(output, 'deviceOrientation');
        assert.property(output, 'appiumVersion');
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
        const output = SauceLabs.parseBrowser(input);

        assert.equal(output.platform, 'os x 10.10', 'platform is valid');
      });

      test('Windows', () => {
        const input = {
          displayName: 'Chrome 40 on Windows',
          name: 'chrome',
          version: '40.0',
          os: 'windows',
          osVersion: '7'
        };
        const output = SauceLabs.parseBrowser(input);

        assert.equal(output.platform, 'windows 7', 'platform is valid');
      });

      test('iOS', () => {
        const input = {
          displayName: 'Mobile Safari 9 on iPhone',
          name: 'safari mobile',
          version: '9.1',
          os: 'ios',
          osVersion: '9.1'
        };
        const output = SauceLabs.parseBrowser(input);

        assert.equal(output.platformName, 'ios', 'platform name is valid');
        assert.equal(output.platformVersion, '9.1', 'platform version is valid');
      });

      test('Android', () => {
        const input = {
          displayName: 'Android KitKat Browser',
          name: 'android browser',
          version: '4.4',
          os: 'android',
          osVersion: '4.4'
        };
        const output = SauceLabs.parseBrowser(input);

        assert.equal(output.platformName, 'android', 'platform name is valid');
        assert.equal(output.platformVersion, '4.4', 'platform version is valid');
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
        const output = SauceLabs.parseBrowser(input);

        assert.equal(output.browserName, 'chrome', 'browser name is valid');
        assert.equal(output.version, '40', 'browser version is set');
      });

      test('Firefox', () => {
        const input = {
          displayName: 'Firefox 40',
          name: 'firefox',
          version: '40',
          os: 'windows',
          osVersion: '7'
        };
        const output = SauceLabs.parseBrowser(input);

        assert.equal(output.browserName, 'firefox', 'browser name is valid');
        assert.equal(output.version, '40', 'browser version is set');
      });

      test('IE', () => {
        const input = {
          displayName: 'IE 10',
          name: 'internet explorer',
          version: '10',
          os: 'windows',
          osVersion: '7'
        };
        const output = SauceLabs.parseBrowser(input);

        assert.equal(output.browserName, 'internet explorer', 'browser name is valid');
        assert.equal(output.version, '10', 'browser version is set');
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
        output = SauceLabs.parseBrowser(input);

        assert.equal(output.browserName, 'microsoftedge', 'browser name is valid');
        assert.equal(output.version, '13', 'browser version is set');

        // MS edge is special case because available version differs between
        // providers
        input = {
          displayName: 'MS Edge',
          name: 'edge',
          os: 'windows',
          osVersion: '10'
        };
        output = SauceLabs.parseBrowser(input);

        assert.equal(output.version, '20.10240', 'browser version is set');
      });

      test('Android Browser', () => {
        let input, output;
        
        input = {
          displayName: 'Android KitKat Browser',
          name: 'android browser',
          version: '4.4',
          os: 'android',
          osVersion: '4.4'
        };
        output = SauceLabs.parseBrowser(input);

        assert.equal(output.browserName, 'browser', 'browser name is valid');
        
        input = {
          displayName: 'Android JellyBean Browser',
          name: 'android browser',
          version: '4.1',
          os: 'android',
          osVersion: '4.1'
        };
        output = SauceLabs.parseBrowser(input);

        assert.equal(output.browserName, '', 'browser name is valid');
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
        output = SauceLabs.parseBrowser(input);

        assert.equal(output.browserName, 'safari', 'browser name is valid');

        input = {
          displayName: 'Mobile Safari 9 on iPhone',
          name: 'safari mobile',
          version: '9.1',
          device: 'iphone',
          os: 'ios',
          osVersion: '9.1'
        };
        output = SauceLabs.parseBrowser(input);

        assert.equal(output.browserName, 'safari', 'browser name is valid');

        input = {
          displayName: 'Mobile Safari 9 on iPhone',
          name: 'safari mobile',
          version: '9.1',
          device: 'ipad',
          os: 'ios',
          osVersion: '9.1'
        };
        output = SauceLabs.parseBrowser(input);

        assert.equal(output.browserName, 'safari', 'browser name is valid');
      });
    });
  });
});