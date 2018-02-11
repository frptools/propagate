import * as F from '@frptools/corelib';
import { Signal, SignalInput, SIGNAL, SIGNAL_VALUE } from '../core';
import { SubjectSignal, value } from './subject';
import { proxy } from './proxy';
import { map } from './map';

export function composite (sources) {
  const signal = new CompositeSignal(null, sources);
  return signal[SIGNAL_FACADE];
}

export function compositeFor (key, sources) {
  const signal = new CompositeSignal(key, sources);
  return signal[SIGNAL_FACADE];
}

const SIGNAL_ORIGIN = Symbol('Signal.Source');
const SIGNAL_FACADE = Symbol('Signal.Facade');

class CompositeSignal extends Signal {
  constructor (key, sources) {
    const inputs = [];
    super(inputs);

    const exposedSignal = F.isNull(key) ? this : map(F.get(key), this);
    const signalSources = Object.assign({}, sources);
    const facade = Object.assign({
      get [SIGNAL] () { return exposedSignal; }
    }, sources);
    this[SIGNAL_VALUE] = signalSources;
    this[SIGNAL_FACADE] = facade;

    const keys = Object.keys(sources);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const a = sources[key];
      let origin;

      if (F.isFunction(a)) {
        origin = proxy(a, signalSources);
        facade[key] = createFacadeProp(key, this, origin);
      }
      else {
        origin = a instanceof SubjectSignal ? a : value(a);
        const facadeProp = createFacadeProp(key, this, origin);
        Object.defineProperty(facade, key, {
          enumerable: true,
          configurable: true,
          get: () => facadeProp,
          set: x => origin.value = x
        });
      }

      inputs.push(new SignalInput(origin, this, key));
      signalSources[key] = origin;
    }
  }
}

function getValue (source) {
  const value = source.value;
  return value instanceof Signal ? getValue(value) : value;
}

const FACADE_PROPS = {
  value: {
    configurable: false,
    enumerable: true,
    get () { return F.valueOf(this[SIGNAL_ORIGIN]); },
    set (value) { this[SIGNAL_ORIGIN] = value; }
  },
  valueOf: {
    configurable: false,
    enumerable: false,
    writable: false,
    value: function valueOf () { return F.valueOf(getValue(this[SIGNAL_ORIGIN])); }
  },
  toJSON: {
    configurable: false,
    enumerable: false,
    writable: false,
    value: function toJSON () { return getValue(this[SIGNAL_ORIGIN]); }
  },
  toString: {
    configurable: false,
    enumerable: false,
    writable: false,
    value: function toString () { return String(getValue(this[SIGNAL_ORIGIN])); }
  }
};

function createFacadeProp (key, coupler, origin) {
  const facade = Object.defineProperties({}, FACADE_PROPS);
  Object.defineProperty(facade, SIGNAL_ORIGIN, {
    configurable: false,
    enumerable: false,
    writable: false,
    value: origin
  });
  Object.setPrototypeOf(facade, map(F.get(key), coupler));
  return facade;
}
