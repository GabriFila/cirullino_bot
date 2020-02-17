/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');

const admin = require('../firebase');
const prepGame = require('../helpers/game/prepGame');
const getBoardTotal = require('../helpers/game/getBoardTotal');
const circularBefore = require('../helpers/general/circularBefore');
const sendToUser = require('../helpers/general/sendToUser');

const buildGame = new Scene('build-game');

buildGame.enter(ctx => {
  console.info('building game');
  const { updatedPlayers } = ctx.session;

  const game = prepGame(
    updatedPlayers.chatIds,
    updatedPlayers.names,
    updatedPlayers.usernames
  );

  const { activeUser } = game;
  let boardStartMessage = '';

  // first step of first hand of game
  console.log('checking for points inside board');
  const boardTotal = getBoardTotal(game.board);
  const cardGiver = circularBefore(activeUser, game.chatIds);

  // TODO fix message to user for points of board when starting
  boardStartMessage = `${game.names[cardGiver]} da le carte!\n${game.names[activeUser]} inizia!\n`;
  if (boardTotal === 30)
    for (let i = 0; i < 2; i += 1) {
      boardStartMessage += `${game.names[cardGiver]} ha già 2 scope perchè in tavola c'era 30\n\n`;
      // move 2 cards of board in user strong deck
      game.userStrongDeck[cardGiver].push(...game.board.splice(0, 1));
      // move 2 cards of board in user weak deck
      game.userWeakDeck[cardGiver].push(...game.board.splice(0, 1));
    }
  else if (boardTotal === 15) {
    boardStartMessage += `${game.names[cardGiver]} ha già 1 scopa perchè in tavola c'era 15\n\n`;
    // move 3 cards of board in user weak deck
    for (let i = 0; i < 3; i += 1)
      game.userWeakDeck[cardGiver].push(...game.board.splice(0, 1));
    // move 1 card of board in user weak deck
    game.userStrongDeck[cardGiver].push(...game.board.splice(0, 1));
  }

  Promise.all(
    game.chatIds.map(chatId => sendToUser(chatId, boardStartMessage))
  ).then(() => {
    const { groupDbRef } = ctx.session;
    groupDbRef
      .collection('games')
      .add({
        ...game,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      })
      .then(gameDbRef => {
        groupDbRef.set({ activeGame: gameDbRef.id }, { merge: true });
        console.info('game created in db');
        ctx.session.gameDbRef = gameDbRef;
        ctx.scene.enter('start-game');
        // start game by making listener on updates on game object and pushing them to all connected users
      })
      .catch(err => {
        console.error(err);
      });
  });
});

module.exports = buildGame;
