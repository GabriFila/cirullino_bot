/* eslint-disable no-plusplus */
const getValue = require('./getValue');

const numToCard = (num, mattaValue) => {
  let card = '';

  const values = ['', 'A', 2, 3, 4, 5, 6, 7, 'J', 'Q', 'K'];
  const value = values[getValue(num)];
  let suit = Math.floor(num / 10);

  if (value === 'K') {
    suit--;
  }
  const suits = ['\u2665', '\u2666', '\u2663', '\u2660'];

  suit = suits[suit];

  card += value;
  card += suit;
  if (num === 7 && mattaValue !== undefined && mattaValue !== 0)
    card += `(${numToCard(mattaValue)})`;
  return card;
};

module.exports = numToCard;
