import * as F from '@frptools/corelib';
import { Signal } from './Signal';
import { RefCounter } from './RefCounter';

export class SignalInput {
  constructor (source, sink, key) {
    this.source = source;
    this.sink = sink;
    this.key = key;
    this.rank = 0;
    this.inner = void 0;
    this.refs = new RefCounter();
  }

  get value () {
    return this.source.value;
  }

  set (value) {
    if (F.isDefined(this.inner)) {
      this.inner.disconnect(this);
      this.inner = void 0;
    }
    if (value instanceof Signal) {
      this.inner = new SignalInput(value, this.sink, this.key);
      this.inner.connect(this);
      return false;
    }
    else {
      return this.sink.set(value, this);
    }
  }

  connect (ref) {
    if (!this.refs.add(this, ref)) {
      return;
    }
    // this.refs.add(ref);
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
