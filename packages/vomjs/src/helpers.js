import { deepEquals } from '@vomjs/tools';

export function isSubclass(cls, base) {
  return cls.prototype instanceof base;
}

export function getHash() {
  return Array(2)
    .fill()
    .map(() => Math.random().toString(36).substring(2))
    .join('');
}

export function forEachAll(a, b, apply) {
  for (let i = 0, max = Math.max([...a].length, [...b].length);
      i < max;
      ++i) {
    apply(a[i], b[i], i, a, b);
  }
}

export function callIfFunction(value, args) {
  return value instanceof Function ? value(...args || []) : value;
}

const placeholder = document.createElement('div');
export function escapeEntities(html) {
  placeholder.innerHTML = '';
  placeholder.textContent = html;
  return placeholder.innerHTML;
}

export function clearArray(array) {
  return array.splice(0, array.length);
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
  }
}