import { vi, test, expect } from 'vitest';
import { createStore } from './reduce.js';

test('카운터 예제 테스트', () => {
  // Redux-like 인터페이스를 테스트하기 위해 동일한 예제를 사용한다.
  // https://redux.js.org/introduction/getting-started
  function counterReducer(state = {value: 0}, action) {
    switch (action.type) {
      case 'counter/incremented':
        return {value: state.value + 1};
      case 'counter/decremented':
        return {value: state.value - 1};
      default:
        return state;
    }
  }

  const store = createStore(counterReducer);
  const subscriberMock = vi.fn();
  store.subscribe(() => subscriberMock(store.getState()));

  store.dispatch({type: 'counter/incremented'});
  expect(subscriberMock).toHaveBeenCalledWith({value: 1});
  store.dispatch({type: 'counter/incremented'});
  expect(subscriberMock).toHaveBeenCalledWith({value: 2});
  store.dispatch({type: 'counter/decremented'});
  expect(subscriberMock).toHaveBeenCalledWith({value: 1});
});
