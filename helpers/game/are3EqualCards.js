const getValue = require('./getValue');

module.exports = hand => {
  if (hand.some(card => card === 7)) {
    const handNoMatta = hand.filter(card => card !== 7);
    return getValue(handNoMatta[0]) === getValue(handNoMatta[1]);
  }
  return (
    getValue(hand[0]) === getValue(hand[1]) &&
    getValue(hand[0]) === getValue(hand[2])
  );
};
