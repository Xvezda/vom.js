import ActionTypes from './action-types.js';
import { html } from './helpers.js';
import { dispatcher, Reference } from './shared.js';
import { patchNodes } from './diff.js';

import { throttle, getHash } from '@vomjs/tools';

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

export function createRef() {
  return new Reference({
    hash: getHash(),
    current: null,
  });
}
