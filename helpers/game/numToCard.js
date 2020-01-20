/* eslint-disable no-plusplus */
const getValue = require('./getValue');

const numToCard = num => {
  let card = '';

  const values = ['', 'A', 2, 3, 4, 5, 6, 7, 'J', 'Q', 'K'];
  const value = values[getValue(num)];
  let suit = Math.floor(num / 10);

  if (value === 'K') {
    suit--;
  }
  // const suits = {
  //   0: '\u2665',
  //   1: '\u2666',
  //   2: '\u2663',
  //   3: '\u2660'
  // };

  const suits = ['\u2665', '\u2666', '\u2663', '\u2660'];

  suit = suits[suit];

  card += value;
  card += suit;

  return card;
};

module.exports = numToCard;

// console.log(numToCard(1));
// console.log(numToCard(17));
// console.log(numToCard(39));
// console.log(numToCard(10));
// console.log(numToCard(20));
// console.log(numToCard(30));
// console.log(numToCard(40));
