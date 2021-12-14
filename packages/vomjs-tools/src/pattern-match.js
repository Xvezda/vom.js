import { deepEquals, wildcard } from './common.js';
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
    const flag = (typeof pattern === 'function' && pattern(this.$target)) ||
      (pattern instanceof RegExp && pattern.test(this.$target)) ||
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
  }

  otherwise(fallback) {
    if (!this.$matched && fallback) {
      if (typeof fallback === 'function') {
        this.$result = fallback();
      } else {
        this.$result = fallback;
      }
    }
    return this.$result;
  }
}

export const match = /*#__PURE__*/PatternMatch.match;
export default PatternMatch;