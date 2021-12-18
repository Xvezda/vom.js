import {
  render,
  html,
  useRef,
  useState,
  useEffect,
  useDelegation,
  useCallback,
} from 'vomjs';
import {match} from '@vomjs/tools';

function Timer() {
  const [count, setCount] = useState(0);

  const intervalRef = useRef();
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCount(count => count + 1);
    }, 1000);
    return () => clearTimeout(intervalRef.current);
  }, []);

  return html`
    <div>timer count: ${count}</div>
  `;
}

function Counter() {
  const [count, setCount] = useState(0);

  const buttonRef = useRef();
  useEffect(() => {
    const increment = () => setCount(count => count + 1);
    buttonRef.current.addEventListener('click', increment);
    return () => {
      buttonRef.current.removeEventListener('click', increment);
    };
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
      const state = event.state || {page: '/'};
      setPage(state.page);
    };
  }, []);

  const clickLink = useCallback((target, event) => {
    event.preventDefault();
    const href = target.getAttribute('href');

    history.pushState({page: href}, '', href);
    setPage(href);
  }, [history, page]);

  const linksRef = useDelegation('click', clickLink);

  return html`
    <div>
      <ul data-ref="${linksRef}">
        <li>
          <a href="/" data-delegate="${linksRef}">Main</a>
        </li>
        <li>
          <a href="/foo" data-delegate="${linksRef}">Foo</a>
        </li>
        <li>
          <a href="/bar" data-delegate="${linksRef}">Bar</a>
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