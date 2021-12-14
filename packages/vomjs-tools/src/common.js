export const wildcard = /*#__PURE__*/Object.create(null);
export function deepEquals(a, b) {
  if (a === undefined && b !== undefined)
    return false;

  if (a === null && b !== null)
    return false;

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

