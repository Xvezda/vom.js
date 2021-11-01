function Selector(context) {
  this.$context = context;
}

Selector.select = function (target) {
  if (typeof target === 'string') {
    return new Selector(document.querySelector(target));
  } else {
    return new Selector(target);
  }
};

Selector.prototype.on = function (eventName, handler, options) {
  this.$context.addEventListener(eventName, handler, options);
  return this;
};

Selector.prototype.off = function (eventName, handler) {
  this.$context.removeEventListener(eventName, handler);
  return this;
};

Selector.prototype.context = function () {
  return this.$context;
};

export const select = Selector.select;
export default Selector;