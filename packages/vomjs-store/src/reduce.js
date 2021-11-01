import Dispatcher from './dispatcher.js';
import Store from './store.js';

export class ReduceStore extends Store {
  constructor(dispatcher) {
    super(dispatcher);
    this.$state = this.getInitialState();
  }

  getState() {
    return this.$state;
  }

  getInitialState() {}

  /* eslint-disable-next-line no-unused-vars */
  reduce(state, action) {}

  areEqual(one, two) {
    return Object.is(one, two);
  }

  onDispatch(payload) {
    const newState = this.reduce(this.getState(), payload);
    if (!this.areEqual(newState, this.getState())) {
      this.$state = newState;
    }
  }
}

export const createStore = (reducer) => {
  const dispatcher = new Dispatcher;
  class CreatedStore extends ReduceStore {
    dispatch(payload) {
      return dispatcher.dispatch(payload);
    }
  }
  CreatedStore.prototype.reduce = reducer;
  CreatedStore.prototype.subscribe = ReduceStore.prototype.addListener;

  const store = new CreatedStore(dispatcher);
  dispatcher.dispatch({type: '@@store/INIT'});

  return store;
};