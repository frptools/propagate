export class SignalChannel {
  constructor (index, source, sink) {
    this.index = index;
    this.source = source;
    this.sink = sink;
  }

  attach () {
    return this.source.connect(this);
  }

  detach () {
    this.source.disconnect(this);
  }

  dispatch (value) {
    return this.sink._setArg(this.index, value);
  }
}
