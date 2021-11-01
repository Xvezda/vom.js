const {pipe} = require('./fp');

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

async function runPendingPromise() {
  // https://stackoverflow.com/a/52686304
  await Promise.resolve();
}

describe('pipe', () => {
  test('이전 함수의 반환값으로 호출', () => {
    const mock = jest.fn(x => x);
    const isEven = xs => xs.filter(x => x % 2 === 0);
    const biggerThan = n => xs => xs.filter(x => x > n);

    pipe(
      mock,
      isEven,
      mock,
      biggerThan(4),
      mock
    )([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    expect(mock).toHaveBeenNthCalledWith(1, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(mock).toHaveBeenNthCalledWith(2, [2, 4, 6, 8]);
    expect(mock).toHaveBeenNthCalledWith(3, [6, 8]);
  });

  test('비동기 함수 처리', async () => {
    const mock = jest.fn(x => x);
    pipe(
      x => Promise.resolve(x),
      mock
    )(42);

    expect(mock).not.toBeCalled();

    await runPendingPromise();
    expect(mock).toBeCalled();
  });

  test('비동기 지연 처리', async () => {
    const mock = jest.fn(x => x);
    const delay = time => x =>
      new Promise(resolve => setTimeout(() => resolve(x), time));

    const waitFor = 1000;
    const p = pipe(
      delay(waitFor),
      mock,
      delay(waitFor),
      mock,
    )(42);

    expect(mock).not.toBeCalled();

    jest.advanceTimersByTime(waitFor);
    await runPendingPromise();

    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenNthCalledWith(1, 42);

    jest.advanceTimersByTime(waitFor);
    await runPendingPromise();
    await p;

    expect(mock).toHaveBeenCalledTimes(2);
    expect(mock).toHaveBeenNthCalledWith(2, 42);
  });
});