/* global suite, test, setup, teardown */
import { default as chai, assert } from 'chai';
import chaiSpies from 'chai-spies';
import chaiSpiesTdd from 'chai-spies-tdd';

chai.use(chaiSpies);
chai.use(chaiSpiesTdd);

import {
  default as parseBrowsers,
  __RewireAPI__ as RewireAPI
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
        name: 'Chrome',
        version: '40',
        os: 'Windows',
        osVersion: '7'
      };
      const FF = {
        displayName: 'Firefox 42',
        name: 'Firefox',
        version: '42',
        os: 'OS X',
        osVersion: '10.10'
      };

      const result = parseBrowsers({
        [CHROME.displayName]: CHROME,
        [FF.displayName]: FF
      });
      assert.sameDeepMembers(result, [CHROME, FF]);
    });

    test('firefox logs', () => {

    });

    test('firefox addon logs', () => {

    });

    test('android emulator logs', () => {

    });

    test('custom logs', () => {

    });
  });
});