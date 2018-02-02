import * as F from '@frptools/corelib';
import { SignalChannel } from './SignalChannel';
import { Observer } from './Observer';

const emptyArray = [];

export class Signal {
  constructor (f, args = emptyArray) {
    this._f = f;
    this._outputs = [];
    this._value = void 0;

    let rank = 0;
    if (args.length > 0) {
      const inputs = new Array(args.length);
      this._inputs = inputs;
      this._args = new Array(args.length);
      if (f.length > 0) {
        for (let i = 0; i < args.length; i++) {
          inputs[i] = new SignalChannel(i, args[i], this);
          rank = F.max(rank, args[i]._rank);
        }
      }
    }
    else {
      this._inputs = emptyArray;
      this._args = emptyArray;
    }

    this._rank = rank;
  }

  get value () {
    return this._value;
  }

  observe (f = F.noop) {
    return new Observer(f, this);
  }

  connect (channel) {
    this._outputs.push(channel);
    return this._active ? this._value : this._activate();
  }

  disconnect (channel) {
    const outputs = this._outputs;
    const lastIndex = outputs.length - 1;

    for (let i = 0; i <= lastIndex; i++) {
      if (outputs[i] === channel) {
        if (i < lastIndex) {
          outputs[i] = outputs[lastIndex];
        }
        outputs.length = lastIndex;
      }
    }

    if (outputs.length === 0) {
      this._deactivate();
    }
  }

  _setArg (index, value) {
    if (this._args[index] === value) {
      return false;
    }
    this._args[index] = value;
    return true;
  }

  _propagate (cascade) {
    const value = this._value;
    const outputs = this._outputs;
    for (let i = 0; i < outputs.length; i++) {
      const output = outputs[i];
      if (F.isDefined(cascade)) {
        if (output.dispatch(value)) {
          cascade.add(output.sink);
        }
      }
    }
  }

  _recompute () {
    const value = this._f.apply(null, this._args);
    if (value === this._value) {
      return false;
    }
    this._value = value;
    return true;
  }

  _activate () {
    if (this._active) {
      return this._value;
    }
    this._active = true;
    const inputs = this._inputs;
    const args = this._args;
    for (let i = 0; i < inputs.length; i++) {
      args[i] = inputs[i].attach();
    }
    this._recompute();
    return this._value;
  }

  _deactivate () {
    if (!this._active) {
      return;
    }
    this._active = false;
    const inputs = this._inputs;
    for (let i = 0; i < this._args.length; i++) {
      this._args[i] = void 0;
      inputs[i].detach();
    }
    this._value = void 0;
  }
}
