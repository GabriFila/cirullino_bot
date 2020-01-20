const numToCard = require('./numToCard');

const numsToString = nums =>
  nums.reduce((acc, val) => (acc += `${numToCard(val)}  `), '');

module.exports = numsToString;
