const getValue = require('./getValue');

module.exports = (board, mattaValue) =>
  board.reduce((acc, val) => (acc += getValue(val, mattaValue)), 0);
