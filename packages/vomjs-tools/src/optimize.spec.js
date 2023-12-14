/**
 * @vitest-environment happy-dom
 */
import { vi, test, expect } from 'vitest';
import { debounce, throttle } from './optimize.js';


const fps = 60;
const interval = Math.floor(1000 / fps);

vi.useFakeTimers();

vi
  .spyOn(window, 'requestAnimationFrame')
  .mockImplementation(callback => setTimeout(callback, interval));

test('debounce', () => {
  const arr = [1, 2, 3];
  const mock = vi.fn();
  const debounced = debounce(200)(mock);


  arr.forEach(debounced);
  expect(mock).not.toBeCalled();

  vi.runAllTimers();

  expect(mock).toBeCalledTimes(1);
});

test('throttle', () => {
  const mock = vi.fn();
  const throttled = throttle(mock);

  vi.advanceTimersByTime(8);
  expect(mock).not.toBeCalled();

  throttled();
  expect(mock).not.toBeCalled();

  throttled();
  vi.advanceTimersByTime(16);

  expect(mock).toBeCalledTimes(1);
});
