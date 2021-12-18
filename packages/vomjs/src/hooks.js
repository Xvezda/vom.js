import ActionTypes from './action-types.js';
import { createRef } from './core.js';
import {
  dispatcher,
} from './shared.js';
import {
  whenRender,
  whenRenderSync,
  getLatestFunction,
  hasFunction,
} from './helpers.js';

import {
  deepEquals,
  callIfFunction,
} from '@vomjs/tools';
import { createStore } from '@vomjs/store';


let idx = -1;
const states = [];
whenRender(() => {
  states.splice(idx + 1, states.length - (idx+1));
  idx = -1;
});

function stateful(hook) {
  return function (...args) {
    ++idx;
    return hook(...args);
  };
}

export const useMemo = stateful((callback, deps) => {
  if (!states[idx]) {
    states[idx] = {
      callback,
      deps,
    };
  }

  if (
    typeof deps === 'undefined' ||
    !deepEquals(states[idx].deps, deps) ||
    !states[idx].memo
  ) {
    states[idx].memo = callback();
  }
  return states[idx].memo;
});


export const useCallback =
  (callback, deps) => useMemo(() => callback, deps);


export const useState = stateful((initState) => {
  const latest = getLatestFunction();

  if (!states[idx] || states[idx].component !== latest) {
    states[idx] = {
      component: latest,
      state: callIfFunction(initState),
    };
  }
  const curIdx = idx;
  return [
    states[curIdx].state,
    function setState(newState) {
      if (states[curIdx].component !== latest) {
        return;
      }
      states[curIdx].state = callIfFunction(newState, [
        states[curIdx].state
      ]);
      dispatcher.dispatch({type: ActionTypes.RENDER});
    }
  ];
});


const cleanups = new Map();
whenRenderSync(() => {
  cleanups.forEach((cleanup, component) => {
    if (!hasFunction(component)) {
      cleanup();
      cleanups.delete(component);
    }
  });
});

function whenUpdate(didUpdate, idx) {
  const cleanup = didUpdate();
  if (typeof cleanup === 'function') {
    cleanups.set(states[idx].latest, () => {
      cleanup();
      delete states[idx].deps;
    });
  }
}

const sideEffect = makeEffect => stateful((didUpdate, deps) => {
  const latest = getLatestFunction();
  const didCalled = typeof states[idx] !== 'undefined';
  const needUpdate =
    !didCalled ||
    typeof deps === 'undefined' ||
    states[idx].latest !== latest;

  if (needUpdate) {
    states[idx] = {
      latest,
    };
  }

  if (!deepEquals(states[idx].deps, deps) && needUpdate) {
    states[idx].deps = deps;

    makeEffect(didUpdate, idx);
  }
});

export const useEffect = sideEffect((didUpdate, idx) => {
  requestAnimationFrame(() => {
    queueMicrotask(() => {
      whenUpdate(didUpdate, idx);
    });
  });
});

export const useLayoutEffect = sideEffect((didUpdate, idx) => {
  const id = whenRenderSync(() => {
    dispatcher.unregister(id);
    whenUpdate(didUpdate, idx);
  });
});


export const useRef = stateful((initValue) => {
  const latest = getLatestFunction();
  if (!states[idx]) {
    states[idx] = new WeakMap();
  }

  if (!states[idx].has(latest)) {
    const ref = createRef();
    ref.current = initValue;

    states[idx].set(latest, ref);
  }
  return states[idx].get(latest);
});


export const useReducer = stateful((reducer, initialArg, init) => {
  const curIdx = idx;
  const lazyInit = () => init ? init(initialArg) : initialArg;
  const [state, setState] = useState(lazyInit);

  if (!states[curIdx]) {
    const store = createStore(() => state);
    states[curIdx] = store;
    store.reduce = reducer;
    store.subscribe(() => setState(states[curIdx].getState()));
  }

  return [
    state,
    states[curIdx].dispatch.bind(states[curIdx]),
  ];
});


export const useImperativeHandle = (ref, createHandle, deps) => {
  useEffect(() => {
    ref.current = createHandle();
  }, deps);
};


export function useEventListener(ref, eventName, handler) {
  useEffect(() => {
    if (!ref.current)
      return;

    ref.current.addEventListener(eventName, handler);
    return () => ref.current.removeEventListener(eventName, handler);
  }, [ref.current]);
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
