/**
 * @jest-environment jsdom
 */
import {
  render as _render,
  html,
  bind,
  forwardRef
} from '.';
import {
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useReducer,
  useCallback,
  useImperativeHandle,
} from './hooks.js';


const fps = 60;
const interval = Math.floor(1000 / fps);

jest.useFakeTimers();

jest
  .spyOn(window, 'requestAnimationFrame')
  .mockImplementation(callback => setTimeout(callback, interval));

const render = jest.fn((...args) => {
  _render(...args);
  jest.runAllTicks();
  jest.runAllTimers();
});

describe('useState', () => {
  test('setter를 통해서 상태 변경', () => {
    const mock = jest.fn();
    const App = () => {
      const [state, setState] = useState('foo');

      mock(state);

      if (state !== 'bar') {
        setState('bar');
      }
      return state;
    };
    render(App, document.body);
    render(App, document.body);

    expect(mock).nthCalledWith(1, 'foo');
    expect(mock).nthCalledWith(2, 'bar');
  });

  test('함수적 갱신', () => {
    const mock = jest.fn(() => 'bar');
    const App = () => {
      const [state, setState] = useState('foo');

      if (state === 'foo') {
        setState(mock);
      }
      return state;
    };
    render(App, document.body);
    expect(mock).toBeCalledWith('foo');

    render(App, document.body);
    expect(document.body.innerHTML.trim()).toBe('bar');
  });

  test('지연 초기 state', () => {
    const mock = jest.fn(() => 'foo');

    const App = () => {
      const [state] = useState(mock);
      return state;
    };
    render(App, document.body);

    expect(mock).toBeCalledTimes(1);
    expect(document.body.innerHTML.trim()).toBe('foo');
  });
});

describe('useEffect', () => {
  test('effect 정리', () => {
    const clean = jest.fn();
    const effect = jest.fn(() => clean);

    const App = () => {
      useEffect(effect);
      return '';
    };
    render(App, document.body);
    expect(effect).toBeCalledTimes(1);
    expect(clean).not.toBeCalled();

    render(App, document.body);
    expect(effect).toBeCalledTimes(2);
    expect(clean).toBeCalledTimes(1);
  });

  test('조건부 effect 발생', () => {
    const clean = jest.fn();
    const effect = jest.fn(() => clean);

    const App = (props) => {
      useEffect(effect, [props.flag]);
      return '';
    };
    render(bind(App)({flag: true}), document.body);
    render(bind(App)({flag: true}), document.body);

    expect(effect).toBeCalledTimes(1);
    expect(clean).not.toBeCalled();

    render(bind(App)({flag: false}), document.body);
    expect(effect).toBeCalledTimes(2);
    expect(clean).toBeCalledTimes(1);
  });
});

describe('useLayoutEffect', () => {
  test('동기적으로 처리', () => {
    const App = () => {
      const [state, setState] = useState('foo');

      useLayoutEffect(() => {
        setState('bar');
      }, []);

      return state;
    };

    render(App, document.body);
    expect(document.body.innerHTML.trim()).toBe('bar');
  });

  test('effect 타이밍', () => {
    const mock = jest.fn();
    const App = () => {
      useEffect(() => {
        mock('effect');
      });

      useLayoutEffect(() => {
        mock('layout effect');
      });
      return '';
    };
    render(App, document.body);

    expect(mock).nthCalledWith(1, 'layout effect');
    expect(mock).nthCalledWith(2, 'effect');
  });
});

describe('useMemo', () => {
  test('메모이제이션', () => {
    const mock = jest.fn(value => value);
    const App = (props) => {
      const memoized = useMemo(() => mock(props.value), [props.value]);
      return memoized;
    };
    render(bind(App)({value: 'foo'}), document.body);
    render(bind(App)({value: 'foo'}), document.body);

    expect(mock).toBeCalledTimes(1);
    expect(document.body.innerHTML.trim()).toBe('foo');

    render(bind(App)({value: 'bar'}), document.body);
    expect(mock).toBeCalledTimes(2);
    expect(document.body.innerHTML.trim()).toBe('bar');
  });
});

