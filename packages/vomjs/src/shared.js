import { Dispatcher } from '@vomjs/store';
import { escapeEntities } from './helpers.js';

export const dispatcher = new Dispatcher;

const exprFunctions = new Set();
export const getLatestFunction = () => [...exprFunctions].pop();
function exprToString(expr) {
  switch (true) {
    case Array.isArray(expr):
      return expr.map(e => exprToString(e)).join('');
    case (
      ['boolean', 'undefined'].includes(typeof expr) ||
      expr === null
    ):
      return '';
    case (expr instanceof Template || expr instanceof Reference):
      return String(expr);
    case (typeof expr === 'function'):
      exprFunctions.add(expr);
      return expr();
    default:
      return escapeEntities(String(expr));
  }
}

export class Template {
  constructor(strings, args) {
    exprFunctions.clear();

    const result = strings[0] + strings.slice(1).reduce(
      (acc, v, i) =>
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
