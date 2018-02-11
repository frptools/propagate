import * as F from '@frptools/corelib';

export class RefCounter {
  constructor () {
    this.registry = new Map();
    this.refs = new Set();
  }

  get isEmpty () {
    return this.refs.size === 0;
  }

  connect (input) {
    let set = this.registry.get(input);
    if (!this.registry.has(set)) {
      this.registry.set(input, new Set(this.refs));
    }
    this.refs.forEach(ref => input.connect(ref));
  }

  /** returns true if the ref was not already in the set prior to this call */
  add (output, ref) {
    this.refs.add(ref);
    let set = this.registry.get(output);
    if (F.isUndefined(set)) {
      this.registry.set(output, set = new Set([ref]));
      return true;
    }
    if (set.has(ref)) {
      return false;
    }
    set.add(ref);
    return true;
  }

  /** returns true if the ref was in the set prior to this call */
  remove (output, ref) {
    if (!this.refs.delete(ref)) {
      return false;
    }
    if (this.refs.size === 0) {
      this.registry.clear();
      return true;
    }
    const set = this.registry.get(output);
    if (F.isDefined(set) && set.delete(ref)) {
      if (set.size === 0) {
        this.registry.delete(output);
      }
      return true;
    }
    return false;
  }
}
