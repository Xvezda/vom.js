/**
 * @jest-environment jsdom
 */
import { render, bind } from 'vomjs';
import {
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
} from './hooks.js';


const fps = 60;
const interval = Math.floor(1000 / fps);

jest.useFakeTimers();

jest
  .spyOn(window, 'requestAnimationFrame')
  .mockImplementation(callback => setTimeout(callback, interval));

jest.mock('vomjs', () => {
  const originalModule = jest.requireActual('vomjs');
  return {
    ...originalModule,
    render: jest.fn((...args) => {
      originalModule.render(...args);
      jest.runAllTicks();
      jest.runAllTimers();
    }),
  };
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
