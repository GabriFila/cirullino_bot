/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable no-return-assign */
/* eslint-disable comma-dangle */
const { getRandomInt, possibleCombs, indexOfMax } = require('./common');

const cardToValue = card => {
  let value = card.charAt(0);

  if (isNaN(Number(value))) {
    const values = {
      A: 1,
      J: 8,
      Q: 9,
      K: 10
    };
    value = values[value];
    return value;
  }
  value = Number(value);
  return value;
};

module.exports.cardToValue = cardToValue;

const buildGame = (deck, chatIds, names) => {
  const shuffledDeck = deck.sort(() => Math.random() - 0.5);

  const game = {
    deck: shuffledDeck,
    hands: {
      0: shuffledDeck.splice(0, 3),
      1: shuffledDeck.splice(0, 3)
    },
    board: shuffledDeck.splice(0, 4),
    points: 0,
    moves: [],
    userStrongDeck: {
      0: [],
      1: []
    },
    userWeakDeck: {
      0: [],
      1: []
    },
    activeUser: getRandomInt(0, 2),
    chatIds,
    names
  };

  // solve 'a monte' issues
  // if board has 2 or more aces then need to change them with two card inside the deck

  // check how many aces are in board
  const acesInBoard = game.board.filter(card => cardToValue(card) === 1).length;

  if (acesInBoard > 1) {
    for (let i = 0; i < acesInBoard - 1; i++) {
      // pick an ace from board and put it into the deck
      game.deck.push(
        ...game.board.splice(
          game.board.findIndex(card => cardToValue(card) === 1),
          1
        )
      );
      // pick a not ace from deck and place it into the baord
      game.board.push(
        ...game.deck.splice(
          game.deck.findIndex(card => cardToValue(card) !== 1),
          1
        )
      );
    }
  }

  return game;
};

module.exports.buildGame = buildGame;

const feasibleCatches = (board, usedCard) => {
  const catches = [];
  const usedCardValue = cardToValue(usedCard);
  const boardTotal = board
    .map(card => cardToValue(card))
    .reduce((acc, val) => acc + val, 0);
  // twoways to make 'scopa' split in two if statements
  if (usedCardValue === 1 && !board.some(card => card.charAt(0) === 'A'))
    catches.push(board);
  else if (boardTotal === usedCardValue || boardTotal + usedCardValue === 15)
    catches.push(board);
  const allBoardCombinations = possibleCombs(board);
  // take all possible board combinations that summed up + used card makes 15
  const combs15 = allBoardCombinations.filter(
    elm =>
      elm.reduce((acc, val) => (acc += cardToValue(val)), 0) + usedCardValue ===
      15
  );
  // take all board combinations that sumed up equal used card
  catches.push(...combs15);
  const combsUsedCard = allBoardCombinations.filter(
    elm =>
      elm.reduce((acc, val) => (acc += cardToValue(val)), 0) === usedCardValue
  );
  catches.push(...combsUsedCard);

  return catches;
};
module.exports.feasibleCatches = feasibleCatches;

