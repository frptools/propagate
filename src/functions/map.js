import { Signal, SignalInput } from '../core';

export function map (f, source) {
  return new MapSignal(f, source);
}

class MapSignal extends Signal {
  constructor (f, source) {
    const inputs = [void 0];
    super(inputs);
    inputs[0] = new SignalInput(source, this);

    this.f = f;
    this.arg = void 0;
  }

  set (value) {
    if (this.arg === value) {
      return false;
    }
    this.arg = value;
    return true;
  }

  recompute () {
    const { f } = this;
    const value = f(this.arg);
    if (value !== this.value) {
      this.value = value;
      return true;
    }
    return false;
  }
}