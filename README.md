# [![FRPTools: Propagate](https://github.com/frptools/propagate/raw/master/.assets/product-logo.png)](https://github.com/frptools/propagate)

> A fast, lightweight signalling library with a minimal, foolproof API

[![NPM version](https://badge.fury.io/js/%40frptools%2Fpropagate.svg)](http://badge.fury.io/js/%40frptools%2Fpropagate)
[![GitHub version](https://badge.fury.io/gh/frptools%2Fpropagate.svg)](https://badge.fury.io/gh/frptools%2Fpropagate)
[![Gitter](https://badges.gitter.im/gitterHQ/gitter.svg)](https://gitter.im/FRPTools/Lobby)

```bash
npm install @frptools/propagate
```

Define source values:

```js
import { signal } from '@frptools/propagate';

const left = signal(7);
const right = signal(9);
```

Define a computed value by supplying a compute function, followed by a signal for each parameter of
the compute function:

```js
const sum = signal((a, b) => a + b, left, right);
```

Consume the value of any signal by observing it:

```js
// The following will immediately log "Value: 16" to the console
const observer = sum.subscribe(value => console.log('Value:', value));

// The signal's value can also be sampled (as long as at least one dependent observer is active)
const currentValue = sum.value;

// Disconnect the observer when it is no longer needed (no further cleanup required)
observer.disconnect();

// A disconnected observer can be retained and reconnected later if desired
observer.reconnect();
```

Change source values to instantly recompute any derivative signal values:

```js
// The following will trigger the above observer, logging "Value: 19" to the console
left.value = 10;
```

If ad-hoc sampling is required and no callback is required, the callback function can be omitted
during observation:

```js
const source = signal();
const downstream = performSomeCalculations(source);

const observer = downstream.observe();

setInterval(() => source.value = measureSomeExternalValue(), 50); // update the source every 50ms

setTimeout(() => {
  console.log(downstream.value); // sample the value after 1337ms
  observer.disconnect(); // ... then disconnect
}, 1337);
```

The library's implementation avoids the "combine problem", which is an issue in reactive programming
where changes made to upstream signals cascade and converge independently in downstream signal
inputs, causing multiple redundant recomputations as each of a signal's respective inputs receive
new values during the same batch operation.

Without having handled this problem, the following example would propagate no less than six
recomputation events to the observer for a single change to the `a` signal's value, as each signal's
value propagates through the signal graph.

Instead, all redundant computations are avoided until all of a signal's inputs have been resolved,
and the observer in the example receives only the final result of the cascade of changes occurring
within the upstream graph.

```js
import { signal } from '@frptools/propagate'

const add = (a, b) => a + b;
const subtract = (a, b) => a - b;
const multiply = (a, b) => a * b;
const negative = (a) => -a;

const a = signal(2);
const b = signal(4);
const c = signal(add, a, b);
const d = signal(subtract, b, a);
const e = signal(Math.pow, c, a);
const f = signal(negative, e);
const g = signal(multiply, e, d);
const h = signal(add, f, g);

const show = x => console.log(`the value is now: ${x}`);
h.observe(show); // --> the value is now: 36

a.value = 3; // --> the value is now: 0
b.value = 5; // --> the value is now: 512
```

When you need to change several source values as a batch operation before recomputation should
occur, use a `Cascade` instance to defer recomputation until manually triggered. The `Cascade` class
is used internally for the same reasons described above.

Use a source's `set` method, passing a new value and a reference to the `Cascade` object, followed
by a call to the `update` method to complete the operation when all necessary source updates have
been made:

```js
import { signal, Cascade } from '@frptools/propagate';

// ... (assuming the previous example code is here)

const batch = new Cascade();

a.set(2, batch); // no recomputation occurs yet
b.set(4, batch); // still no recomputation...

// Call the `update` method to trigger recomputation in the graph:
batch.update(); // --> the value is now: 36
```