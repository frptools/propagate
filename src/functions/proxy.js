import { Signal, SignalInput, SIGNAL_VALUE } from '../core';

export function proxy (init, ...args) {
  return new ProxySignal(init, args);
}

export class ProxySignal extends Signal {
  constructor (init, args) {
    super();
    this.init = init;
    this.args = args;
  }

  set (value) {
    const currentValue = this[SIGNAL_VALUE];
    if (currentValue === value || (value !== value && currentValue !== currentValue /* NaN === NaN */)) {
      return false;
    }
    this[SIGNAL_VALUE] = value;
    return true;
  }

  recompute () {
    return true;
  }

  connect (output, ref) {
    const { inputs } = this;
    if (inputs.length === 0) {
      const { init, args } = this;
      const source = init(...args);
      inputs.push(new SignalInput(source, this));
    }
    super.connect(output, ref);
  }
}
