const areLess9 = require('./areLess9');
const are3EqualCards = require('./are3EqualCards');

module.exports = (hand, mattaValue) => {
  return (
    hand.length === 3 &&
    (areLess9(hand, mattaValue) ||
      // if all 3 equals
      are3EqualCards(hand, mattaValue))
    // show only on first step of new hand
  );
};
