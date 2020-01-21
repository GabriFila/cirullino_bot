const isThereMoreThanOneMax = require('../general/isThereMoreThanOneMax');
const indexOfMax = require('../general/indexOfMax');
const isDiamond = require('./isDiamond');
const getValue = require('./getValue');

const calculatePoints = (strongDecks, weakDecks) => {
  const points = [];
  const diamonds = [];
  const cards = [];
  let whoHasDiamonds = -1;
  let whoHasCards = -1;
  let whoHasPiccola = -1; // if someone hasthen it is the player index
  let whoHasPrimiera = -1; // if someone hasthen it is the player index
  let piccolaValue = 0;
  let whoHasGrande = -1; // if someone hasthen it is the player index
  let whoHasSeven = -1; // if someone hasthen it is the player index
  // add 'scope' to points

  for (let usr = 0; usr < Object.keys(strongDecks).length; usr += 1) {
    // add #'scope' to points
    points.push(strongDecks[usr].length);
    // then pass strong cards into weak
    weakDecks[usr].push(...strongDecks[usr]);
    // count denari
    diamonds.push(weakDecks[usr].filter(numCard => isDiamond(numCard)).length);
    // count cards
    cards.push(weakDecks[usr].length);
    // TODO keep going on primiera
    if (weakDecks[usr].filter(card => getValue(card) === 7).length === 3) {
      whoHasPrimiera = usr;
      points[whoHasPrimiera] += 1;
    }

    // calc piccola
    if (
      weakDecks[usr].includes(11) &&
      weakDecks[usr].includes(12) &&
      weakDecks[usr].includes(13)
    ) {
      whoHasPiccola = usr;
      for (let j = 0; j < 3; j += 1) {
        if (weakDecks[usr].includes(j + 14)) piccolaValue = j + 1;
        else break;
      }

      piccolaValue += 3;
      points[usr] += piccolaValue;
    }
    // calc grande
    if (
      weakDecks[usr].includes(18) &&
      weakDecks[usr].includes(19) &&
      weakDecks[usr].includes(20)
    ) {
      whoHasGrande = usr;
      points[usr] += 5;
    }
    // calc settebello
    if (weakDecks[usr].includes(17)) {
      whoHasSeven = usr;
      points[usr] += 1;
    }
  }

  // check which user has 'carte' and 'denari'
  if (!isThereMoreThanOneMax(diamonds)) whoHasDiamonds = indexOfMax(diamonds);
  if (!isThereMoreThanOneMax(cards)) whoHasCards = indexOfMax(cards);
  if (whoHasDiamonds !== -1) points[whoHasDiamonds] += 1;
  if (whoHasCards !== -1) points[whoHasCards] += 1;
  return {
    points,
    whoHasCards,
    whoHasDiamonds,
    whoHasPiccola,
    piccolaValue,
    whoHasGrande,
    whoHasSeven,
    whoHasPrimiera
  };
};
module.exports = calculatePoints;

const strongs = { 0: [11, 12, 13], 1: [20] };
const weaks = { 0: [15, 16, 14], 1: [18, 19] };

console.log(calculatePoints(strongs, weaks));
