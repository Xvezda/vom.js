import ActionTypes from './action-types.js';
import { dispatcher, Reference, Template } from './shared.js';

import { deepEquals } from '@vomjs/tools';


export function html(strings, ...args) {
  return new Template(strings, args);
}

const placeholder = document.createElement('div');
export function escapeEntities(html) {
  placeholder.innerHTML = '';
  placeholder.textContent = html;
  return placeholder.innerHTML;
}

const bindedMap = new WeakMap();
export function bind(component) {
  if (!bindedMap.has(component)) {
    const attrsMap = new Map();
    attrsMap.set({}, component.bind(null));
    bindedMap.set(component, attrsMap);
  }
  const attrsMap = bindedMap.get(component);
  // TODO: Support template literal syntax
  return function (attrs, ref) {
    const found = Array
      .from(attrsMap.entries())
      .find(([k]) => deepEquals(k, attrs));

    if (found) {
      return found[1];
    }
    attrsMap.set(attrs, component.bind(null, attrs, ref));
    return attrsMap.get(attrs);
  };
}

export function doWhen(actType) {
  return function (task) {
    return dispatcher.register(payload => {
      if (payload.type === actType) {
        task();
      }
    });
  };
}
export const whenRender = doWhen(ActionTypes.RENDER);
export const whenRenderSync = doWhen(ActionTypes.RENDER_SYNC);

const exprFunctions = new Set();
whenRender(() => {
  exprFunctions.clear();
});

export const getLatestFunction = () => {
  return Array.from(exprFunctions.values()).pop();
};
export const hasFunction = func => exprFunctions.has(func);

export function exprToString(expr) {
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

