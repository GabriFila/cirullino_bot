module.exports = array => {
  const fn = (n, src, got, all) => {
    if (n === 0) {
      if (got.length > 0) {
        all[all.length] = got;
      }
      return;
    }
    for (let j = 0; j < src.length; j += 1) {
      fn(n - 1, src.slice(j + 1), got.concat([src[j]]), all);
    }
  };

  const all = [];

  for (let i = 1; i < array.length; i += 1) {
    fn(i, array, [], all);
  }

  all.push(array);

  return all;
};
