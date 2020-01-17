/* eslint-disable no-plusplus */
/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');

const checkCatch = new Scene('check-catch');
// const { isCatchValid } = require('../helpers/game');

// take target catch from user and
checkCatch.hears(/[A0123456789JQK][♥️♦♣♠]/g, ctx => {
  console.log('checking catch');
  const userCatch = ctx.message.text.match(/[A0123456789JQK][♥️♦♣♠]/g);

  console.log(ctx.session.catches);
  console.log(userCatch);
  ctx.session.userCatch = userCatch;
  ctx.scene.enter('share-move');

  // FIXME it doesn't work when make scopa
  // if (isCatchValid(userCatch, ctx.session.catches)) {
  //   //if (ctx.session.catches.includes(userCatch)) {
  //   console.log('valid catch');
  //   // move catch from board to userWeakDeck
  //   ctx.session.userCatch = userCatch;
  //   ctx.scene.enter('share-move');
  // } else {
  //   console.log('invalid catch');
  //   ctx.reply(
  //     '⚠️Mossa non valida, non puoi prendere questa combinazione di carte. Riprova'
  //   );
  //   ctx.scene.enter('show-moves');
  // }
});

module.exports = checkCatch;