describe('useRef', () => {
  test('초기값 설정', () => {
    const App = () => {
      const ref = useRef('foo');

      return ref.current;
    };
    render(App, document.body);

    expect(document.body.innerHTML.trim()).toBe('foo');
  });

  test('DOM 참조', () => {
    const capture = jest.fn();
    const App = () => {
      const ref = useRef();

      useEffect(() => {
        capture(ref.current);
      });

      return html`
        <div>
          <p>nested something</p>
          <a
            id="link"
            data-ref="${ref}"
            href="https://github.com/"
          >
            go to GitHub
          </a>
        </div>
      `;
    };
    render(App, document.body);

    const linkEl = document.getElementById('link');
    expect(capture.mock.calls[0]).toEqual([linkEl]);
  });

  test('리렌더링 없음', () => {
    const mock = jest.fn();
    const App = () => {
      const ref = useRef('foo');

      mock();
      if (ref.current === 'foo') {
        ref.current = 'bar';
      }
      return '';
    };
    render(App, document.body);
    expect(mock).toBeCalledTimes(1);
  });
});

describe('useReducer', () => {
  const initialState = {count: 0};
  function reducer(state, action) {
    switch (action.type) {
      case 'increment':
        return {count: state.count + 1};
      case 'decrement':
        return {count: state.count - 1};
      default:
        throw new Error();
    }
  }

  const App = () => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const incBtnRef = useRef();
    const decBtnRef = useRef();

    useEffect(() => {
      const incBtn = incBtnRef.current;
      const decBtn = decBtnRef.current;

      const increment = () => dispatch({ type: 'increment' });
      const decrement = () => dispatch({ type: 'decrement' });

      incBtn.addEventListener('click', increment);
      decBtn.addEventListener('click', decrement);

      return () => {
        incBtn.removeEventListener('click', increment);
        decBtn.removeEventListener('click', decrement);
      };
    });

    return html`
      <div>
        <p id="count">${state.count}</p>
        <div>
          <button
            id="increment"
            data-ref="${incBtnRef}">
            +
          </button>
          <button
            id="decrement"
            data-ref="${decBtnRef}">
            -
          </button>
        </div>
      </div>
    `;
  };

  test('카운터 증감 예제', () => {
    const getCount = () =>
      parseInt(document.getElementById('count').textContent);

    render(App, document.body);
    expect(getCount()).toBe(0);

    document.getElementById('increment').click();
    render(App, document.body);
    expect(getCount()).toBe(1);

    document.getElementById('decrement').click();
    render(App, document.body);
    expect(getCount()).toBe(0);
  });
});

describe('useCallback', () => {
  test('같은 함수를 반환', () => {
    const capture = jest.fn();
    const callback = () => {};
    const App = () => {
      const cb = useCallback(callback, []);
      capture(cb);

      return '';
    };
    render(App, document.body);
    render(App, document.body);

    const calls = capture.mock.calls;
    const captured = calls.map(args => args[0]);
    expect(captured[0]).toStrictEqual(captured[1]);
  });

  test('의존성 변경 반영', () => {
    const capture = jest.fn();
    const App = () => {
      const [flag, setFlag] = useState(false);

      const cb = useCallback(() => {
        capture(flag);
      }, [flag]);

      if (!flag) {
        setFlag(true);
      }
      cb();

      return '';
    };
    render(App, document.body);
    render(App, document.body);

    const calls = capture.mock.calls;
    const captured = calls.map(args => args[0]);

    expect(captured[0]).not.toBe(captured[1]);
  });
});

describe('useImperativeHandle', () => {
  test('노출 인스턴스 사용자화', () => {
    const capture = jest.fn();

    const Child = forwardRef((props, ref) => {
      useImperativeHandle(ref, () => ({
        foo: () => 'bar',
      }));
      return '';
    });

    const App = () => {
      const ref = useRef();

      useEffect(() => {
        capture(ref.current.foo());
      });

      return html`
        ${bind(Child)({ ref })}
      `;
    };
    render(App, document.body);

    expect(capture).toBeCalledWith('bar');
  });
});
