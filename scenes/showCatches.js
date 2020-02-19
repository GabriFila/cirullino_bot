/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');
const dispButtons = require('../helpers/general/dispButtons');
const feasibleCatches = require('../helpers/game/feasibleCatches');
const numsToString = require('../helpers/game/numsToString');

const showCatches = new Scene('show-catches');

// show possible catches to user
showCatches.enter(ctx => {
  console.log('showing catches'.green);
  const { game, usedNum } = ctx.session;
  console.log('usedNum: ', usedNum);
  const { mattaValue } = game;
  let catches = feasibleCatches(game.board, usedNum, mattaValue);
  // remove duplicates caused by 'presa con 15' and 'presa con somma'
  catches = catches.filter((elm, i) => catches.indexOf(elm) === i);
  console.log('catches: ', catches);

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
      dispButtons(
        catches.map(set => numsToString(set)),
        1
      )
    );
    // pass possible catches to next scene for checking
    ctx.session.catches = catches;
    ctx.scene.enter('check-catch');
  }
});

showCatches.leave(() => console.log('/exit on showCatches'));

module.exports = showCatches;
