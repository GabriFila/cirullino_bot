/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');
const { sendToUser } = require('../helpers/common');
const { cardsToString } = require('../helpers/gameHelpers');

const startGame = new Scene('start-game');

startGame.enter(ctx => {
  const { gameDbRef } = ctx.session;
  const unsubscribe = gameDbRef.onSnapshot(doc => {
    const game = doc.data();
    const handsLenghts = [];

    for (const [key, value] of Object.entries(game.hands))
      handsLenghts.push(value.length);

    if (handsLenghts.every(length => length === 0) && game.deck.length === 0) {
      unsubscribe();
      ctx.session.game = game;
      ctx.scene.enter('end-game');
    } else {
      console.info('ask-move');
      const { activeUser } = game;
      const message =
        game.board.length === 0
          ? 'Tavola vuota\n'
          : `In tavola:   ${cardsToString(game.board)}\n`;
      // TODO implement bussare
      game.chatIds.forEach((chatId, i) => {
        const userMsg = `Hai:\n  scope: ${game.userStrongDeck[i].length}\n  mazzetto: ${game.userWeakDeck[i].length}`;
        sendToUser(chatId, message + userMsg).then(() => {
          if (i === activeUser)
            sendToUser(
              game.chatIds[activeUser],
              'Tocca a te',
              game.hands[activeUser]
            );
          else sendToUser(chatId, `Tocca a ${game.names[activeUser]}`);
        });
      });
    }
  });
});

module.exports = startGame;
