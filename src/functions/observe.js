import * as F from '@frptools/corelib';
import { SignalInput, SIGNAL } from '../core';

export const observe = F.curry2(function observe (f, signal) {
  return new Observer(f, signal);
});

export function drain (signal) {
  return new Observer(F.noop, signal);
};

class Observer {
  constructor (f, signal) {
    this.id = F.numericId();
    this.f = f;
    this.source = new SignalInput(signal[SIGNAL], this);
    this.source.connect(this);
  }

  set (value) {
    this.f.call(null, value, this);
    return false;
  }

  reconnect () {
    this.source.connect(this);
  }

  disconnect () {
    this.source.disconnect(this);
  }
}
