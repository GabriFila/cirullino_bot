/* eslint-disable no-plusplus */
/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');
const sendToUser = require('../helpers/general/sendToUser');
const numsToString = require('../helpers/game/numsToString');
const numToCard = require('../helpers/game/numToCard');
const isBussata = require('../helpers/game/isBussata');

const startGame = new Scene('start-game');

startGame.enter(ctx => {
  const { gameDbRef } = ctx.session;
  const unsubscribe = gameDbRef.onSnapshot(doc => {
    const game = doc.data();
    // const handsLenghts = [];

    // for (let i = 0; i < Object.keys(game.hands).length; i++)
    //   handsLenghts.push(game.hands[i].length);

    if (
      game.chatIds.every((chatId, i) => game.hands[i].length === 0) &&
      game.deck.length === 0
    ) {
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
        let userDecksMsg = `Hai:\n  scope: ${game.userStrongDeck[i].length}\n  mazzetto: ${game.userWeakDeck[i].length}\n`;
        if (game.bonusPoints[i] !== 0)
          userDecksMsg += `Punti bonus: ${game.bonusPoints[i]}\n`;

        const handButtons = game.hands[activeUser].map(num => numToCard(num));

        if (isBussata(game.hands[i])) handButtons.push('Bussare');

        let bussataMsg = ``;

        game.isBussing.forEach((state, j) => {
          if (state)
            bussataMsg += `${
              game.names[j]
              // TODO communicate type of bussata
            } ha bussato, le sue carte:\n${numsToString(game.hands[j])}\n`;
        });

        sendToUser(chatId, message + userDecksMsg + bussataMsg).then(() => {
          if (i === activeUser)
            sendToUser(game.chatIds[activeUser], `Tocca a te`, handButtons, 3);
          else sendToUser(chatId, `Tocca a ${game.names[activeUser]}`);
        });
      });
    }
  });
});

module.exports = startGame;
