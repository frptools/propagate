import * as F from '@frptools/corelib';
// import * as RBT from '@collectable/red-black-tree';

export function newSignaller () {
  return new Signaller();
}

export const setValue = F.curry3(function setValue (signaller, signal, value) {
  return signaller.set(signal, value);
});

export class Signaller {
  constructor () {
    this.queues = [];
    this.baseline = -1;
    this.next = this.next.bind(this);
    this.active = false;
  }

  add (signal) {
    const { queues } = this;
    if (signal.pending) {
      return;
    }

    const { rank } = signal;
    signal.pending = true;

    let queue;
    for (let i = 0; i < queues.length; i++) {
      queue = queues[i];
      if (queue[0] === rank) {
        queue[1].push(signal);
        return;
      }
    }

    queue = [rank, [signal]];
    queues.push(queue);
    queues.sort(compareQueueByRank);
  }

  set (signal, value) {
    if (signal.value === value) {
      return false;
    }
    signal.value = value;
    this.add(signal);
    return true;
  }

  next () {
    // console.debug('--------------------------');
    // console.log(F.formatDate('HH:mm:ss.SSS', new Date()));
    if (this.active) {
      return;
    }
    this.active = true;

    const { queues } = this;
    if (queues.length === 0) {
      this.baseline = -1;
      return;
    }

    while (queues.length > 0) {
      const [rank, queue] = queues[0];

      if (this.baseline >= rank) {
        // if (++count > 150) {
        //   throw new Error('NOPE');
        // }

        // console.debug('ASYNC', this.baseline, rank);

        setTimeout(() => this.next(), 1);

        break;
      }

      this.baseline = rank;
      queues.shift();

      for (let i = 0; i < queue.length; i++) {
        const signal = queue[i];
        signal.pending = false;
        if (signal.recompute()) {
          // signal.log('recomputed value:', signal.value);
          const { outputs } = signal;
          for (let j = 0; j < outputs.length; j++) {
            const output = outputs[j];
            if (output.set(signal.value)) {
              this.add(output.sink);
            }
          }
        }
      }
    }

    this.active = false;
    this.baseline = -1;
  }
}

function compareQueueByRank (a, b) {
  return a[0] - b[0];
}
