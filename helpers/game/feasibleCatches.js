const getValue = require('./getValue');
const possibleCombs = require('../general/possibleCombs');
const getBoardTotal = require('./getBoardTotal');

module.exports = (board, usedNum, mattaValue) => {
  const catches = [];
  const usedCardValue = getValue(usedNum, mattaValue);

  const boardTotal = getBoardTotal(board, mattaValue);
  // twoways to make 'scopa' split in two if statements
  if (
    usedCardValue === 1 &&
    !board.some(card => getValue(card, mattaValue) === 1)
  )
    catches.push(board);
  else if (boardTotal === usedCardValue || boardTotal + usedCardValue === 15)
    catches.push(board);
  const allBoardCombinations = possibleCombs(board);
  // take all possible board combinations that summed up + used card makes 15
  const combs15 = allBoardCombinations.filter(
    elm =>
      elm.reduce((acc, val) => (acc += getValue(val, mattaValue)), 0) +
        usedCardValue ===
      15
  );
  // take all board combinations that sumed up equal used card
  catches.push(...combs15);
  const combsUsedCard = allBoardCombinations.filter(
    elm =>
      elm.reduce((acc, val) => (acc += getValue(val, mattaValue)), 0) ===
      usedCardValue
  );
  catches.push(...combsUsedCard);

  return catches;
};
