/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');
const admin = require('../firebase');
const { db } = require('../firebase');
const bot = require('../bot');

const callOpponent = new Scene('call-opponent');

callOpponent.enter(ctx => {
  console.info('calling-opponent');
  const { players } = ctx.session;

  // TODO check if opponent wants to play
  ctx.reply(`Contatto il tuo avversario`);

  ctx.session.opponents = players.filter(
    player => player.username !== ctx.message.from.username.toLowerCase()
  );

  // TODO add possibility to have multiple opponents -> multiple promises
  bot.telegram
    .sendMessage(
      ctx.session.opponents[0].chatId,
      `Sei stato invitato a giocare, se vuoi entare rispondimi /enter`
    )
    .then(() => {
      // hasAccepted contains the accepted status of each user in the pending game
      // order of hasAccepted is alphabetical on usernames
      const hasAccepted = players.map(() => false);
      // of course starter player must be set to true
      hasAccepted[
        players.findIndex(
          player => player.username === ctx.message.from.username.toLowerCase()
        )
      ] = true;
      // create a pending game with state pending and players
      db.collection('pendingGames').add({
        usernames: players.map(player => player.username),
        chatIds: players.map(player => player.chatId),
        names: players.map(player => player.first_name),
        hasAccepted,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      ctx.scene.leave();
    })
    .catch(err => {
      console.error(err);
      ctx.reply(`C'è stato un problema, contatta lo sviluppatore`);
    });
});

module.exports = callOpponent;
