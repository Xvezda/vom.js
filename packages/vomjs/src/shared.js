import { exprToString } from './helpers.js';

import { Dispatcher } from '@vomjs/store';


export const dispatcher = new Dispatcher;

export class Template {
  constructor(strings, args) {
    const result = strings[0] + strings.slice(1).reduce((acc, v, i) =>
    {
      const expr = args[i];
      return acc + exprToString(expr) + v;
    }, '');
    this.$result = result.trim();
  }

  toString() {
    return this.$result;
  }
}

export class Reference {
  constructor(ref) {
    this.$ref = ref;
  }

  toString() {
    return this.$ref.hash;
  }
}
