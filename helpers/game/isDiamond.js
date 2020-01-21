module.exports = numCard => {
  if (numCard === 20 || (Math.floor(numCard / 10) === 1 && numCard !== 10))
    return true;
  return false;
};
