import * as F from '@frptools/corelib';
import { Signal } from './Signal';
import { SignalInput } from './SignalInput';
import { Signaller } from './Signaller';

export function value (value, source) {
  return new SubjectSignal(value, source);
}

export class SubjectSignal extends Signal {
  constructor (value, source) {
    // const inputs = [];
    super();

    this._value = value;
    this._signaller = new Signaller();
    this._source = source;

    // if (F.isDefined(source)) {
    //   inputs.push(new SignalInput(source, this));
    // }
  }

  _set (value, signaller) {
    if (this._value === value) {
      return false;
    }
    this._value = value;
    signaller.add(this);
    return true;
  }

  get value () {
    return this._value;
  }

  set value (value) {
    // if (this._value !== value) {
    //   this._value = value;
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