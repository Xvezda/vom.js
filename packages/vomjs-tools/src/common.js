export const wildcard = Object.create(null);
export function deepEquals(a, b) {
  if (
    (a === undefined && b === undefined) ||
    (a === null && b === null)
  ) {
    return true;
  }

  if (Array.isArray(a)) {
    return Array
      .from(a)
      .every((v, i) => {
        if (v === wildcard) {
          return b.length > i;
        }
        return deepEquals(v, b[i]);
      });
  } else if (
    a && a.constructor === Object &&
    b && b.constructor === Object
  ) {
    const aKeys = Object.keys(a),
          bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) {
      return false;
    }
    for (const k of aKeys) {
      if (a[k] === wildcard) {
        return k in b;
      }
      if (!deepEquals(a[k], b[k])) {
        return false;
      }
    }
    return true;
  } else {
    return a === b;
  }
}

export function getHash() {
  return Math.random().toString(36).substring(2);
}

export function forEachAll(a, b, apply) {
  for (
    let i = 0,
        max = Math.max(Array.from(a).length, Array.from(b).length);
    i < max;
    ++i
  ) {
    apply(a[i], b[i], i, a, b);
  }
}

export function callIfFunction(value, args) {
  return typeof value === 'function' ? value(...args || []) : value;
}


