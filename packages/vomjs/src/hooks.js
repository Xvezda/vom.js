import {
  Reference,
  dispatcher,
  getLatestFunction,
} from './shared.js';
import {
  isArrayEquals,
  isFirstCall,
  evaluate,
  getHash,
  nextTick,
  clearArray,
} from './helpers.js';


const states = new Map();
const deps = new Map();
const refs = new Map();

export function useState(initState) {
  const latest = getLatestFunction();

  if (!states.has(latest)) {
    states.set(latest, evaluate(initState));
  }

  return [
    states.get(latest),
    function setState(newState) {
      states.set(latest, evaluate(newState, states.get(latest)));
      dispatcher.dispatch({type: '@@vomjs/RENDER'});
    }
  ];
}

const cleanups = [];
dispatcher.register(payload => {
  if (payload.type === '@@vomjs/RENDER') {
    cleanups.forEach(cleanUp => cleanUp());
    clearArray(cleanups);
  }
});
export function useEffect(didUpdate, stateDeps) {
  const latest = getLatestFunction();
  const didCalled = deps.has(latest);
  const needUpdate = didCalled || typeof stateDeps === 'undefined';

  if (needUpdate && stateDeps) {
    deps.set(latest, stateDeps);
  }

  if (!needUpdate && isArrayEquals(deps.get(latest), stateDeps || []))
    return;

  requestAnimationFrame(() => {
    nextTick(() => {
      const cleanup = didUpdate();
      if (typeof cleanup === 'function') {
        cleanups.push(cleanup);
      }
    });
  });
}

export function useRef(initValue) {
  const latest = getLatestFunction();

  let ref, refHash;
  if (!refs.has(latest)) {
    refHash = getHash();
    ref = new Reference({
      hash: refHash,
      current: initValue,
    });
    refs.set(latest, ref);
  } else {
    ref = refs.get(latest);
    refHash = String(ref);
  }
  nextTick(() => {
    const selected = document.querySelector(`[data-ref="${refHash}"]`);
    ref.current = selected;
  });
  return ref;
}

export function useEventListener(ref, eventName, handler) {
  useEffect(() => {
    ref.current?.addEventListener(eventName, handler);
    return () => ref.current?.removeEventListener(eventName, handler);
  });
}

export function useDelegation(eventName, handler) {
  const ref = useRef();
  const delegate = (event) => {
    const selector = `[data-delegate="${ref}"`;
    const target = event.target.closest(selector);
    if (!target) {
      return;
    }
    handler(target, event);
  };
  useEventListener(ref, eventName, delegate);
  return ref;
}
