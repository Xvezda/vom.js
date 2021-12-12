export function nextTick(callback) {
  const promise = Promise.resolve();
  if (typeof callback === 'function') {
    return promise.then(callback).catch(console.error);
  } else {
    return promise;
  }
}

export function isSubclass(cls, base) {
  return cls.prototype instanceof base;
}

export function isArrayEquals(a, b, key=Object.is) {
  return a && b && a.length === b.length && a.every((v, i) => key(v, b[i]));
}

export function getHash() {
  return Array(2).fill().map(() => Math.random().toString(36).substring(2)).join('');
}

export function forEachAll(a, b, apply) {
  for (let i = 0, max = Math.max([...a].length, [...b].length); i < max; ++i) {
    apply(a[i], b[i], i, a, b);
  }
}

export function callIfFunction(value, args) {
  return value instanceof Function ? value(...args || []) : value;
}

const placeholder = document.createElement('div');
export function escapeEntities(html) {
  placeholder.innerHTML = '';
  placeholder.textContent = html;
  return placeholder.innerHTML;
}

export function clearArray(array) {
  return array.splice(0, array.length);
}