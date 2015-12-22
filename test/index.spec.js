/* global suite, test, setup, teardown */
import { assign } from 'lodash';
import { default as chai, assert } from 'chai';
import chaiSpies from 'chai-spies';
import chaiSpiesTdd from 'chai-spies-tdd';

chai.use(chaiSpies);
chai.use(chaiSpiesTdd);

import {mock as createTestMock} from './create-test.mock';
import testBrowsers from './browsers.fixture';

import { default as run, __RewireAPI__ as RewireAPI } from '../src/index';

RewireAPI.__Rewire__('providers', {
  test: {
    concurrencyLimit: 1,
    createTest: createTestMock
  }
});
RewireAPI.__Rewire__('parseBrowsers', (browsers) => browsers);


const VALID_CONFIG = {
  provider: 'test',
  browsers: testBrowsers,
  code: 'var abc = 1234;',
  credentials: {
    userName: 'abc',
    accessToken: '1234'
  }
};


function overwrite(base, src) {
  return assign({}, base, src);
}


suite('API', () => {
  test('is a function', () => {
    assert.isFunction(run);
  });

  test('returns promise', () => {
    let returned = run(VALID_CONFIG);

    assert.isDefined(returned);

    // minimal et of ES6 promise methods
    assert.isFunction(returned.then);
    assert.isFunction(returned.catch);
  });

  test('throws if provider is not available', () => {
    const ERR_PATTERN = /is not available/;

    assert.throws(() => {
      run(overwrite(VALID_CONFIG, {
        provider: 'unknown'
      }));
    }, ERR_PATTERN);

    assert.throws(() => {
      run(overwrite(VALID_CONFIG, {
        provider: null
      }));
    }, ERR_PATTERN);

    assert.throws(() => {
      run(overwrite(VALID_CONFIG, {
        provider: undefined
      }));
    }, ERR_PATTERN);
  });

  test('throws an error if code is not a string', () => {
    const ERR_PATTERN = /must be a string/;

    assert.throws(() => {
      run(overwrite(VALID_CONFIG, {
        code: undefined
      }));
    }, ERR_PATTERN);

    assert.throws(() => {
      run(overwrite(VALID_CONFIG, {
        code: null
      }));
    }, ERR_PATTERN);
  });

  test('throws an error if credentials object has wrong format', () => {
    const ERR_PATTERN = /must be an object with not empty fields "userName" and "accessToken"/;

    assert.throws(() => {
      run(overwrite(VALID_CONFIG, {
        credentials: null
      }));
    }, ERR_PATTERN);

    assert.throws(() => {
      run(overwrite(VALID_CONFIG, {
        credentials: {}
      }));
    }, ERR_PATTERN);

    assert.throws(() => {
      run(overwrite(VALID_CONFIG, {
        credentials: {
          accessToken: undefined
        }
      }));
    }, ERR_PATTERN);

    assert.throws(() => {
      run(overwrite(VALID_CONFIG, {
        credentials: {
          userName: undefined
        }
      }));
    }, ERR_PATTERN);

    assert.throws(() => {
      run(overwrite(VALID_CONFIG, {
        credentials: {
          userName: null,
          accessToken: ''
        }
      }));
    }, ERR_PATTERN);
  });
});

suite('creating test sessions', () => {
  setup(() => {
    createTestMock.reset();
    run(VALID_CONFIG);
  });

  test('should create one test session per browser', () => {
    assert.calledExactly(createTestMock, 3);
  });
});