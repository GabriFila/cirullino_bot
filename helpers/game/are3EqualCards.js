const getValue = require('./getValue');

module.exports = (hand, mattaValue) => {
  if (hand.includes(7) && mattaValue === 0) {
    console.log('here');
    const handNoMatta = hand.filter(num => num !== 7);
    return (
      getValue(handNoMatta[0], mattaValue) ===
      getValue(handNoMatta[1], mattaValue)
    );
  }
  return (
    getValue(hand[0], mattaValue) === getValue(hand[1], mattaValue) &&
    getValue(hand[0], mattaValue) === getValue(hand[2], mattaValue)
  );
};
