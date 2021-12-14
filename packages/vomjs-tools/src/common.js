export const wildcard = /*#__PURE__*/Object.create(null);
export function deepEquals(a, b) {
  if (
    (a === undefined && b !== undefined) ||
    (a === null && b !== null)
  ) {
    return false;
  }

  if (Array.isArray(a)) {
    return [...a].every((v, i) => {
      if (v === wildcard) {
        return b.length > i;
      }
      return deepEquals(v, b[i]);
    });
  } else if (typeof a === 'object' && b) {
    const aKeys = Object.keys(a),
          bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) {
      return false;
    }
    return aKeys
      .map(k => {
        if (a[k] === wildcard) {
          return k in b;
        }
        return deepEquals(a[k], b[k]);
      })
      .every(x => x);
  } else {
    return a === b;
  }
}

export function getHash() {
  return Math.random().toString(36).substring(2);
}

export function forEachAll(a, b, apply) {
  for (
    let i = 0, max = Math.max([...a].length, [...b].length);
    i < max;
    ++i
  ) {
    apply(a[i], b[i], i, a, b);
  }
}

export function callIfFunction(value, args) {
  return typeof value === 'function' ? value(...args || []) : value;
}


