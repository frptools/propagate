export class Observer {
  constructor (f, signal) {
    this.signal = signal;
    this._input = { dispatch: f };
    this.reconnect();
  }

  reconnect () {
    const value = this.signal.connect(this._input);
    this._input.dispatch(value);
  }

  disconnect () {
    this.signal.disconnect(this._input);
  }
}
