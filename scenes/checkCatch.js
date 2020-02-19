/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');
const dispButtons = require('../helpers/general/dispButtons');
const cardToNum = require('../helpers/game/cardToNum');
const arrayInclude = require('../helpers/general/arrayInclude');
const numsToString = require('../helpers/game/numsToString');

const checkCatch = new Scene('check-catch');

const { cardRegEx } = require('../helpers/utils');

// take target catch from user and
checkCatch.hears(new RegExp(cardRegEx, 'g'), ctx => {
  console.log('checking catch');
  const userCatch = ctx.message.text.match(new RegExp(cardRegEx, 'g'));

  ctx.session.userCatch = userCatch.map(card => cardToNum(card));

  if (arrayInclude(ctx.session.userCatch, ctx.session.catches)) {
    ctx.scene.enter('share-move');
  } else {
    ctx.reply(
      '⚠️Mossa non valida, non puoi prendere questa combinazione di carte. Riprova',
      dispButtons(
        ctx.session.catches.map(elm => numsToString(elm)),
        1
      )
    );
    ctx.scene.enter('check-catch');
  }
});

checkCatch.leave(() => console.log('/exit on checkCatch'));

module.exports = checkCatch;
