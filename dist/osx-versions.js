'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nameToNuber = exports.numberToName = undefined;

var _lodash = require('lodash');

/**
 * @module osx-versions
 * @description mapping from Apple OS X version name to number and to opposite
 *   direction
 */

var numberToName = exports.numberToName = {
  '10.6': 'Snow Leopard',
  '10.7': 'Lion',
  '10.8': 'Mountain Lion',
  '10.9': 'Mavericks',
  '10.10': 'Yosemite',
  '10.11': 'El Capitan'
};

var nameToNuber = exports.nameToNuber = (0, _lodash.invert)(numberToName);