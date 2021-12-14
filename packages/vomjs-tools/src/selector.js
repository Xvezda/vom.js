class Selector {
  constructor(context) {
    this.$context = context;
  }

  static select(target) {
    if (typeof target === 'string') {
      return new Selector(document.querySelector(target));
    } else {
      return new Selector(target);
    }
  }

  on(eventName, handler, options) {
    this.$context.addEventListener(eventName, handler, options);
    return this;
  }

  off(eventName, handler) {
    this.$context.removeEventListener(eventName, handler);
    return this;
  }

  context() {
    return this.$context;
  }
}

export const select = Selector.select;
export default Selector;