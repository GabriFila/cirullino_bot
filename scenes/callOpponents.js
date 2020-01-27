/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');
const admin = require('../firebase');
const parseUsername = require('../helpers/general/parseUsername');
const sendToUser = require('../helpers/general/sendToUser');

const { db } = admin;

const callOpponents = new Scene('call-opponents');

callOpponents.enter(ctx => {
  console.info('calling-opponents');

  ctx.reply(`Contatto il tuo avversario`);

  // take chatIds of players to contact
  const opChatIds = ctx.session.pendingGame.chatIds.filter(
    (chatId, i) =>
      i !==
      ctx.session.pendingGame.usernames.indexOf(
        parseUsername(ctx.message.from.username)
      )
  );

  // ask players to join
  Promise.all(
    opChatIds.map(chatId =>
      sendToUser(
        chatId,
        `Sei stato invitato a giocare da ${ctx.session.starter}, se vuoi entare rispondimi /entra`
      )
    )
  )
    .then(() => {
      // create a pending game with state pending and players
      db.collection('pendingGames').add(ctx.session.pendingGame);
      ctx.scene.leave();
    })
    .catch(err => console.log(err.message.red));
});

module.exports = callOpponents;
