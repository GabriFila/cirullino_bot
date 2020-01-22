const getValue = require('./getValue');

module.exports = hand => {
  return (
    getValue(hand[0]) === getValue(hand[1]) &&
    getValue(hand[0]) === getValue(hand[2])
  );
};
