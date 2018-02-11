import * as F from '@frptools/corelib';
import { isSignal, SIGNAL, SIGNAL_VALUE } from './Signal';
import { RefCounter } from './RefCounter';

export class SignalInput {
  constructor (source, sink, key) {
    this.source = source[SIGNAL];
    this.sink = sink;
    this.key = key;
    this.rank = 0;
    this.inner = void 0;
    this.refs = new RefCounter();
  }

  get value () {
    return this.source[SIGNAL_VALUE];
  }

  set (value) {
    if (isSignal(value)) {
      const oldInner = this.inner;
      this.inner = new SignalInput(value, this.sink, this.key);
      this.inner.connect(this.inner);
      if (F.isDefined(oldInner)) {
        oldInner.disconnect(oldInner);
      }
      return false;
    }
    else {
      if (F.isDefined(this.inner)) {
        this.inner.disconnect(this.inner);
        this.inner = void 0;
      }
      return this.sink.set(value, this);
    }
  }

  connect (ref) {
    if (!this.refs.add(this, ref)) {
      return;
    }
    const { source } = this;
    source.connect(this, ref);
    this.rank = source.rank;
    const { value } = source;
    if (F.isDefined(value)) {
      this.set(value);
    }
  }

  disconnect (ref) {
    if (this.refs.remove(this, ref)) {
      this.source.disconnect(this, ref);
      if (F.isDefined(this.inner) && this.refs.isEmpty) {
        this.inner.disconnect(this);
        this.inner = void 0;
      }
    }
  }
}
