import {
  deepEquals,
  wildcard,
  callIfFunction,
} from './common.js';
export {
  wildcard as _,
  deepEquals as exact,
} from './common.js';

class PatternMatch {
  constructor(target) {
    this.$target = target;
    this.$result = undefined;
    this.$matched = false;
  }

  static match(target) {
    return new PatternMatch(target);
  }

  when(pattern, ifMatch) {
    if (this.$matched) {
      return this;
    } else if (pattern === wildcard) {
      return this.otherwise(ifMatch);
    }
    if (
      typeof this.$result === 'undefined' &&
      (typeof pattern === 'function' &&  pattern(this.$target)) ||
      (pattern instanceof RegExp && pattern.test(this.$target)) ||
      (deepEquals(pattern, this.$target))
    ) {
      this.$matched = true;
      this.$result = callIfFunction(ifMatch, [this.$target]);
    }
    return this;
  }

  otherwise(fallback) {
    if (!this.$matched && fallback) {
      this.$result = callIfFunction(fallback);
    }
    return this.$result;
  }
}

export const match = /*#__PURE__*/PatternMatch.match;
export default PatternMatch;