/* global suite, test, setup, teardown */
import { assign } from 'lodash';
import { default as chai, assert } from 'chai';
import chaiSpies from 'chai-spies';
import chaiSpiesTdd from 'chai-spies-tdd';

chai.use(chaiSpies);
chai.use(chaiSpiesTdd);

import {
  instances as createdTests,
  resetInstances as resetCreatedTests,
  resetReturned as resetReturnedFromMock,
  mock as createTestMock,
  makeItAllRight,
  throwOn
} from './create-test.mock';
import testBrowsers from './browsers.fixture';

import { default as run, __RewireAPI__ as RewireAPI } from '../src/index';

RewireAPI.__Rewire__('providers', {
  test: {
    getConcurrencyLimit: () => Promise.resolve(1),
    parseBrowser: (browser, browserName) => assign({ displayName: browserName }, browser),
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
  test('exported object type', () => {
    assert.isFunction(run);
  });

  test('returned value type', () => {
    let returned = run(VALID_CONFIG);

    assert.isDefined(returned);

    // minimal set of ES6 promise methods
    assert.isFunction(returned.then, 'is a promise');
    assert.isFunction(returned.catch, 'is a promise');
  });

  test('provider parameter checking', () => {
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
    }, ERR_PATTERN, 'throws if provider is not available');

    assert.throws(() => {
      run(overwrite(VALID_CONFIG, {
        provider: undefined
      }));
    }, ERR_PATTERN);
  });

  test('code parameter checking', () => {
    const ERR_PATTERN = /must be a string/;

    assert.throws(() => {
      run(overwrite(VALID_CONFIG, {
        code: null
      }));
    }, ERR_PATTERN, 'throws if code is not a string');
  });

  test('credentials parameter checking', () => {
    const ERR_PATTERN = /must be an object with not empty fields "userName" and "accessToken"/;

    assert.throws(() => {
      run(overwrite(VALID_CONFIG, {
        credentials: null
      }));
    }, ERR_PATTERN, 'throws an error if credentials object has wrong format');

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
    }, ERR_PATTERN, 'throws an error if credentials object has wrong format');

    assert.throws(() => {
      run(overwrite(VALID_CONFIG, {
        credentials: {
          userName: undefined
        }
      }));
    }, ERR_PATTERN, 'throws an error if credentials object has wrong format');

    assert.throws(() => {
      run(overwrite(VALID_CONFIG, {
        credentials: {
          userName: null,
          accessToken: ''
        }
      }));
    }, ERR_PATTERN, 'throws an error if credentials object has wrong format');
  });
});

suite('creating test sessions', () => {
  setup(() => {
    createTestMock.reset();
    resetReturnedFromMock();
    resetCreatedTests();
  });

  test('creating sessions', () => {
    run(VALID_CONFIG);
    assert.calledExactly(createTestMock, 3, 'one test session per browser');
  });

  test(`resolving returned promise`, (done) => {
    run(VALID_CONFIG).then((results) => {
      assert.equal(Object.keys(results).length, 3, 'as many results as browsers');
      assert.sameMembers(Object.keys(results), [
        'Chrome 40',
        'Firefox 38',
        'iPhone 8.1'
      ], `results named like browsers`);
      done();
    });

    makeItAllRight();
  });

  test(`resolving returned promise`, (done) => {
    let resolved;
    run(VALID_CONFIG).then(() => {
      resolved = true;
    });
    setTimeout(() => {
      assert.notEqual(resolved, true, `returned promise is not resolved until
        internal promises are not`);
      done();
    }, 20);
  });
});

suite('error handling', () => {
  setup(() => {
    createTestMock.reset();
    resetReturnedFromMock();
    resetCreatedTests();
  });

  test('continuing tests when error occurs', (done) => {
    run(VALID_CONFIG).then((results) => {
      assert.equal(Object.keys(results).length, 3, 'as many results as browsers');
      assert.sameMembers(Object.keys(results), [
        'Chrome 40',
        'Firefox 38',
        'iPhone 8.1'
      ], `results named like browsers`);
      done();
    });

    throwOn('execute');
  });

  test('calling quit when error occurs', (done) => {
    run(VALID_CONFIG).then(() => {
      createdTests.forEach(({ quit }) => {
        // why check it like that? quit method is called twice (once for
        // success, once for failure path) and we wish to know if any function
        // returned by one of those calls was called (no matter which one)
        const callsCount = quit.returned
          .map((returnedByQuit) => returnedByQuit.__spy.calls.length)
          .reduce((acc, value) => acc + value, 0);
        assert.equal(callsCount, 1, 'function returned by quit method was called once');
      });
      done();
    }, console.log.bind(console, 'ERR!'));

    throwOn('execute');
  });

  test('saving information about test fail', (done) => {
    run(VALID_CONFIG).then((results) => {
      assert.lengthOf(results['Chrome 40'].results, 1);
      assert.equal(results['Chrome 40'].results[0].type, 'FAIL');
      done();
    });

    throwOn('execute');
  });
});