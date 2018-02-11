import * as F from '@frptools/corelib';
import { combine } from './combine';
import { map } from './map';

export const tap = F.curry2n(function tap (f, ...args) {
  return args.length === 1
    ? map(x => (f(x), x), args[0])
    : combine((...args) => (f(...args), F.lastArrayElement(args)), ...args);
});
