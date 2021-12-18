import { deepEquals } from './common.js';

describe('deepEquals', () => {
  test('배열 비교', () => {
    expect(deepEquals([], [])).toBe(true);
    expect(deepEquals([1], [])).toBe(false);
  });

  test('객체 비교', () => {
    expect(deepEquals({}, {})).toBe(true);
    expect(deepEquals({foo: 1}, {})).toBe(false);
    expect(deepEquals({}, {bar: 2})).toBe(false);
    expect(deepEquals({foo: 1}, {foo: 2})).toBe(false);
    expect(deepEquals({foo: 1}, {foo: 1})).toBe(true);
  });
});
