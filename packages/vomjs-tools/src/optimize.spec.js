/**
 * @jest-environment jsdom
 */
import { debounce, throttle } from './optimize.js';


jest.useFakeTimers();

jest
  .spyOn(window, 'requestAnimationFrame')
  .mockImplementation(callback => setTimeout(callback, 16));

test('debounce', () => {
  const arr = [1, 2, 3];
  const mock = jest.fn();
  const debounced = debounce(200)(mock);


  arr.forEach(debounced);
  expect(mock).not.toBeCalled();

  jest.runAllTimers();

  expect(mock).toBeCalledTimes(1);
});

test('throttle', () => {
  const mock = jest.fn();
  const throttled = throttle(mock);

  jest.advanceTimersByTime(8);
  expect(mock).not.toBeCalled();

  throttled();
  expect(mock).not.toBeCalled();

  throttled();
  jest.advanceTimersByTime(16);

  expect(mock).toBeCalledTimes(1);
});
