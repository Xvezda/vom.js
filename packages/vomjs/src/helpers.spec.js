/**
 * @jest-environment jsdom
 */
import {
  html,
  bind,
} from './helpers.js';


describe('bind', () => {
  const App = () => html`<div>hello world</div>`;

  test('같은 속성은 같은 bind된 컴포넌트를 반환', () => {
    const Binded1 = bind(App)({foo: 'hello'});
    expect(Binded1).toBe(bind(App)({foo: 'hello'}));

    // 다른 bind가 선언되어도 같은 결과를 유지
    const _ = bind(App)({bar: 'world'});  // eslint-disable-line no-unused-vars
    expect(Binded1).toBe(bind(App)({foo: 'hello'}));
  });

  test('다른 속성은 다른 컴포넌트를 반환', () => {
    const Binded1 = bind(App)({foo: 'hello'});
    const Binded2 = bind(App)({bar: 'world'});

    expect(Binded1).not.toBe(Binded2);
  });
});
