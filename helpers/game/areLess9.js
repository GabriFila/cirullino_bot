const getValue = require('./getValue');

module.exports = (hand, mattaValue) => {
  if (hand.includes(7) && mattaValue === 0) {
    console.log('here');

    const handNoMatta = hand.filter(num => num !== 7);
    return handNoMatta.reduce((acc, val) => (acc += getValue(val)), 0) <= 8;
  }
  return hand.reduce((acc, val) => (acc += getValue(val, mattaValue)), 0) <= 9;
};
