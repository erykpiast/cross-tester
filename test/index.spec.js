/* global suite, test, setup, teardown */
import { merge, mergeAll } from 'ramda';
import { default as chai, assert } from 'chai';
import chaiSpies from 'chai-spies';
import chaiSpiesTdd from 'chai-spies-tdd';

chai.use(chaiSpies);
chai.use(chaiSpiesTdd);

import {
  instances as providerInstances,
  resetInstances as resetProviderInstances,
  resetReturned as resetReturnedFromMock,
  mock as TestProvider,
  makeItAllRight,
  throwOn
} from './provider.mock';
import testBrowsers from './browsers.fixture';

import { default as run, __RewireAPI__ as RewireAPI } from '../src/index';


const VALID_CONFIG = {
  Provider: TestProvider,
  browsers: testBrowsers,
  code: 'var abc = 1234;',
  credentials: {
    userName: 'abc',
    accessToken: '1234'
  },
  verbose: false
};


function overwrite(base, src) {
  return mergeAll([{}, base, src]);
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

  test('code and url parameters checking', () => {
    const ERR_PATTERN = /must be defined/;

    assert.throws(() => {
      run(overwrite(VALID_CONFIG, {
        url: null,
        code: null
      }));
    }, ERR_PATTERN, 'throws if code is not valid and URL is not provided');

    assert.doesNotThrow(() => {
      run(overwrite(VALID_CONFIG, {
        url: '',
        code: null
      }));
    }, 'does not throw if code is not valid but URL provided');

    assert.doesNotThrow(() => {
      run(overwrite(VALID_CONFIG, {
        code: '',
        url: null
      }));
    }, 'does not throw if URL is not valid but code provided');
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
    resetReturnedFromMock();
    resetProviderInstances();
  });

  test('creating sessions', (done) => {
    run(VALID_CONFIG).then(() => {
      assert.lengthOf(providerInstances, 3, 'one test session per browser');
      done();
      stopMaking();
    }, done);

    var stopMaking = makeItAllRight();
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
      stopMaking();
    });

    var stopMaking = makeItAllRight();
  });

  test(`not resolving returned promise`, (done) => {
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
    resetReturnedFromMock();
    resetProviderInstances();
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
      providerInstances.forEach(({ quit }) => {
        assert.calledOnce(quit, 'function returned by quit method was called once');
      });
      done();
    });

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