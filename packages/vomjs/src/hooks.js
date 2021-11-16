import { createStore } from '@vomjs/store';
import { Reference, dispatcher, latestComponent } from './shared.js';
import {
  isArrayEquals,
  isFirstCall,
  evaluate,
  getHash,
  nextTick,
  clearArray,
} from './helpers.js';

function hookIdx(index = 0, action) {
  switch (action.type) {
    case 'INCREMENT':
      return index + 1;
    case 'RESET':
      return 0;
    default:
      return index;
  }
}

function hookState(state = [], action) {
  switch (action.type) {
    case 'SET_STATE_IF_EMPTY':
      if (typeof state[action.index] !== 'undefined') {
        return state.slice();
      }
      // fallthrough
    case 'SET_STATE':
      return state
        .slice(0, action.index)
        .concat(Array.isArray(action.state)
          ? [action.state.slice()]
          : action.state)
        .concat(state.slice(action.index + 1));
    default:
      return state;
  }
}

const stateIdx = createStore(hookIdx);
const states = createStore(hookState);

const depIdx = createStore(hookIdx);
const deps = createStore(hookState);

const refIdx = createStore(hookIdx);
const refs = createStore(hookState);

const prevCleanUps = [];
dispatcher.register(payload => {
  if (payload.type === '@@vomjs/RENDER') {
    prevCleanUps.forEach(cleanUp => cleanUp());
    clearArray(prevCleanUps);

    stateIdx.dispatch({type: 'RESET'});
    depIdx.dispatch({type: 'RESET'});
    refIdx.dispatch({type: 'RESET'});
  }
});

const components = [];
export function useState(initState) {
  const currentIdx = stateIdx.getState();
  stateIdx.dispatch({type: 'INCREMENT'});

  let actionType;
  if (components[currentIdx] !== latestComponent) {
    components[currentIdx] = latestComponent;
    actionType = 'SET_STATE';
  } else {
    actionType = 'SET_STATE_IF_EMPTY';
  }
  states.dispatch({
    type: actionType,
    index: currentIdx,
    state: evaluate(initState),
  });

  const getState = () => states.getState()[currentIdx];
  return [
    getState(),
    function setState(newState) {
      states.dispatch({
        type: 'SET_STATE',
        index: currentIdx,
        state: evaluate(newState, getState()),
      });
      dispatcher.dispatch({type: '@@vomjs/RENDER'});
    },
  ];
}

export function useEffect(didUpdate, stateDeps) {
  const currentIdx = depIdx.getState();
  depIdx.dispatch({type: 'INCREMENT'});

  const firstCall =
    isFirstCall(deps.getState(), currentIdx) ||
    typeof stateDeps === 'undefined';

  if (firstCall && stateDeps) {
    deps.dispatch({
      type: 'SET_STATE',
      index: currentIdx,
      state: [...stateDeps || []],
    });
  }

  if (firstCall || !isArrayEquals(deps.getState()[currentIdx], stateDeps)) {
    deps.dispatch({
      type: 'SET_STATE',
      index: currentIdx,
      state: [...stateDeps || []],
    });
    // useEffect는 브라우저 화면이 다 그려질 때까지 지연됩니다
    requestAnimationFrame(() => {
      // 다음 어떤 새로운 렌더링이 발생하기 이전에 발생하는 것도 보장합니다
      nextTick(() => {
        const cleanUp = didUpdate();
        if (typeof cleanUp === 'function') {
          prevCleanUps.push(cleanUp);
        }
      });
    });
  }
}

export function useRef(initValue) {
  const currentIdx = refIdx.getState();
  refIdx.dispatch({type: 'INCREMENT'});

  let ref, refHash;
  if (isFirstCall(refs.getState(), currentIdx)) {
    refHash = getHash();
    ref = new Reference({
      hash: refHash,
      current: initValue,
    });

    refs.dispatch({
      type: 'SET_STATE',
      index: currentIdx,
      state: ref,
    });
  } else {
    ref = refs.getState()[currentIdx];
    refHash = ref.$ref.hash;
  }
  nextTick(() => {
    ref.current = document.querySelector(`[data-ref="${refHash}"]`);
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
    const selector = `[data-delegate="${ref.current.dataset.ref}"`;
    const target = event.target.closest(selector);
    if (!target) {
      return;
    }
    handler(target, event);
  };
  useEventListener(ref, eventName, delegate);
  return ref;
}
