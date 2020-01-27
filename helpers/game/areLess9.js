const getValue = require('./getValue');

module.exports = hand => {
  return (
    hand
      .map(card => (card === 7 ? 1 : card))
      .reduce((acc, val) => (acc += getValue(val)), 0) <= 9
  );
};
