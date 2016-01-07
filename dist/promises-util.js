'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = undefined;
exports.chain = chain;
exports.concurrent = concurrent;
exports.andReturn = andReturn;
exports.andThrow = andThrow;
exports.call = call;

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
    return Array.isArray(curr) ? _get__('chain')(prev, curr).then(function (result) {
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
  return _get__('map')(fns, function (fn) {
    return fn();
  }, { concurrency: limit });
}

/**
 * @function andReturn - creates function that calls passed function with its
 *   argument and returns the argument when promise returned by it is fulfilled
 * @access pubilc
 *
 * @param {Function} fn
 *
 * @return {Function}
 */
function andReturn(fn) {
  return function (data) {
    return fn(null, data).then(function () {
      return data;
    }, function () {
      return data;
    });
  };
}

/**
 * @function andThrow - creates function that calls passed function with its
 *   argument and throws the argument when promise returned by it is fulfilled
 * @access pubilc
 *
 * @param {Function} fn
 *
 * @return {Function}
 */
function andThrow(fn) {
  return function (err) {
    return fn(err).then(function () {
      throw err;
    }, function () {
      throw err;
    });
  };
}

/**
 * @function call - simply calls provided function
 * @access pubilc
 *
 * @param {Function} fn
 * @param {*} [...args]- 
 *
 * @return {Function}
 */
function call(fn) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return fn.apply(undefined, args);
}
var _RewiredData__ = {};

function _get__(variableName) {
  return _RewiredData__ === undefined || _RewiredData__[variableName] === undefined ? _get_original__(variableName) : _RewiredData__[variableName];
}

function _get_original__(variableName) {
  switch (variableName) {
    case 'chain':
      return chain;

    case 'map':
      return _bluebird.map;
  }

  return undefined;
}

function _assign__(variableName, value) {
  if (_RewiredData__ === undefined || _RewiredData__[variableName] === undefined) {
    return _set_original__(variableName, value);
  } else {
    return _RewiredData__[variableName] = value;
  }
}

function _set_original__(variableName, _value) {
  switch (variableName) {}

  return undefined;
}

function _update_operation__(operation, variableName, prefix) {
  var oldValue = _get__(variableName);

  var newValue = operation === '++' ? oldValue + 1 : oldValue - 1;

  _assign__(variableName, newValue);

  return prefix ? newValue : oldValue;
}

function _set__(variableName, value) {
  return _RewiredData__[variableName] = value;
}

function _reset__(variableName) {
  delete _RewiredData__[variableName];
}

function _with__(object) {
  var rewiredVariableNames = Object.keys(object);
  var previousValues = {};

  function reset() {
    rewiredVariableNames.forEach(function (variableName) {
      _RewiredData__[variableName] = previousValues[variableName];
    });
  }

  return function (callback) {
    rewiredVariableNames.forEach(function (variableName) {
      previousValues[variableName] = _RewiredData__[variableName];
      _RewiredData__[variableName] = object[variableName];
    });
    var result = callback();

    if (!!result && typeof result.then == 'function') {
      result.then(reset).catch(reset);
    } else {
      reset();
    }

    return result;
  };
}

var _RewireAPI__ = {};

(function () {
  function addPropertyToAPIObject(name, value) {
    Object.defineProperty(_RewireAPI__, name, {
      value: value,
      enumerable: false,
      configurable: true
    });
  }

  addPropertyToAPIObject('__get__', _get__);
  addPropertyToAPIObject('__GetDependency__', _get__);
  addPropertyToAPIObject('__Rewire__', _set__);
  addPropertyToAPIObject('__set__', _set__);
  addPropertyToAPIObject('__reset__', _reset__);
  addPropertyToAPIObject('__ResetDependency__', _reset__);
  addPropertyToAPIObject('__with__', _with__);
})();

exports.__get__ = _get__;
exports.__GetDependency__ = _get__;
exports.__Rewire__ = _set__;
exports.__set__ = _set__;
exports.__ResetDependency__ = _reset__;
exports.__RewireAPI__ = _RewireAPI__;
exports.default = _RewireAPI__;