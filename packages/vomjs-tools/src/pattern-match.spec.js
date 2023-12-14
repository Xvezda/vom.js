import { vi, describe, test, expect } from 'vitest';
import { match, _ } from './pattern-match.js';

describe('when 메서드', function () {
  test('단일 when', function () {
    const f = vi.fn();
    match('hello')
      .when('hello', f);

    expect(f).toHaveBeenCalled();
  });

  test('when 체이닝', function () {
    const f = vi.fn();
    const f2 = vi.fn();

    match('hello')
      .when('foo', f)
      .when('bar', f)
      .when('hello', f2);

    expect(f).not.toHaveBeenCalled();
    expect(f2).toHaveBeenCalled();
  });

  test('중복 무시', function () {
    const f = vi.fn();
    const f2 = vi.fn();

    match('hello')
      .when('hello', f)
      .when('hello', f2);

    expect(f).toHaveBeenCalled();
    expect(f2).not.toHaveBeenCalled();
  });
});

describe('wildcard', function () {
  test('catch-all 패턴', function () {
    const f = vi.fn();
    const nop = () => {};

    match({foo: 'bar', hello: 'world'})
      .when('ham', nop)
      .when('spam', nop)
      .when(_, f);

    expect(f).toHaveBeenCalled();
  });

  test('특정 배열원소 무시', function () {
    const f = vi.fn();

    match(['foo', 'bar', 'baz'])
      .when([_, 'bar', _], f);

    expect(f).toHaveBeenCalled();
  });

  describe('객체 wildcard 비교', function () {
    test('key가 있는지 검사', function () {
      const f = vi.fn();

      match({foo: 'bar'})
        .when({foo: _}, f);

      expect(f).toHaveBeenCalled();
    });
  });
});
