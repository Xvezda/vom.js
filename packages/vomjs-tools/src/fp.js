export const pipe = (...args) => value =>
  args
    .slice(1)
    .reduce((acc, f) =>
      'then' in acc
        ? acc.then(f)
        : f(acc),
      args
        .slice()
        .shift()(value));
