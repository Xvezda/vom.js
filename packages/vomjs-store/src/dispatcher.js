export default class Dispatcher {
  constructor() {
    this.$callbacks = new Map;
    this.$pending = new Set;
    this.$id = -1;
    this._invokeId = -1;
    this._pendingPayload = undefined;

    this._invokeCallback = this._invokeCallback.bind(this);
    this._broadcast = this._broadcast.bind(this);
    this.waitFor = this.waitFor.bind(this);
    this.register = this.register.bind(this);
    this.unregister = this.unregister.bind(this);
    this.dispatch = this.dispatch.bind(this);
    this.isDispatching = this.isDispatching.bind(this);
  }

  _invokeCallback(id) {
    this._invokeId = id;
    if (this.$pending.has(id)) {
      this.waitFor([...this.$pending]);
    } else {
      this.$pending.add(id);
      this.$callbacks.get(id)(this._pendingPayload);
      this.$pending.delete(id);
    }
    this._invokeId = -1;
  }

  _broadcast() {
    [...this.$callbacks.keys()].forEach(this._invokeCallback);
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
    const copy = new Set([...ids]);
    while ([...copy].filter(id => typeof id !== 'undefined').map(id => this.$pending.has(id)).some(x => x)) {
      [...copy].forEach(id => {
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
    return this._invokeId !== -1;
  }
}
