import { invert } from 'lodash';

/**
 * @module osx-versions
 * @description mapping from Apple OS X version name to number and to opposite
 *   direction
 */

export const numberToName = {
  '10.6': 'Snow Leopard',
  '10.7': 'Lion',
  '10.8': 'Mountain Lion',
  '10.9': 'Mavericks',
  '10.10': 'Yosemite',
  '10.11': 'El Capitan'
};

export const nameToNuber = invert(numberToName);