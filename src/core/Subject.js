import * as F from '@frptools/corelib';
import { Signal } from './Signal';
import { Cascade } from './Cascade';

const noopChannel = { dispatch: F.noop };

export class Subject extends Signal {
  constructor (initialValue) {
    super(F.noop);
    this._value = initialValue;
    this._outputs.push(noopChannel);
    this._active = true;
    this._cascade = new Cascade();
  }

  _recompute () {
    return true;
  }

  set value (value) {
    this._value = value;
    this._propagate(this._cascade);
    this._cascade.update();
  }

  set (value, cascade) {
    this._value = value;
    cascade.add(this);
  }
}
