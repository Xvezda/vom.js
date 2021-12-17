import { Template } from './shared.js';

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

const bindedMap = new Map();
export function bind(component) {
  if (!bindedMap.has(component)) {
    const attrsMap = new Map();
    attrsMap.set({}, component.bind(null));
    bindedMap.set(component, attrsMap);
  }
  const attrsMap = bindedMap.get(component);
  // TODO: Support template literal syntax
  return function (attrs) {
    const found = [...attrsMap.entries()]
      .find(([k]) => deepEquals(k, attrs || {}));

    if (found) {
      return found[1];
    }
    attrsMap.set(attrs, component.bind(null, attrs));
    return attrsMap.get(attrs);
  };
}