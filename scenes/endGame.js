/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');

const { calculatePoints } = require('../helpers/game');
const { sendToUser } = require('../helpers/common');

const endGame = new Scene('end-game');

endGame.enter(ctx => {
  console.log('game ending');
  const { game, gameDbRef, groupDbRef } = ctx.session;
  const results = calculatePoints(game.userStrongDeck, game.userWeakDeck);
  console.log('strong', game.userStrongDeck);
  console.log('weak', game.userWeakDeck);
  console.log(results);
  // Hai ottenuto in totale x punti
  // mazzo: denari,settebello,carte,primiera
  // alta
  // piccola fino al x

  game.chatIds.forEach((chatId, i) =>
    sendToUser(
      chatId,
      `Il gioco è terminato!\nHai ottenuto in totale ${
        results.points[i]
      } punti\nDi mazzo: ${results.whoHasDiamonds === i ? 'denari,' : ''} ${
        results.whoHasCards === i ? 'carte,' : ''
      } ${results.whoHasSeven === i ? 'sette bello,' : ''} ${
        results.whoHasPrimiera === i ? 'primiera' : ''
      }\n${results.whoHasGrande === i ? 'grande' : ''}\n${
        results.whoHasPiccola === i
          ? `piccola fino al ${results.piccolaValue}`
          : ''
      }`
    )
  );
  // update points in db
  game.points = results.points;
  gameDbRef.set({ game }, { merge: true });
  groupDbRef.set({ isActive: false, activeGame: null }, { merge: true });

  // calculate points
  // send points to users
  console.log('game ended');
});

module.exports = endGame;
