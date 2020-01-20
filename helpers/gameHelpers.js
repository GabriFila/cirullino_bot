/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable no-return-assign */
/* eslint-disable comma-dangle */
const { possibleCombs, indexOfMax } = require('./common');

const isThereMoreThanOneMax = arr => {
  const sortedArr = arr.sort();
  if (sortedArr[0] === sortedArr[1]) return true;
  return false;
};

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

  for (let i = 0; i < Object.keys(strongDecks).length; i++) {
    // add scope to points
    points.push(strongDecks[i].length);
    // then pass strong cards into weak
    weakDecks[i].push(...strongDecks[i]);
    // count denari
    diamonds.push(
      weakDecks[i].filter(card => card.charAt(1) === '\u2666').length
    );
    // count cards
    cards.push(weakDecks[i].length);
    // TODO keep going on primiera
    if (weakDecks[i].filter(card => card.charAt(0) === 7).length === 3) {
      whoHasPrimiera = Number(i);
    }
    // calc piccola
    if (
      weakDecks[i].includes('A♦️') &&
      weakDecks[i].includes('2♦️') &&
      weakDecks[i].includes('3♦️')
    ) {
      whoHasPiccola = Number(i);
      for (let j = 0; j < 3; j++) {
        if (weakDecks[i].includes(`${i + 4}♦️`)) piccolaValue = i + 1;
        else break;
      }

      piccolaValue += 3;
      points[i] += piccolaValue;
    }
    // calc grande
    if (
      weakDecks[i].includes('K♦️') &&
      weakDecks[i].includes('Q♦️') &&
      weakDecks[i].includes('J♦️')
    ) {
      whoHasGrande = Number(i);
      points[i] += 5;
    }
    // calc settebello
    if (weakDecks[i].includes('7\u2666')) {
      whoHasSeven = Number(i);
      points[i]++;
    }
  }

  // check which user has 'carte' and 'denari'
  if (!isThereMoreThanOneMax(diamonds)) whoHasDiamonds = indexOfMax(diamonds);
  if (!isThereMoreThanOneMax(cards)) whoHasCards = indexOfMax(cards);
  points[whoHasDiamonds]++;
  points[whoHasCards]++;
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
module.exports.calculatePoints = calculatePoints;

// FIXME fix groupnames sorting
const composeGroupName = usernames => {
  let groupName = '';
  usernames.forEach(user => (groupName += `&${user}`));
  return groupName.substr(1);
};
module.exports.composeGroupName = composeGroupName;
