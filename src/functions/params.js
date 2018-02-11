import { Signal, SignalInput, SIGNAL_VALUE } from '../core';

export function params (...args) {
  return new ParameterizedSignal(args);
}

export class ParameterizedSignal extends Signal {
  constructor (sources) {
    const inputs = [];
    super(inputs);

    this.params = new Array(sources.length);

    for (let i = 0; i < sources.length; i++) {
      const source = sources[i];
      if (source instanceof Signal) {
        inputs.push(new SignalInput(source, this, i));
      }
      else {
        this.params[i] = source;
      }
    }
  }

  set (value, { key: index }) {
    // this.debug(`index #${index} is being assigned a value of`, value);
    if (this.params[index] === value) {
      return false;
    }
    this.params[index] = value;
    return true;
  }

  recompute () {
    this[SIGNAL_VALUE] = new Array(...this.params);
    return true;
  }
}
