import { omit, curry } from 'ramda';

export const objectify = curry((prop, collection) => {
  const omitProp = omit([prop]);
  return collection.reduce((obj, item) => (
    (obj[item[prop]] = omitProp(item)), obj
  ), {});
});