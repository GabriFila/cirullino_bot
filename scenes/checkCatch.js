/* eslint-disable no-plusplus */
/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');
const cardToNum = require('../helpers/game/cardToNum');

const checkCatch = new Scene('check-catch');

const { cardRegEx } = require('../helpers/utils.json');

// const { isCatchValid } = require('../helpers/game');

// take target catch from user and
checkCatch.hears(new RegExp(cardRegEx, 'g'), ctx => {
  console.log('checking catch');
  const userCatch = ctx.message.text.match(new RegExp(cardRegEx, 'g'));

  ctx.session.userCatch = userCatch.map(card => cardToNum(card));
  ctx.scene.enter('share-move');

  // FIXME check user catch

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
