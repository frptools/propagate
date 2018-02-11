import { SIGNAL_VALUE } from '../core';
import { ParameterizedSignal } from './params';

export function combine (f, ...sources) {
  return new CombineSignal(f, sources);
}

class CombineSignal extends ParameterizedSignal {
  constructor (f, sources) {
    super(sources);
    this.f = f;
  }

  recompute () {
    const { f } = this;
    const value = f(...this.params);
    if (value !== this[SIGNAL_VALUE]) {
      this[SIGNAL_VALUE] = value;
      return true;
    }
    return false;
  }
}
