'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.objectify = undefined;

var _ramda = require('ramda');

var objectify = exports.objectify = (0, _ramda.curry)(function (prop, collection) {
  var omitProp = (0, _ramda.omit)([prop]);
  return collection.reduce(function (obj, item) {
    return obj[item[prop]] = omitProp(item), obj;
  }, {});
});