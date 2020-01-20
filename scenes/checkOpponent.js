/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');
const { Extra } = require('telegraf');
const { db } = require('../firebase');

const checkOpponent = new Scene('check-opponent');
// TODO support asking of more then 1 opponent
checkOpponent.on('text', ctx => {
  console.info('checking-opponent');
  ctx.reply('Ricevuto! Controllo...');
  // TODO remove possible @ from username
  const opponentRef = db
    .collection('users')
    .doc(`${ctx.message.text.toLowerCase()}`);
  opponentRef
    .get()
    .then(opponentDoc => {
      if (opponentDoc.exists) {
        db.collection('users')
          .doc(`${ctx.message.from.username.toLowerCase()}`)
          .get()
          .then(startPlayerDoc => {
            // prepare players obj sorted by player username
            const startPlayer = {
              ...startPlayerDoc.data(),
              username: ctx.message.from.username.toLowerCase()
            };
            ctx.session.players = [
              { ...opponentDoc.data(), username: opponentRef.id },
              startPlayer
            ].sort((a, b) => a.username > b.username);
            ctx.scene.enter('call-opponent');
          });
      } else {
        ctx.reply(
          `@${ctx.message.text} non si è connesso a cirullino, introltragli questo link`,
          Extra.webPreview(false)
        );
        ctx.reply(` http://t.me/cirullino_bot `, Extra.webPreview(false));
        ctx.scene.leave();
      }
    })
    .catch(err => console.error(err));
});

module.exports = checkOpponent;
