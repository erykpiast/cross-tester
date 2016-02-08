import chai from 'chai';
import chaiSpies from 'chai-spies';

chai.use(chaiSpies);

export let returned = [];
export function resetReturned() {
  returned = [];
}

export let instances = [];
export function resetInstances() {
  instances = [];
}

export const mock = function TestProvider() {
  const instanceReturned = [];
  returned.push(instanceReturned);
  instances.push(this);
  this.browserName = arguments[arguments.length - 1];

  mockMethod(this, 'init', instanceReturned);
  mockMethod(this, 'enter', instanceReturned);
  mockMethod(this, 'getLogTypes', instanceReturned);
  mockMethod(this, 'getBrowserLogs', instanceReturned);
  mockMethod(this, 'getResults', instanceReturned);
  mockMethod(this, 'execute', instanceReturned);
  mockMethod(this, 'sleep', instanceReturned);
  mockMethod(this, 'open', instanceReturned);
  mockMethod(this, 'quit', instanceReturned);
};
mock.getConcurrencyLimit = () => Promise.resolve(1);
mock.TIMEOUT = 10000;

// for debugging purposes
const logFromMock = false;
function mockMethod(object, name, returned) {
  const index = returned[name] = returned.hasOwnProperty(name) ? returned[name] + 1 : 0;
  object[name] = chai.spy(() => {
    if (logFromMock) {
      console.log(`${object.browserName}: method ${name} called`);
    }

    const returnedValue = new Promise((resolve, reject) => {
      returned.push({
        resolve,
        reject,
        name,
        index,
        browserName: object.browserName
      });
    }).then(
      (v) => {
        if (logFromMock) {
          console.log(`${object.browserName}: promise returned by ${name} resolved!`);
        }

        return v;
      },
      (e) => {
        if (logFromMock) {
          console.log(`${object.browserName}: promise returned by ${name} rejected!`);
        }

        throw e;
      }
    );

    object[name].returned.push(returnedValue);

    return returnedValue;
  });

  // save values returned by each call of the method
  object[name].returned = [];
}


/**
 * @function fulfillReturnedPromises - iterates over not fulfilled promises
 *   returned by methods of already created instances and calls passed iterator
 *   with functions allowing to reject or resolve the promise; it waits for new
 *   not fulfilled promises until returned function is called
 * @access private
 *
 * @param {Function} iterator - function called with object
 *   {
 *     resolve: Function,
 *     reject: Function,
 *     name: String
 *   }
 *   index of the call (Number) and index of the instance (Number)
 *   for each not fulfilled promise
 *
 * @return {Function} stops waiting for new promises when called
 */
function fulfillReturnedPromises(iterator) {
  let timeout;
  (function tryToResolve() {
    returned.forEach(function iterate(instance, instanceIndex) {
      instance
        .splice(0, instance.length)
        .forEach((call) => iterator(call, call.index, instanceIndex));
    });
    timeout = setTimeout(tryToResolve, 0);
  })();

  return function stopWaiting() {
    clearTimeout(timeout);
  };
}


/**
 * @function makeItAllRight - resolves all promises returned by methods of mocked
 *   test
 * @access public
 */
export function makeItAllRight() {
  fulfillReturnedPromises(({ resolve }) => resolve());
}


/**
 * @function throwOn - breaks the chain on provided method call
 * @access pubilc
 *
 * @param {String} _name_ - name of the method to throw in
 * @param {Number|Function} _instanceIndex_ - index of instance or predicate
 *   called with browser name assigned to the instance
 * @param {Number} _callIndex_ - index of method call
 */
export function throwOn(_name_, _instanceIndex_ = 0, _callIndex_ = 0) {
  const stopMaking = fulfillReturnedPromises(({ resolve, reject, name }, callIndex, instanceIndex) => {
    if ((name === _name_) &&
      ('function' === typeof _instanceIndex_ ?
        _instanceIndex_(instances[instanceIndex].__browserName) :
        _instanceIndex_ === instanceIndex) &&
      (_callIndex_ === callIndex)
    ) {
      stopMaking();
      reject(new Error('fake error'));
    } else {
      resolve();
    }
  });
}
