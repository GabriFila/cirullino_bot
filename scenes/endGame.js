/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');

const calculatePoints = require('../helpers/game/calculatePoints');
const sendToUser = require('../helpers/general/sendToUser');

const endGame = new Scene('end-game');

endGame.enter(ctx => {
  console.log('game ending');
  const { game, gameDbRef, groupDbRef } = ctx.session;
  const results = calculatePoints(game.userStrongDeck, game.userWeakDeck);

  // TODO make same message for all user where are all points
  // send points to users
  game.chatIds.forEach((chatId, i) => {
    // compose message with points
    let message = `Il gioco è terminato!\n`;
    message += `Hai ottenuto in totale ${results.points[i]} punti\n`;
    message += `Di mazzo:`;
    message += ` ${results.whoHasDiamonds === i ? 'denari,' : ''}`;
    message += ` ${results.whoHasCards === i ? 'carte,' : ''}`;
    message += ` ${results.whoHasSeven === i ? 'sette bello,' : ''}`;
    message += ` ${results.whoHasPrimiera === i ? 'primiera' : ''}\n`;
    message += `${results.whoHasGrande === i ? 'grande' : ''}\n `;
    message += `${
      results.whoHasPiccola === i
        ? `piccola fino al ${results.piccolaValue}`
        : ''
    }`;
    sendToUser(chatId, message);
  });
  // update points in db
  game.points = results.points;
  gameDbRef.set(game, { merge: true });
  groupDbRef.set({ isActive: false, activeGame: null }, { merge: true });

  // calculate points

  // TODO udpate wins and losses of user

  console.log('game ended');
});

module.exports = endGame;
