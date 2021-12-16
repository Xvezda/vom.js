import {
  render,
  html,
  bind,
  useReducer,
  useDelegation,
} from 'vomjs';


function init(initialCount) {
  return {count: initialCount};
}

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return {count: state.count + 1};
    case 'decrement':
      return {count: state.count - 1};
    default:
      throw new Error();
  }
}

function Counter({ initialCount }) {
  const [state, dispatch] = useReducer(reducer, initialCount, init);

  const counterRef = useDelegation('click', target => {
    const { dataset: { action } } = target;
    switch (action) {
      case 'incrementIfOdd':
        if (state.count & 1) {
          dispatch({type: 'increment'});
        }
        break;
      case 'incrementAsync':
        setTimeout(() => {
          dispatch({type: 'increment'});
        }, 1000);
        break;
      default:
        dispatch({type: target.dataset.action});
        break;
    }
  });

  const createButton = (action, text) => html`
    <button
      data-delegate="${counterRef}"
      data-action="${action}"
    >
      ${text}
    </button>
  `;

  return html`
    <div data-ref="${counterRef}">
      <p>Count: ${state.count}</p>
      ${createButton('increment', '+')}
      ${createButton('decrement', '-')}
      ${createButton('incrementIfOdd', 'increment if odd')}
      ${createButton('incrementAsync', 'increment if async')}
    </div>
  `;
}

function App() {
  return html`
    ${bind(Counter)({initialCount: 0})
  }`;
}

render(App, document.getElementById('root'));
