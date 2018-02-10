import { Signal, SignalInput } from '../core';

export function proxy (init, ...args) {
  return new ProxySignal(init, args);
}

class ProxySignal extends Signal {
  constructor (init, args) {
    super();
    this.init = init;
    this.args = args;
  }

  set (value) {
    // this.debug(`is being assigned a value of`, value);
    if (this.value === value || (value !== value && this.value !== this.value /* NaN === NaN */)) {
      return false;
    }
    this.value = value;
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
