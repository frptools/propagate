import { ParameterizedSignal } from '../core';

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
    if (value !== this.value) {
      this.value = value;
      return true;
    }
    return false;
  }
}
