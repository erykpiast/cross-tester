'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @module system-browsers
 * @description mapping from version of default browser in OS to version of this
 *   OS; the newest version of OS supported browser in given version is prefered
 */

var ie = exports.ie = {
  '11': '10',
  '10': '8',
  '9': '7',
  '8': '7'
};

var edge = exports.edge = {
  '20': '10',
  '12': '10'
};

var safari = exports.safari = {
  '9': '10.11',
  '8': '10.10',
  '7': '10.9',
  '6.2': '10.8',
  '6': '10.7',
  '5.1': '10.6'
};