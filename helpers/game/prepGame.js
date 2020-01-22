/* eslint-disable no-plusplus */
const getRandomInt = require('../general/getRandomInt');
const getValue = require('./getValue');
const { deck40 } = require('../utils.json');

module.exports = (chatIds, names, usernames) => {
  const shuffledDeck = deck40.sort(() => Math.random() - 0.5);

  const game = {
    deck: shuffledDeck,
    isBussing: chatIds.map(() => false),
    hands: {},
    board: shuffledDeck.splice(0, 4),
    points: chatIds.map(() => 0),
    bonusPoints: chatIds.map(() => 0),
    userStrongDeck: {},
    userWeakDeck: {},
    activeUser: getRandomInt(0, chatIds.length),
    chatIds,
    names,
    usernames
  };

  chatIds.forEach((chat, i) => {
    game.hands[i] = shuffledDeck.splice(0, 3);
  });
  chatIds.forEach((chat, i) => {
    game.userStrongDeck[i] = [];
  });
  chatIds.forEach((chat, i) => {
    game.userWeakDeck[i] = [];
  });

  // solve 'a monte' issues
  // if board has 2 or more aces then need to change them with two card inside the deck

  // check how many aces are in board
  const acesInBoard = game.board.filter(card => getValue(card) === 1).length;

  if (acesInBoard > 1) {
    for (let i = 0; i < acesInBoard - 1; i++) {
      // pick an ace from board and put it into the deck
      game.deck.push(
        ...game.board.splice(
          game.board.findIndex(card => getValue(card) === 1),
          1
        )
      );
      // pick a not ace from deck and place it into the baord
      game.board.push(
        ...game.deck.splice(
          game.deck.findIndex(card => getValue(card) !== 1),
          1
        )
      );
    }
  }
  const sortedBoard = game.board.sort();
  if (
    getValue(sortedBoard[0]) === getValue(sortedBoard[1]) &&
    getValue(sortedBoard[0]) === getValue(sortedBoard[2])
  ) {
    // if 3 equal cards
    // move of three equal cards from deck
    game.deck.push(...game.board.splice(0, 1));
    // take one diffferent card from deck in board
    game.board.push(
      ...game.deck.splice(
        game.deck.findIndex(card => getValue(card) !== 1),
        1
      )
    );
  }

  return game;
};
