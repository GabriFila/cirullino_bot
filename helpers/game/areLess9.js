const getValue = require('./getValue');

module.exports = hand => {
  return hand.reduce((acc, val) => (acc += getValue(val)), 0) <= 9;
};
