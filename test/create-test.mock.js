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

export const mock = chai.spy(function createTest(browser) {
  const instanceReturned = [];
  returned.push(instanceReturned);
  const exports = {};

  mockMethod(exports, 'enter', instanceReturned);
  mockMethod(exports, 'getBrowserLogs', instanceReturned);
  mockMethod(exports, 'getResults', instanceReturned);
  mockMethod(exports, 'execute', instanceReturned);
  mockMethod(exports, 'sleep', instanceReturned);
  mockMethod(exports, 'open', instanceReturned);
  mockMethod(exports, 'quit', instanceReturned);

  exports.__browserName = browser.name;

  instances.push(exports);

  return exports;
});


function mockMethod(exports, name, returned) {
  const index = returned[name] = returned.hasOwnProperty(name) ? returned[name] + 1 : 0;
  exports[name] = chai.spy(function() {
    return () => {
      return new Promise((resolve, reject) => {
        // console.log(`${name} method called`);
        returned.push({
          resolve() {
            // console.log(`${name} method resolved`);
            resolve();
          },
          reject,
          name,
          index
        });
      });
    };
  });
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
  const timeouts = [];
  const timeout = setTimeout(() => {
    returned.forEach(function iterate(instance, instanceIndex) {
      instance.forEach((call) => iterator(call, call.index, instanceIndex));
      instance.splice(0, instance.length);

      // try to resolve next Promise in the chain
      const timeout = setTimeout(iterate, 0, instance, instanceIndex);
      timeouts.push(timeout);
    });
  }, 0);
  timeouts.push(timeout);

  return function stopWaiting() {
    timeouts.forEach(clearTimeout);
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
  fulfillReturnedPromises(({ resolve, reject, name }, callIndex, instanceIndex) => {
    if ((name === _name_) &&
      ('function' === typeof _instanceIndex_ ?
        _instanceIndex_(instances[instanceIndex].__browserName) :
        _instanceIndex_ === instanceIndex) &&
      (_callIndex_ === callIndex)
    ) {
      reject(new Error('fake error'));
    } else {
      resolve();
    }
  });
}
