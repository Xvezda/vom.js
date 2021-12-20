import {
  render,
  html,
  useRef,
  useState,
  useEffect,
  useEventListener,
  useDelegation,
} from 'vomjs';

import { match } from '@vomjs/tools';


function Timer() {
  const [count, setCount] = useState(0);

  const intervalRef = useRef();
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCount(count => count + 1);
    }, 1000);
    return () => {
      clearTimeout(intervalRef.current);
    };
  }, []);

  return html`
    <div>timer count: ${count}</div>
  `;
}

function Counter() {
  const [count, setCount] = useState(0);

  const buttonRef = useEventListener('click', () => {
    setCount(count => count + 1);
  }, []);

  return html`
    <div>
      <label>Count: ${count}</label>
      <button data-ref="${buttonRef}">click</button>
    </div>
  `;
}

function Foo() {
  useEffect(() => {
    document.title = 'Foo page';
  }, []);

  return html`
    <div>
      <h2>Foo</h2>
      ${Timer}
    </div>
  `;
}

function Bar() {
  useEffect(() => {
    document.title = 'Bar page';
  }, []);

  return html`
    <div>
      <h2>Bar</h2>
      ${Counter}
    </div>
  `;
}

function Main() {
  useEffect(() => {
    document.title = 'Main page';
  }, []);

  return html`
    <h1>Main</h1>
  `;
}

function App() {
  const [page, setPage] = useState(location.pathname);

  useEffect(() => {
    window.onpopstate = function (event) {
      const { page } = event.state || {page: '/'};
      setPage(page);
    };
  }, []);

  const ref = useDelegation('click', (target, event) => {
    event.preventDefault();

    const href = target.getAttribute('href');

    setPage(prev => {
      if (prev !== href) {
        history.pushState({page: href}, '', href);
      }
      return href;
    });
  }, []);

  return html`
    <div>
      <ul data-ref="${ref}">
        <li>
          <a href="/" data-delegate="${ref}">Main</a>
        </li>
        <li>
          <a href="/foo" data-delegate="${ref}">Foo</a>
        </li>
        <li>
          <a href="/bar" data-delegate="${ref}">Bar</a>
        </li>
      </ul>
      ${match(page)
          .when('/', () => Main)
          .when('/foo', () => Foo)
          .when('/bar', () => Bar)
          .otherwise(() => html`<h1>Not exists</h1>`)
      }
    </div>
  `;
}
render(App, document.getElementById('root'));