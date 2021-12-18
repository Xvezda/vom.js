import ActionTypes from './action-types.js';
import { html, bind, whenRender, whenRenderSync } from './helpers.js';
import { dispatcher, Reference } from './shared.js';
import { patchNodes } from './diff.js';

import { throttle, getHash } from '@vomjs/tools';

const placeholder = document.createElement('div');
function renderTo(element, render) {
  placeholder.innerHTML = render();
  patchNodes(placeholder, element);

  dispatcher.dispatch({ type: ActionTypes.RENDER_SYNC });
}

export function render(component, parent) {
  const bindedRenderer =
    renderTo.bind(null, parent, () => html`${component}`);

  const initialize = () => {
    bindedRenderer();
    whenRender(throttle(() => bindedRenderer()));
  };

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
}

export function createRef() {
  const ref = new Reference({
    hash: getHash(),
  });
  ref.current = null;

  whenRenderSync(() => {
    const selected = document.querySelector(`[data-ref="${ref}"]`);
    if (selected) {
      ref.current = selected;
    }
  });
  return ref;
}

export function forwardRef(component) {
  return function (attrs) {
    if (typeof attrs === 'undefined') {
      attrs = {};
    }
    const ref = attrs.ref;

    return html`${bind(component)(attrs, ref)}`;
  };
}
