import * as F from '@frptools/corelib';
import { Signal, Subject } from '../core';

export function signal (...args) {
  return args.length > 1
    ? compute(...args)
    : subject(...args);
}

export function constant (value) {
  return new Signal(F.constant(value));
}

export function subject (initialValue) {
  return new Subject(initialValue);
}

export function compute (f, ...args) {
  return new Signal(f, args);
}
