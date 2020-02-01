module.exports = (card, mattaValue) => {
  let res;
  if (mattaValue !== undefined && mattaValue !== 0 && card === 7)
    res = mattaValue % 10;
  else res = card % 10;
  if (res === 0) return 10;

  return res;
};
