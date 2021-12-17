const kInitId = -1;

export default class Dispatcher {
  constructor() {
    this.$callbacks = new Map();
    this.$pending = new Set();
    this.$id = kInitId;
    this._invokeId = kInitId;
    this._pendingPayload = undefined;
  }

  _invokeCallback(id) {
    this._invokeId = id;
    if (this.$pending.has(id)) {
      this.waitFor(this.$pending);
    } else {
      this.$pending.add(id);
      this.$callbacks.get(id)(this._pendingPayload);
      this.$pending.delete(id);
    }
    this._invokeId = kInitId;
  }

  _broadcast() {
    this.$callbacks.forEach((_, k) => this._invokeCallback(k));
  }

  register(callback) {
    ++this.$id;
    this.$callbacks.set(this.$id, callback);
    return this.$id;
  }

  unregister(id) {
    this.$callbacks.delete(id);
  }

  waitFor(ids) {
    this.$pending.add(this._invokeId);

    const copy = new Set(ids);
    while (copy.map(this.$pending.has).some(x => x)) {
      copy.forEach(id => {
        copy.delete(id);
        this.$pending.delete(id);
        this._invokeCallback(id);
      });
    }
  }

  dispatch(payload) {
    if (!this.isDispatching()) {
      this._pendingPayload = payload;
      this._broadcast();
      this._pendingPayload = undefined;
    }
    this.$pending.clear();
  }

  isDispatching() {
    return this._invokeId !== kInitId;
  }
}
