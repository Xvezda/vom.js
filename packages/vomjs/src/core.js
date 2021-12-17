import ActionTypes from './action-types.js';
import { html } from './helpers.js';
import { dispatcher } from './shared.js';
import { patchNodes } from './diff.js';

import { throttle } from '@vomjs/tools';

const placeholder = document.createElement('div');
function renderTo(element, render) {
  placeholder.innerHTML = render();
  patchNodes(placeholder, element);
}

export function render(component, parent) {
  const bindedRenderer =
    renderTo.bind(null, parent, () => html`${component}`);

  const initialize = () => {
    bindedRenderer();
    const rerender = payload => {
      if (payload.type === ActionTypes.RENDER) {
        bindedRenderer();
      }
    };
    dispatcher.register(throttle(rerender));
  };

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
}
