import { deepEquals } from '@vomjs/tools';

import ActionTypes from './action-types.js';
import {
  Reference,
  dispatcher,
  getLatestFunction,
} from './shared.js';
import {
  callIfFunction,
  getHash,
  clearArray,
} from './helpers.js';


function whenRender(task) {
  dispatcher.register(payload => {
    if (payload.type === ActionTypes.RENDER) {
      task();
    }
  });
}

let idx = -1;
const states = [];
whenRender(() => {
  states.splice(idx, states.length-idx);
  idx = -1;
});
export function useMemo(callback, deps) {
  ++idx;

  if (!states[idx]) {
    states[idx] = {
      callback,
      deps,
    };
  }

  if (typeof deps === 'undefined' ||
      !deepEquals(states[idx].deps, deps) ||
      !states[idx].memo) {
    states[idx].memo = callback();
  }
  return states[idx].memo;
}


export const useCallback =
  (callback, deps) => useMemo(() => callback, deps);


export function useState(initState) {
  ++idx;
  const latest = getLatestFunction();

  if (!states[idx] || states[idx].component !== latest) {
    states[idx] = {
      component: latest,
      state: callIfFunction(initState),
    }
  }
  const curIdx = idx;
  return [
    states[curIdx].state,
    function setState(newState) {
      if (states[curIdx].component !== latest) {
        return;
      }
      states[curIdx].state = callIfFunction(newState, [states[curIdx].state]);
      dispatcher.dispatch({type: ActionTypes.RENDER});
    }
  ];
}


const cleanups = [];
whenRender(() => {
  cleanups.forEach(cleanUp => cleanUp());
  clearArray(cleanups);
});
export function useEffect(didUpdate, deps) {
  ++idx;
  const latest = getLatestFunction();
  const didCalled = typeof states[idx] !== 'undefined';
  const needUpdate = !didCalled || typeof deps === 'undefined';

  if (!states[idx]) {
    states[idx] = {};
  }

  if (deps) {
    states[idx].deps = deps;
  }

  if (!needUpdate)
    return;

  if (deepEquals(states[idx].deps, deps || []))
    return;

  requestAnimationFrame(() => {
    queueMicrotask(() => {
      const cleanup = didUpdate();
      if (typeof cleanup === 'function') {
        cleanups.push(cleanup);
      }
    });
  });
}


export function useRef(initValue) {
  ++idx;
  const latest = getLatestFunction();

  let ref, refHash;
  if (!states[idx]) {
    refHash = getHash();
    ref = new Reference({
      hash: refHash,
      current: initValue,
    });
    states[idx] = {
      ref,
    };
  } else {
    ref = states[idx].ref;
    refHash = String(ref);
  }
  queueMicrotask(() => {
    const selected = document.querySelector(`[data-ref="${refHash}"]`);
    ref.current = selected;
  });
  return ref;
}


export function useEventListener(ref, eventName, handler) {
  useEffect(() => {
    if (!ref.current)
      return;

    ref.current.addEventListener(eventName, handler);
    return () => ref.current.removeEventListener(eventName, handler);
  });
}


export function useDelegation(eventName, handler) {
  const ref = useRef();
  const delegate = (event) => {
    const selector = `[data-delegate="${ref}"]`;
    const target = event.target.closest(selector);
    if (!target)
      return;

    handler(target, event);
  };
  useEventListener(ref, eventName, delegate);
  return ref;
}
