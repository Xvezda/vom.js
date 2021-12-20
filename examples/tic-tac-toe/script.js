/**
 * Modified version of: https://reactjs.org/tutorial/tutorial.html
 * using hooks and function components.
 */

import {
  html,
  bind,
  render,
  useState,
  useCallback,
  useDelegation,
} from 'vomjs';


function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function Square(props) {
  return html`
    <button
      class="square"
      data-delegate="${props.delegate}"
      data-idx="${props.idx}"
    >
      ${props.value}
    </button>
  `;
}

function Board(props) {
  const renderSquare = (idx) => {
    return bind(Square)({
      delegate: props.boardRef,
      idx,
      value: props.squares[idx],
    });
  };

  return html`
    <div data-ref="${props.boardRef}">
      <div class="board-row">
        ${renderSquare(0)}
        ${renderSquare(1)}
        ${renderSquare(2)}
      </div>
      <div class="board-row">
        ${renderSquare(3)}
        ${renderSquare(4)}
        ${renderSquare(5)}
      </div>
      <div class="board-row">
        ${renderSquare(6)}
        ${renderSquare(7)}
        ${renderSquare(8)}
      </div>
    </div>
  `;
}

function Game() {
  const [state, setState] = useState({
    history: [
      {
        squares: Array(9).fill(null)
      }
    ],
    stepNumber: 0,
    xIsNext: true
  });

  const handleClick = useCallback((i) => {
    setState(state => {
      const history = state.history.slice(0, state.stepNumber + 1);
      const current = history[history.length - 1];
      const squares = current.squares.slice();
      if (calculateWinner(squares) || squares[i]) {
        return {...state};
      }
      squares[i] = state.xIsNext ? 'X' : 'O';

      return {
        history: history.concat([
          {
            squares: squares
          }
        ]),
        stepNumber: history.length,
        xIsNext: !state.xIsNext,
      };
    });
  }, []);

  const jumpTo = useCallback((step) => {
    setState(state => ({
      ...state,
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    }));
  }, []);

  const history = state.history;
  const current = history[state.stepNumber];
  const winner = calculateWinner(current.squares);

  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (state.xIsNext ? 'X' : 'O');
  }

  const movesRef = useDelegation(
    'click',
    target => jumpTo(parseInt(target.dataset.move)),
    []
  );

  const moves = history.map((step, move) => {
    const desc = move ?
      'Go to move #' + move :
      'Go to game start';

    return html`
      <li>
        <button
          data-move="${move}"
          data-delegate="${movesRef}"
        >${desc}</button>
      </li>
    `;
  });

  const boardRef = useDelegation(
    'click',
    target => handleClick(parseInt(target.dataset.idx)),
    [handleClick]
  );

  return html`
    <div class="game">
      <div class="game-board">
        ${bind(Board)({
          boardRef,
          squares: current.squares,
        })}
      </div>
      <div class="game-info">
        <div>${status}</div>
        <ol data-ref="${movesRef}">${moves}</ol>
      </div>
    </div>
  `;
}

render(Game, document.getElementById('root'));
