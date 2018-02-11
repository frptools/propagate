import * as F from '@frptools/corelib';
import { RefCounter } from './RefCounter';

export const SIGNAL = Symbol('Signal');
export const SIGNAL_VALUE = Symbol('Signal.Value');

export function isSignal (value) {
  return F.isObject(value) && SIGNAL in value;
}

export class Signal {
  constructor (inputs = []) {
    this.inputs = inputs;
    this.outputs = [];
    this.rank = 0;
    this.active = false;
    this[SIGNAL_VALUE] = void 0;
    this.pending = false;
    this.refs = new RefCounter();
  }

  get [SIGNAL] () {
    return this;
  }

  get value () {
    return this[SIGNAL_VALUE];
  }

  set (/* value, key */) {
    return false;
  }

  recompute () {
    return false;
  }

  connect (output, ref) {
    const isNewRef = this.refs.add(output, ref);
    const { outputs } = this;
    if (!outputs.includes(output)) {
      outputs.push(output);
    }
    if (!this.active) {
      this.activating();
      activate(this, ref);
      this.activated();
    }
    else if (isNewRef) {
      connect(this, ref);
    }
  }

  disconnect (output, ref) {
    if (!this.refs.remove(output, ref)) {
      return;
    }
    if (this.refs.isEmpty) {
      this.deactivating();
      this.active = false;
      disconnect(this, ref);
      this.outputs.length = 0;
      this.deactivated();
    }
    else {
      disconnect(this, ref);
      const { outputs } = this;
      const lastIndex = outputs.length - 1;
      for (let i = 0; i <= lastIndex; i++) {
        if (outputs[i] === output) {
          if (i < lastIndex) {
            outputs[i] = outputs[lastIndex];
          }
          outputs.length = lastIndex;
          break;
        }
      }
    }
  }

  activating () {}
  activated () {}
  deactivating () {}
  deactivated () {}

  propagate () {
    const { value, outputs } = this;
    for (let i = 0; i < outputs.length; i++) {
      const output = outputs[i];
      if (output.set(value)) {
        const sink = output.sink;
        if (sink.recompute()) {
          sink.propagate();
        }
      }
    }
  }

  valueOf () {
    return F.valueOf(this.value);
  }
}

function updateRank (signal) {
  const { inputs } = signal;
  if (inputs.length === 0) {
    return;
  }

  inputs.sort(compareRank);
  const rank = inputs[0].rank + 1;

  if (rank !== signal.rank) {
    signal.rank = rank;
    const { outputs } = signal;
    for (let i = 0; i < outputs.length; i++) {
      outputs[i].rank = rank;
    }
  }
}

function compareRank (a, b) {
  return b.rank - a.rank;
}

function activate (signal, ref) {
  signal.active = true;
  connect(signal, ref);
  signal.recompute();
  updateRank(signal);
}

function connect (signal, ref) {
  const { inputs } = signal;
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].connect(ref);
  }
}

function disconnect (signal, ref) {
  const { inputs } = signal;
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].disconnect(ref);
  }
}
