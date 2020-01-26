const getValue = require('./getValue');

module.exports = board => board.reduce((acc, val) => (acc += getValue(val)), 0);
