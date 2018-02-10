import * as F from '@frptools/corelib';
import { Signal, SignalInput } from '../core';
import { proxy } from './proxy';

export function couple (source) {
  return new CoupledSignal(source);
}

class CoupledSignal extends Signal {
  constructor (sources) {
    const inputs = [];
    super(inputs);

    this.value = Object.assign({}, sources);
    const keys = Object.keys(sources);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const a = sources[key];
      const source = F.isFunction(a) ? proxy(a, this.value) : a;
      if (source instanceof Signal) {
        inputs.push(new SignalInput(source, this, key));
      }
      this.value[key] = source;
    }
  }
}
