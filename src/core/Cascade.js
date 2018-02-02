import * as F from '@frptools/corelib';
import * as RBT from '@collectable/red-black-tree';

export class Cascade {
  constructor () {
    this.signals = new Set();
    this.queues = RBT.emptyWithNumericKeys(true);
    this.baseline = -1;
    this.update = this.update.bind(this);
  }

  add (signal) {
    const { signals, queues } = this;
    if (signals.has(signal)) {
      return;
    }

    const { rank } = signal;
    signals.add(signal);

    const queue = RBT.get(rank, queues);
    if (F.isUndefined(queue)) {
      RBT.set(rank, [signal], queues);
    }
    else {
      queue.push(signal);
    }
  }

  update () {
    if (RBT.isEmpty(this.queues)) {
      return;
    }

    const { key: rank, value: queue } = RBT.first(this.queues);

    if (this.baseline >= rank) {
      this.baseline = -1;
      setTimeout(this.update, 500);
      return;
    }

    this.baseline = rank;
    RBT.remove(rank, this.queues);

    for (let i = 0; i < queue.length; i++) {
      const signal = queue[i];
      this.signals.delete(signal);
      signal._recompute();
      signal._propagate(this);
    }

    this.update();
  }
}
