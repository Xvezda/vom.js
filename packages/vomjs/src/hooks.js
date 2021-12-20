import ActionTypes from './action-types.js';
import { createRef } from './core.js';
import {
  dispatcher,
  getLatestFunction,
} from './shared.js';

import {
  deepEquals,
  callIfFunction,
} from '@vomjs/tools';
import { createStore } from '@vomjs/store';

const doWhen = type => task => {
  return dispatcher.register(payload => {
    if (payload.type === type) {
      task(payload);
    }
  });
};

const whenRender = doWhen(ActionTypes.RENDER);
const whenRenderSync = doWhen(ActionTypes.RENDER_SYNC);

let idx = -1;
const states = [];
whenRender(() => {
  idx = -1;
});

whenRenderSync(() => {
  states
    .splice(idx + 1, states.length - (idx+1))
    .forEach(({ cleanup }) => callIfFunction(cleanup));
});

function stateful(hook) {
  return function (...args) {
    ++idx;

    const latest = getLatestFunction();
    if (
      !states[idx] ||
      states[idx].component !== latest
    ) {
      if (states[idx] && typeof states[idx].cleanup === 'function') {
        states[idx].cleanup();
      }
      states[idx] = {};
    }
    states[idx].component = latest;

    return hook(...args);
  };
}

export const useMemo = stateful((callback, deps) => {
  if (
    typeof deps === 'undefined' ||
    !deepEquals(states[idx].deps, deps) ||
    !states[idx].memo
  ) {
    states[idx].memo = callback();
  }
  states[idx].deps = deps;

  return states[idx].memo;
});


export const useCallback =
  (callback, deps) => useMemo(() => callback, deps);


export const useState = stateful((initState) => {
  const latest = getLatestFunction();
  const curIdx = idx;

  if (!states[curIdx].state || states[curIdx].component !== latest) {
    states[curIdx].state = callIfFunction(initState);
  }

  return [
    states[curIdx].state,
    function setState(newState) {
      if (!states[curIdx] || states[curIdx].component !== latest) {
        return;
      }
      states[curIdx].state = callIfFunction(newState, [
        states[curIdx].state
      ]);
      dispatcher.dispatch({type: ActionTypes.RENDER});
    }
  ];
});

function whenUpdate(didUpdate, state) {
  const cleanup = didUpdate();
  if (typeof cleanup === 'function') {
    state.cleanup = cleanup;
  }
}

const sideEffect = makeEffect => (didUpdate, deps) => {
  if (
    typeof deps !== 'undefined' &&
    deepEquals(states[idx].deps, deps)
  ) {
    return;
  }
  callIfFunction(states[idx].cleanup);
  states[idx].deps = deps;

  makeEffect(didUpdate, states[idx]);
};

export const useEffect = stateful(
  sideEffect((didUpdate, state) => {
    requestAnimationFrame(() => {
      queueMicrotask(() => {
        whenUpdate(didUpdate, state);
      });
    });
  })
);

export const useLayoutEffect = stateful(
  sideEffect((didUpdate, state) => {
    const id = whenRenderSync(() => {
      whenUpdate(didUpdate, state);
      dispatcher.unregister(id);
    });
  })
);


export const useRef = stateful((initValue) => {
  if (!states[idx].ref) {
    const ref = createRef();
    ref.current = initValue;

    states[idx].ref = ref;
  }
  return states[idx].ref;
});


export const useReducer = stateful((reducer, initialArg, init) => {
  const curIdx = idx;
  const lazyInit = () => init ? init(initialArg) : initialArg;
  const [state, setState] = useState(lazyInit);

  let store = states[curIdx].store;
  if (!store) {
    store = createStore(() => state);
    store.reduce = reducer;
    store.subscribe(() => setState(store.getState()));

    states[curIdx].store = store;
  }

  return [
    store.getState(),
    store.dispatch.bind(store),
  ];
});


export const useImperativeHandle = (ref, createHandle, deps) => {
  useEffect(() => {
    ref.current = createHandle();
  }, deps);
};


export function useEventListener(eventName, handler, deps) {
  const ref = useRef();
  const listener = useCallback(handler, deps);

  useEffect(() => {
    const eventTarget = ref.current;

    eventTarget.addEventListener(eventName, listener);
    return () => {
      eventTarget.removeEventListener(eventName, listener);
    };
  }, deps);

  return ref;
}

export function useDelegation(eventName, handler, deps) {
  const delegateRef = useRef();
  const listener = useCallback((event) => {
    const selector = '[data-delegate]';
    const target = event.target.closest(selector);
    if (!target || target.dataset.delegate !== String(delegateRef.current))
      return;

    handler(target, event);
  }, deps);

  const ref = useEventListener(eventName, listener, deps);
  useLayoutEffect(() => {
    delegateRef.current = ref;
  });

  return ref;
}
