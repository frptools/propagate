import * as F from '@frptools/corelib';
import { SignalInput } from './SignalInput';

export const observe = F.curry2(function observe (f, signal) {
  return new Observer(f, signal);
});

class Observer {
  constructor (f, signal) {
    this.id = F.numericId();
    this.f = f;
    this.source = new SignalInput(signal, this);
    this.source.connect(this);
  }

  get label () {
    return `[${this.id}: OBSERVER]`;
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
