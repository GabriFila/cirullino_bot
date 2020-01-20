/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');
const { Markup } = require('telegraf');
const feasibleCatches = require('../helpers/game/feasibleCatches');
const numsToString = require('../helpers/game/numsToString');

const showCatches = new Scene('show-catches');

// show possible catches to user
showCatches.enter(ctx => {
  console.log('showing catches'.green);
  const { game, usedNum } = ctx.session;
  let catches = feasibleCatches(game.board, usedNum);
  // remove duplicates caused by 'presa con 15' and 'presa con somma'
  catches = catches.filter((elm, i) => catches.indexOf(elm) === i);

  if (catches.length === 0) {
    // if length is equal to 0 => 'calata' => no need to check user's choice
    ctx.session.userCatch = [];
    ctx.scene.enter('share-move');
  } else if (catches.length === 1) {
    // if length is equal to 1 then there is only one choice, hence no need to check user's choice
    [ctx.session.userCatch] = catches;
    ctx.scene.enter('share-move');
  } else {
    // ask user right intention
    ctx.reply(
      'Cosa vuoi prendere?',
      Markup.keyboard(catches.map(set => numsToString(set)))
        .oneTime()
        .resize()
        .extra()
    );
    // pass possible catches to next scene for checking
    ctx.session.catches = catches;
    ctx.scene.enter('check-catch');
  }
});

module.exports = showCatches;
