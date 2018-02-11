import { Signal, SignalInput, SIGNAL_VALUE } from '../core';

export function object (sources) {
  return new ObjectSignal(sources);
}

export class ObjectSignal extends Signal {
  constructor (sources) {
    const inputs = [];
    super(inputs);

    this.props = Object.assign({}, sources);

    const keys = Object.keys(sources);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const source = sources[key];
      if (source instanceof Signal) {
        this.props[key] = void 0;
        inputs.push(new SignalInput(source, this, key));
      }
      else {
        this.props[key] = source;
      }
    }
  }

  set (value, { key }) {
    if (this.props[key] === value) {
      return false;
    }
    this.props[key] = value;
    return true;
  }

  recompute () {
    this[SIGNAL_VALUE] = Object.assign({}, this.props);
    return true;
  }
}