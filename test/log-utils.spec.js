/* global suite, test, setup, teardown */
import { default as chai, assert } from 'chai';
import chaiSpies from 'chai-spies';
import chaiSpiesTdd from 'chai-spies-tdd';

chai.use(chaiSpies);
chai.use(chaiSpiesTdd);

import {
  parse,
  isIgnored,
  __RewireAPI__ as RewireAPI
} from '../src/log-utils';

RewireAPI.__Rewire__('IGNORED_LOGS', [
  'useless message',
  'something really stupid',
  'just ignored log'
]);


suite('API', () => {
  test('named export type', () => {
    assert.isFunction(parse, 'parse is a function');
    assert.isFunction(isIgnored, 'isIgnored is a function');
  });
});

suite('parsing logs', () => {
  test('chrome logs', () => {

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