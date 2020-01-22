/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');

const calculatePoints = require('../helpers/game/calculatePoints');
const sendToUser = require('../helpers/general/sendToUser');
const indexOfMax = require('../helpers/general/indexOfMax');
const admin = require('../firebase');

const { db } = admin;

const endGame = new Scene('end-game');

endGame.enter(ctx => {
  console.log('game ending');
  const { game, gameDbRef, groupDbRef } = ctx.session;
  const results = calculatePoints(
    game.userStrongDeck,
    game.userWeakDeck,
    game.bonusPoints
  );

  // send points to users
  let message = `Il gioco è terminato!\n`;

  game.chatIds.forEach((chatId, i) => {
    // compose message with points
    message += `${game.names[i]} ha ottenuto in totale ${results.points[i]} punti\n`;
    message += `Di mazzo:`;
    message += ` ${results.whoHasDiamonds === i ? 'denari,' : ''}`;
    message += ` ${results.whoHasCards === i ? 'carte,' : ''}`;
    message += ` ${results.whoHasSeven === i ? 'sette bello,' : ''}`;
    message += ` ${results.whoHasPrimiera === i ? 'primiera' : ''}\n`;
    message += `${results.whoHasGrande === i ? 'grande\n' : ''} `;
    message += `${
      results.whoHasPiccola === i
        ? `piccola fino al ${results.piccolaValue}\n`
        : ''
    }`;
    message += '\n';
  });

  const winnerIdx = indexOfMax(results.points);

  message += `${game.names[winnerIdx]} ha vinto`;

  Promise.all(game.chatIds.map(chatId => sendToUser(chatId, message))).then(
    () => {
      game.points = results.points;
      gameDbRef.set(game, { merge: true });
      groupDbRef.set({ isActive: false, activeGame: null }, { merge: true });

      // calculate points

      game.usernames.forEach((username, i) => {
        if (i === winnerIdx)
          db.collection('users')
            .doc(username)
            .set(
              { wins: admin.firestore.FieldValue.increment(1) },
              { merge: true }
            );
        else
          db.collection('users')
            .doc(username)
            .set(
              { losses: admin.firestore.FieldValue.increment(1) },
              { merge: true }
            );
      });
      console.log('game ended');
    }
  );
});

module.exports = endGame;
