const numToCard = require('./numToCard');

module.exports = nums =>
  nums.reduce((acc, val) => (acc += `${numToCard(val)}  `), '');
