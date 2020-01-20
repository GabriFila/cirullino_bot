const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min))) +
  Math.ceil(min); // Il max è escluso e il min è incluso

module.exports = getRandomInt;
