'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.chain = chain;
exports.concurrent = concurrent;
exports.andReturn = andReturn;
exports.andThrow = andThrow;

var _bluebird = require('bluebird');

/**
 * @function chain - creates sequence of promises from array or tree
 * @access pubilc
 *
 * @param {Promise} prev - promise on the beginning of the chain
 * @param {Array} sequence - collection of functions that define elements of chain
 * @property {Function|Array} sequence[n] - function that takes previous chain
 *   element as argument and should return promise chained to this | array of
 *   functions to process resursivelly
 *
 * @returns {Promise} it resolves after the last element of the chain with
 *   with array of results from all elements of the chain
 *
 * EXAMPLE USAGE:
 *
 * code below will print:
 * [ 1, 2, [ 3, 4 ], 5, 6, [ [ 7, 8 ], 9 ], 10 ]
 *
 * chain(q.resolve(0), [
 *
 *     (prev) => prev.then(() => 1),
 *     (prev) => prev.then(() => 2),
 *
 *     [
 *       (prev) => prev.then(() => 3),
*        (prev) => prev.then(() => 4)
 *     ],
 *
 *     (prev) => prev.then(() => 5),
 *     (prev) => prev.then(() => 6),
 *
 *     [
*        [
 *         (prev) => prev.then(() => 7),
 *         (prev) => prev.then(() => 8)
 *       ],
 *
 *       (prev) => prev.then(() => 9)
 *     ],
 *
 *     (prev) => prev.then(() => 10)
 *
 * ]).then((res) => {
 *     console.log(res);
 * });
 */
function chain(init, sequence) {
  var results = [];
  return sequence.reduce(function (prev, curr) {
    return Array.isArray(curr) ? chain(prev, curr).then(function (result) {
      results.push(result);

      return result;
    }) : curr(prev).then(function (result) {
      results.push(result);

      return result;
    });
  }, init).then(function () {
    return results;
  });
}

/**
 * @function concurrent - runs promises in parallel with concurrency limit
 * @access pubilc
 *
 * @param {Array} fns - collection of Promises' factories
 *   @property {Function} fns[n] - function that produces Promise, called when...
 *     see Bluebird's Promises.map documentation
 *
 * @param {Number} limit - maximum number of pending promises
 */
function concurrent(fns, limit) {
  return (0, _bluebird.map)(fns, function (fn) {
    return fn();
  }, { concurrency: limit });
}

/**
 * @function andReturn - creates function that calls passed function with its
 *   argument and returns the argument
 * @access pubilc
 *
 * @param {Function} fn
 *
 * @return {Function}
 */
function andReturn(fn) {
  return function (data) {
    fn(null, data);
    return data;
  };
}

/**
 * @function andThrow - creates function that calls passed function with its
 *   argument and throws the argument
 * @access pubilc
 *
 * @param {Function} fn
 *
 * @return {Function}
 */
function andThrow(fn) {
  return function (err) {
    fn(err);
    return err;
  };
}