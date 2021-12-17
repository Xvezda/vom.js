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

const attrsMap = new Map();
const bindedMap = new Map();
export function bind(component) {
  if (!bindedMap.has(component)) {
    bindedMap.set(component, component);
  }
  if (!attrsMap.has(component)) {
    attrsMap.set(component, {});
  }
  // TODO: Support template literal syntax
  return function (attrs) {
    if (deepEquals(attrsMap.get(component), attrs || {})) {
      return bindedMap.get(component);
    }
    bindedMap.set(component, component.bind(null, attrs));
    attrsMap.set(component, attrs);
    return bindedMap.get(component);
  };
}