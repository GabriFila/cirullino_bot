module.exports = arr => {
  const sortedArr = arr.sort();
  if (sortedArr[0] === sortedArr[1]) return true;
  return false;
};
