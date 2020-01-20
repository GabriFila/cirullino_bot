/* eslint-disable no-plusplus */
/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');
const { sendToUser } = require('../helpers/common');
const numsToString = require('../helpers/game/numsToString');
const numToCard = require('../helpers/game/numToCard');

const startGame = new Scene('start-game');

startGame.enter(ctx => {
  const { gameDbRef } = ctx.session;
  const unsubscribe = gameDbRef.onSnapshot(doc => {
    const game = doc.data();
    const handsLenghts = [];

    // for (const [key, value] of Object.entries(game.hands))
    //   handsLenghts.push(value.length);

    for (let i = 0; i < Object.keys(game.hands).length; i++)
      handsLenghts.push(game.hands[i].length);

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
          : `In tavola:   ${numsToString(game.board)}\n`;
      // TODO implement bussare
      game.chatIds.forEach((chatId, i) => {
        const userMsg = `Hai:\n  scope: ${game.userStrongDeck[i].length}\n  mazzetto: ${game.userWeakDeck[i].length}`;
        sendToUser(chatId, message + userMsg).then(() => {
          if (i === activeUser)
            sendToUser(
              game.chatIds[activeUser],
              'Tocca a te',
              game.hands[activeUser].map(num => numToCard(num))
            );
          else sendToUser(chatId, `Tocca a ${game.names[activeUser]}`);
        });
      });
    }
  });
});

module.exports = startGame;
