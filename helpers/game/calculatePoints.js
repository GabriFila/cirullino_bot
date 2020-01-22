const isThereMoreThanOneMax = require('../general/isThereMoreThanOneMax');
const indexOfMax = require('../general/indexOfMax');
const isDiamond = require('./isDiamond');

module.exports = (strongDecks, weakDecks, bonusPoints) => {
  const points = bonusPoints.map(() => 0);
  const diamonds = bonusPoints.map(() => 0);
  const cards = bonusPoints.map(() => 0);
  const primiera = bonusPoints.map(() => 0);
  let whoHasDiamonds = -1;
  let whoHasCards = -1;
  let whoHasPiccola = -1; // if someone hasthen it is the player index
  let whoHasPrimiera = -1; // if someone hasthen it is the player index
  let piccolaValue = 0;
  let whoHasGrande = -1; // if someone hasthen it is the player index
  let whoHasSeven = -1; // if someone hasthen it is the player index

  for (let usr = 0; usr < Object.keys(strongDecks).length; usr += 1) {
    // add #'scope' to points
    points[usr] = strongDecks[usr].length;
    // then pass strong cards into weak
    weakDecks[usr].push(...strongDecks[usr]);
    // count denari
    diamonds[usr] = weakDecks[usr].filter(numCard => isDiamond(numCard)).length;
    // count cards
    cards[usr] = weakDecks[usr].length;

    // calc primiera
    for (let k = 0; k < 4; k += 1) {
      const possPrimieraPoints = weakDecks[usr]
        .filter(
          numCard =>
            numCard === k * 10 + 5 ||
            numCard === k * 10 + 6 ||
            numCard === k * 10 + 7 ||
            numCard === k * 10 + 1
        )
        .sort((a, b) => b - a);
      if (possPrimieraPoints.length !== 0)
        if (possPrimieraPoints[0] === k * 10 + 1) primiera[usr] += 5.5;
        else primiera[usr] += possPrimieraPoints[0] - k * 10;
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
  if (whoHasDiamonds !== -1) points[whoHasDiamonds] += 1;
  if (!isThereMoreThanOneMax(cards)) whoHasCards = indexOfMax(cards);
  if (whoHasCards !== -1) points[whoHasCards] += 1;
  if (!isThereMoreThanOneMax(primiera)) whoHasPrimiera = indexOfMax(primiera);
  if (whoHasPrimiera !== -1) points[whoHasPrimiera] += 1;

  // add bonus points to points
  points.map((point, i) => point + bonusPoints[i]);

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
