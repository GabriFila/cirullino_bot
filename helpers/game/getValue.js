module.exports = card => {
  const res = card % 10;
  if (res === 0) return 10;
  return res;
};
