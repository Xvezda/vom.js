import { Template, dispatcher } from './shared.js';
import { patchNodes } from './diff.js';

import { throttle } from '@vomjs/tools';

export function html(strings, ...args) {
  return new Template(strings, args);
}

const placeholder = document.createElement('div');
function renderTo(element, render) {
  placeholder.innerHTML = render();
  patchNodes(placeholder, element);
}

export function render(component, parent) {
  const bindedRenderer = renderTo.bind(null, parent, () => html`${component}`);
  window.addEventListener('DOMContentLoaded', () => {
    bindedRenderer();
    const rerender = payload => {
      if (payload.type === '@@vomjs/RENDER') {
        bindedRenderer();
      }
    };
    dispatcher.register(throttle(rerender));
  });
}
