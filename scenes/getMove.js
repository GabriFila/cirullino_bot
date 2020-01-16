/* eslint-disable no-plusplus */
/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');
const { circularNext, sendToUser } = require('../helpers/common');

const getMove = new Scene('get-move');

const arraysMatch = (arr1, arr2) => {
  // Check if the arrays are the same length
  if (arr1.length !== arr2.length) return false;

  // Check if all items exist and are in the same order
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }

  // Otherwise, return true
  return true;
};

// take target catch from user and
getMove.hears(/[A0123456789JQK][♥️♦♣♠]/g, ctx => {
  console.log('getting chosen move');
  const userCatch = ctx.message.text.match(/[A0123456789JQK][♥️♦♣♠]/g);

  console.log(ctx.session.catches);
  console.log(userCatch);
  ctx.session.userCatch = userCatch;

  // FIXME it doesn't work when make scopa
  // if (ctx.session.catches.some(elm => arraysMatch(elm, userCatch))) {
  //   // move catch from board to userWeakDeck
  //   ctx.session.userCatch = userCatch;
  // } else {
  //   ctx.reply(
  //     '⚠️Mossa non valida, non puoi prendere questa combinazione di carte. Riprova'
  //   );
  ctx.scene.enter('share-move');
  // }
});

module.exports = getMove;
