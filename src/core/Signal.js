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
    this.id = F.numericId();
  }

  get [SIGNAL] () {
    return this;
  }

  get value () {
    return this[SIGNAL_VALUE];
  }

  get label () {
    return `[${this.id}: ${this.f && this.f.name || (this.constructor.name === 'SubjectSignal' ? `Subject(${this.value})` : this.constructor.name)}]`;
  }

  log (...args) {
    // console.log(this.label, ...args);
  }

  debug (...args) {
    // console.debug(this.label, ...args);
  }

  set (/* value, key */) {
    // this.debug(`(${key}) is being assigned a value of`, value);
    return false;
  }

  recompute () {
    return false;
  }

  connect (output, ref) {
    const isNewRef = this.refs.add(output, ref);

    this.debug(`is being connected to by`, output.sink.label, ref.label);
    const { outputs } = this;
    if (!outputs.includes(output)) {
      this.log('adding output to collection', ref.label);
      outputs.push(output);
    }
    if (!this.active) {
      this.activating();
      this.log('activating', ref.label);
      activate(this, ref);
      this.activated();
    }
    else if (isNewRef) {
      this.log('connecting ref to upstream sources', ref.label);
      connect(this, ref);
    }
    if (isNewRef) {
      this.log('added ref to local set', ref.label);
    }
    else {
      this.debug('NOT NEW', ref.label);
    }
  }

  disconnect (output, ref) {
    if (!this.refs.remove(output, ref)) {
      // this.debug('REF MISSING', ref.label);
      return;
    }
    this.debug(this.label, 'disconnecting', ref.label);
    // this.refs.delete(ref);
    if (this.refs.isEmpty) {
      this.deactivating();
      this.active = false;
      disconnect(this, ref);
      this.outputs.length = 0;
      this.debug(this.label, 'DEACTIVATED', ref.label);
      this.deactivated();
    }
    else {
      disconnect(this, ref);
      const { outputs } = this;
      const lastIndex = outputs.length - 1;
      for (let i = 0; i <= lastIndex; i++) {
        if (outputs[i] === output) {
          this.log('output removed', ref.label);
          if (i < lastIndex) {
            outputs[i] = outputs[lastIndex];
          }
          outputs.length = lastIndex;
          break;
        }
      }
      this.log(this.label, 'disconnected', ref.label);
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
    if (!this.active) {
      F.throwInvalidOperation(`Cannot evaluate an inactive signal`);
    }
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
    // signal.log(`update rank to ${rank}`);
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
  signal.log('ACTIVATE');
  signal.active = true;
  connect(signal, ref);
  signal.recompute();
  updateRank(signal);
}

function connect (signal, ref) {
  signal.log('connect', ref.label);
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
