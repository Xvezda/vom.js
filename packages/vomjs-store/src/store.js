export default class Store {
  constructor(dispatcher) {
    this.$id = -1;
    this.$dispatcher = dispatcher;
    this.$changed = false;

    dispatcher.register(this.onDispatch.bind(this));
  }

  addListener(callback) {
    this.$id = this.$dispatcher.register(callback);
    return {
      remove: this.$dispatcher.unregister.bind(this.$dispatcher, this.$id)
    };
  }

  getDispatcher() {
    return this.$dispatcher;
  }

  getDispatchToken() {
    return this.$id;
  }

  hasChanged() {
    return this.$changed;
  }

  _emitChange() {
    this.$changed = true;
  }

  /* eslint-disable-next-line no-unused-vars */
  onDispatch(payload) {
    throw new Error('subclasses must override onDispatch()');
  }
}
