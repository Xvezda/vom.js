const wildcard = Object.create(null);

function PatternMatch(target) {
  this.$target = target;
  this.$result = undefined;
  this.$matched = false;
}

PatternMatch.match = function (target) {
  return new PatternMatch(target);
};

function deepEquals(a, b) {
  if (Array.isArray(a)) {
    return [...a].every((v, i) => {
      if (v === wildcard) {
        return b.length > i;
      }
      return deepEquals(v, b[i]);
    });
  } else if (typeof a === 'object' && b) {
    return Object.entries(a)
      .map(([k, v]) => {
        if (v === wildcard) {
          return k in b;
        }
        return deepEquals(v, b[k]);
      })
      .every(x => x);
  } else {
    return a === b;
  }
}

PatternMatch.prototype.when = function (pattern, ifMatch) {
  if (this.$matched) {
    return this;
  } else if (pattern === wildcard) {
    return this.otherwise(ifMatch);
  }
  const flag = (typeof pattern === 'function' && pattern(this.$target)) ||
    (pattern instanceof RegExp && pattern.test(this.$target)) ||
    (Object.keys(pattern).length > 0 && deepEquals(pattern, this.$target)) ||
    (deepEquals(pattern, this.$target));

  if (flag && typeof this.$result === 'undefined') {
    this.$matched = true;
    if (typeof ifMatch === 'function') {
      this.$result = ifMatch(this.$target);
    } else {
      this.$result = ifMatch;
    }
  }
  return this;
};

PatternMatch.prototype.otherwise = function (otherwise) {
  if (!this.$matched && otherwise) {
    if (typeof otherwise === 'function') {
      this.$result = otherwise();
    } else {
      this.$result = otherwise;
    }
  }
  return this.$result;
};

export {
  deepEquals as exact,
  wildcard as _,
};
export const match = PatternMatch.match;
export default PatternMatch;