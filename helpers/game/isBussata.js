const getValue = require('./getValue');

module.exports = hand => {
  return (
    hand.length === 3 &&
    (hand.reduce((acc, val) => (acc += getValue(val)), 0) <= 9 ||
      // if all 3 equals
      (getValue(hand[0]) === getValue(hand[1]) &&
        getValue(hand[0]) === getValue(hand[2])))
  );
  // show only on first step of new hand
};
