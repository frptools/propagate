import * as F from '@frptools/corelib';
import { Signal, SignalInput, Signaller, SIGNAL_VALUE } from '../core';

export function value (value, source) {
  return new SubjectSignal(value, source);
}

export class SubjectSignal extends Signal {
  constructor (value, source) {
    // const inputs = [];
    super();

    this[SIGNAL_VALUE] = value;
    this._signaller = new Signaller();
    this._source = source;

    // if (F.isDefined(source)) {
    //   inputs.push(new SignalInput(source, this));
    // }
  }

  _set (value, signaller) {
    if (this[SIGNAL_VALUE] === value) {
      return false;
    }
    this[SIGNAL_VALUE] = value;
    signaller.add(this);
    return true;
  }

  get value () {
    return this[SIGNAL_VALUE];
  }

  set value (value) {
    // if (this[SIGNAL_VALUE] !== value) {
    //   this[SIGNAL_VALUE] = value;
    //   this.propagate();
    // }
    const signaller = this._signaller;
    if (this._set(value, this._signaller)) {
      signaller.next();
    }
  }

  recompute () {
    return true;
  }

  set (value, signaller) {
    const defer = signaller instanceof Signaller;
    const s = defer ? signaller : this._signaller;
    if (this._set(value, s) && !defer) {
      s.next();
    }
  }

  connect (output, ref) {
    if (!this.active && F.isDefined(this._source)) {
      setTimeout(() => {
        const input = new SignalInput(this._source, this);
        this.inputs.push(input);
        this.refs.connect(input);
      }, 1);
    }
    super.connect(output, ref);
  }

  disconnect (output, ref) {
    super.disconnect(output, ref);
    if (F.isDefined(this._source) && !this.active) {
      this.debug('INPUTS CLEARED');
      this.inputs.length = 0;
    }
  }
}