const intToValue = card => {
  let res = card % 10;

  if (card === 0) return 10;
  return res;
};

module.exports = intToValue;