const elaborateMove = (usedCard, board, strongDeck, weakDeck, cardsRemoved) => {
  // check if card is ace
  const usedCardValue = cardToValue(usedCard);

  // check if scopa with ace
  if (usedCardValue === 1 && !board.some(card => card.charAt(0) === 'A')) {
    strongDeck.push(usedCard);
    board.forEach(card => weakDeck.push(card));
    cardsRemoved.push([...board]);
    board.splice(0, board.length);
    return 'scopa';
  }
  // TODO make functions for same scopa
  // check if scopa with total of board equal to used card
  const boardTotal = board
    .map(card => cardToValue(card))
    .reduce((acc, val) => acc + val, 0);

  if (boardTotal === usedCardValue || boardTotal + usedCardValue === 15) {
    strongDeck.push(usedCard);
    board.forEach(card => weakDeck.push(card));
    cardsRemoved.push([...board]);
    board.splice(0, board.length);
    return 'scopa';
  }

  // check if 'presa da 15'

  // all possible combinations of board
  let allCombinations = possibleCombs([usedCard, ...board]);
  // take all the combinations that include the usedCard and of those the ones which sum up to 15
  const combs15 = allCombinations
    .filter(comb => comb.includes(usedCard))
    .filter(
      elm => elm.reduce((acc, val) => (acc += cardToValue(val)), 0) === 15
    );

  if (combs15.length > 0) {
    // there is a 15 combination
    // pick the first combination
    // TODO let user choose his own move
    const [firstComb15] = combs15;

    // put good combination of card to weak deck
    firstComb15.forEach(card => weakDeck.push(card));

    // remove used card from good combination
    firstComb15.splice(firstComb15.indexOf(usedCard), 1);

    cardsRemoved.push([...firstComb15]);

    // remove good combination from board
    firstComb15.forEach(card => board.splice(board.indexOf(card), 1));
    return 'presa con 15';
  }
  // take all the combinations that include the usedCard and of those the ones which sum up to 15
  allCombinations = possibleCombs([...board]);
  const combsUsedCard = allCombinations.filter(
    elm =>
      elm.reduce((acc, val) => (acc += cardToValue(val)), 0) === usedCardValue
  );

  if (combsUsedCard.length > 0) {
    // console.log("combinations: ", combinations);
    const [firstComb] = combsUsedCard;
    firstComb.forEach(card => weakDeck.push(card));
    weakDeck.push(usedCard);
    cardsRemoved.push([...firstComb]);
    firstComb.forEach(card => board.splice(board.indexOf(card), 1));
    return 'presa normale';
  }
  board.push(usedCard);
  return 'calata';
};

module.exports.elaborateMove = elaborateMove;

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
  for (const [key, value] of Object.entries(strongDecks)) {
    points.push(value.length);
    // then pass strong cards into weak
    weakDecks[key].push(...strongDecks[key]);
    // count denari
    diamonds.push(
      weakDecks[key].filter(card => card.charAt(1) === '\u2666').length
    );
    // count cards
    cards.push(weakDecks[key].length);
    // TODO keep going on primiera
    if (weakDecks[key].filter(card => card.charAt(0) === 7).length === 3) {
      whoHasPrimiera = Number(key);
    }
    // calc piccola
    if (
      weakDecks[key].includes('A♦️') &&
      weakDecks[key].includes('2♦️') &&
      weakDecks[key].includes('3♦️')
    ) {
      whoHasPiccola = Number(key);
      for (let i = 0; i < 3; i++) {
        if (weakDecks[key].includes(`${i + 4}♦️`)) piccolaValue = i + 1;
        else break;
      }
      piccolaValue += 3;
      points[key] += piccolaValue;
    }
    // calc grande
    if (
      weakDecks[key].includes('K♦️') &&
      weakDecks[key].includes('Q♦️') &&
      weakDecks[key].includes('J♦️')
    ) {
      whoHasGrande = Number(key);
      points[key] += 5;
    }
    // calc settebello
    if (weakDecks[key].includes('7\u2666')) {
      whoHasSeven = Number(key);
      points[key]++;
    }
  }
  // TODO check equality case in denari and carte
  whoHasDiamonds = indexOfMax(diamonds);
  points[whoHasDiamonds]++;
  whoHasCards = indexOfMax(cards);
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

const composeGroupName = usernames => {
  let groupName = '';
  usernames.forEach(user => (groupName += `&${user}`));
  return groupName.substr(1);
};
module.exports.composeGroupName = composeGroupName;
const cardsToString = cards => cards.toString().replace(/,/gi, '   ');

module.exports.cardsToString = cardsToString;

const myInclude = (arr, elm) => {
  let answer = false;
  arr.forEach(card => {
    if (card == elm) answer = true;
  });
  return answer;
};

const isCatchValid = (target, all) => {
  let answer = false;
  all.forEach(poss => {
    // check if target

    // if (
    //   poss.filter(card => target.some(trgCard => trgCard === card)).length ===
    //   target.length
    // )

    if (poss.filter(card => myInclude(target, card)).length === target.length)
      answer = true;
  });

  return answer;
};

module.exports.isCatchValid = isCatchValid;
