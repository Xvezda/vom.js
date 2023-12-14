/**
 * @vitest-environment jsdom
 */
import { vi, describe, test, expect } from 'vitest';
import { select } from './selector';

describe('select', () => {
  const div = document.createElement('div');
  div.id = 'dummy';
  document.body.appendChild(div);

  test('selector', () => {
    expect(select('#dummy').context()).toBe(div);
  });

  const button = document.createElement('button');
  button.textContent = 'click me';
  document.body.appendChild(button);

  test('on and off', () => {
    const mock = vi.fn();
    const selected = select(button).on('click', mock);

    expect(selected.context()).toBe(button);

    expect(mock).not.toHaveBeenCalled();
    button.click();
    expect(mock).toHaveBeenCalled();

    button.click();
    expect(mock).toHaveBeenCalledTimes(2);

    selected.off('click', mock);
    button.click();
    expect(mock).toHaveBeenCalledTimes(2);
  });
});
