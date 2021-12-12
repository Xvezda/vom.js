import { match } from '@vomjs/tools';
import { Dispatcher } from '@vomjs/store';
import { escapeEntities } from './helpers.js';

export const dispatcher = new Dispatcher;

const exprFunctions = new Set();
export const getLatestFunction = () => [...exprFunctions].pop();
function exprToString(expr) {
  return match(expr)
    .when(Array.isArray, () => expr.map(e => exprToString(e)).join(''))
    .when(() => ['boolean', 'undefined'].includes(typeof expr) || expr === null, '')
    .when(() => expr instanceof Template || expr instanceof Reference, () => expr.toString())
    .when(() => typeof expr === 'function', () => {
      try {
        exprFunctions.add(expr);
        return expr();
      } finally {}
    })
    .otherwise(() => escapeEntities(expr.toString()));
}

export class Template {
  constructor(strings, args) {
    exprFunctions.clear();

    const result = strings[0] + strings.slice(1).reduce((acc, v, i) => {
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
