/**
 * @jest-environment jsdom
 */
import { render } from 'vomjs';
import { useState } from './hooks.js';


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
});
