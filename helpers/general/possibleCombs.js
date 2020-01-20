/* eslint-disable no-plusplus */
const possibleCombs = array => {
  const fn = (n, src, got, all) => {
    if (n === 0) {
      if (got.length > 0) {
        all[all.length] = got;
      }
      return;
    }
    for (let j = 0; j < src.length; j++) {
      fn(n - 1, src.slice(j + 1), got.concat([src[j]]), all);
    }
  };

  const all = [];

  for (let i = 1; i < array.length; i++) {
    fn(i, array, [], all);
  }

  all.push(array);

  return all;
};
module.exports = possibleCombs;
