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

const prepGame = (deck, chatIds, names) => {
  const shuffledDeck = deck.sort(() => Math.random() - 0.5);

  const game = {
    deck: shuffledDeck,
    hands: {},
    board: shuffledDeck.splice(0, 4),
    points: chatIds.map(() => 0),
    moves: [],
    userStrongDeck: {},
    userWeakDeck: {},
    activeUser: getRandomInt(0, chatIds.length),
    chatIds,
    names
  };

  chatIds.forEach((chat, i) => (game.hands[i] = shuffledDeck.splice(0, 3)));
  chatIds.forEach((chat, i) => (game.userStrongDeck[i] = []));
  chatIds.forEach((chat, i) => (game.userWeakDeck[i] = []));

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
  // TODO solve a monte with 3 same card in board
  const sortedBoard = game.board.sort();
  if (
    cardToValue(sortedBoard[0]) === cardToValue(sortedBoard[1]) &&
    cardToValue(sortedBoard[0]) === cardToValue(sortedBoard[2])
  ) {
    // if 3 equal cards
    // move of three equal cards from deck
    game.deck.push(...game.board.splice(0, 1));
    // take one diffferent card from deck in board
    game.board.push(
      ...game.deck.splice(
        game.deck.findIndex(card => cardToValue(card) !== 1),
        1
      )
    );
  }

  return game;
};

module.exports.prepGame = prepGame;

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
