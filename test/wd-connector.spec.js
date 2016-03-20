/* global suite, test, setup, teardown */
import { default as chai, assert } from 'chai';
import chaiSpies from 'chai-spies';
import chaiSpiesTdd from 'chai-spies-tdd';

chai.use(chaiSpies);
chai.use(chaiSpiesTdd);

import MockedProvider from './provider.mock';

import createConnector from '../src/wd-connector';

suite('WD Connector - API', () => {
  test('exported value', () => {
    assert.isFunction(createConnector, 'exported value is a function');
  });

  test('returned value', () => {
    assert.isFunction(createConnector(MockedProvider), 'returned value is a function');
  });
  
  test('returned by returned', () => {
    const returned = createConnector(MockedProvider)();

    assert.isFunction(returned.enter, 'enter method is defined');
    assert.isFunction(returned.quit, 'quit method is defined');
    assert.isFunction(returned.open, 'open method is defined');
    assert.isFunction(returned.getBrowserLogs, 'getBrowserLogs method is defined');
    assert.isFunction(returned.getResults, 'getResults method is defined');
    assert.isFunction(returned.execute, 'execute method is defined');
    assert.isFunction(returned.sleep, 'sleep method is defined');
  });
  
  test('returned by methods of returned', () => {
    const returned = createConnector(MockedProvider)();

    assert.isFunction(returned.enter(), 'enter method returns a function');
    assert.isFunction(returned.quit(), 'quit method returns a function');
    assert.isFunction(returned.open(), 'open method returns a function');
    assert.isFunction(returned.getBrowserLogs(), 'getBrowserLogs method returns a function');
    assert.isFunction(returned.getResults(), 'getResults method returns a function');
    assert.isFunction(returned.execute(), 'execute method returns a function');
    assert.isFunction(returned.sleep(), 'sleep method returns a function');
  });
});