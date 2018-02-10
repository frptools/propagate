import * as F from '@frptools/corelib';
import { combine } from './combine';

export const tap = F.curry2n(function tap (f, ...args) {
  return combine((...args) => (f(...args), F.lastArrayElement(args)), ...args);
});
