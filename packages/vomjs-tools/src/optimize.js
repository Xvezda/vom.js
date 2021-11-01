export const debounce = time => {
  return callback => {
    let id = 0;
    const wrapper = (...args) => {
      if (id !== 0) {
        clearTimeout(id);
      }
      id = setTimeout(() => {
        callback(...args);
      }, time);
    };
    wrapper.cancel = () => {
      clearTimeout(id);
      id = 0;
    };
    return wrapper;
  };
};

export const throttle = callback => {
  let id = 0;
  let pending = false;
  const wrapper = (...args) => {
    if (!pending) {
      const cb = () => {
        callback(...args);
        pending = false;
        id = 0;
      };
      id = requestAnimationFrame(cb);
      pending = true;
    }
  };
  wrapper.cancel = () => cancelAnimationFrame(id);
  return wrapper;
};