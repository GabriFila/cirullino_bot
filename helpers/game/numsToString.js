const numToCard = require('./numToCard');

module.exports = (nums, mattaValue) =>
  nums.reduce((acc, val) => (acc += `${numToCard(val, mattaValue)}  `), '');
