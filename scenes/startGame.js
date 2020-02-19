/* eslint-disable no-plusplus */
/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');
const sendToUser = require('../helpers/general/sendToUser');
const numsToString = require('../helpers/game/numsToString');
const numToCard = require('../helpers/game/numToCard');
const isBussata = require('../helpers/game/isBussata');
const bussedType = require('../helpers/game/bussedType');

const startGame = new Scene('start-game');

startGame.enter(ctx => {
  const { gameDbRef } = ctx.session;
  const unsubscribe = gameDbRef.onSnapshot(doc => {
    const game = doc.data();

    if (
      game.chatIds.every((chatId, i) => game.hands[i].length === 0) &&
      game.deck.length === 0
    ) {
      unsubscribe();
      ctx.session.game = game;
      ctx.scene.enter('end-game');
    } else {
      console.info('ask-move');

      const { activeUser, mattaValue } = game;

      const message =
        game.board.length === 0
          ? 'Tavola vuota\n'
          : `In tavola:   ${numsToString(game.board, mattaValue)}\n`;
      game.chatIds.forEach((chatId, i) => {
        let userDecksMsg = `Hai:\n  scope: ${game.userStrongDeck[i].length}\n  mazzetto: ${game.userWeakDeck[i].length}\n\n`;
        if (game.bonusPoints[i] !== 0)
          userDecksMsg += `Punti bonus: ${game.bonusPoints[i]}\n`;

        const handButtons = game.hands[i].map(num =>
          numToCard(num, mattaValue)
        );

        if (game.isBussing[i] === 0 && isBussata(game.hands[i], mattaValue))
          handButtons.push('Bussare');

        let bussataMsg = ``;

        game.isBussing.forEach((bussType, j) => {
          if (j !== i)
            if (bussType !== 0)
              bussataMsg += `${
                game.names[j]
                // tell type of bussata
              } ha bussato da ${bussedType(
                bussType
              )}, le sue carte:\n${numsToString(game.hands[j], mattaValue)}\n`;
        });
        sendToUser(chatId, message + userDecksMsg + bussataMsg).then(() => {
          if (i === activeUser)
            sendToUser(
              game.chatIds[activeUser],
              `Tocca a te\n`,
              handButtons,
              3
            );
          else
            sendToUser(
              chatId,
              `Tocca a ${game.names[activeUser]}\n`,
              handButtons,
              3
            );
        });
      });
    }
  });
});

startGame.leave(() => console.log('/exit on startGame'));

module.exports = startGame;
