/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');
const { Markup } = require('telegraf');
const { feasibleCatches, cardsToString } = require('../helpers/game');

const showMoves = new Scene('show-moves');

// show possible catches to user
showMoves.enter(ctx => {
  console.log('showing moves');
  const { game, usedCard } = ctx.session;
  const catches = feasibleCatches(game.board, usedCard);
  if (catches.length === 0) {
    ctx.session.userCatch = [];
    ctx.scene.enter('share-move');
  }
  ctx.reply(
    'Cosa vuoi prendere?',
    Markup.keyboard(catches.map(set => cardsToString(set)))
      .oneTime()
      .resize()
      .extra()
  );
  // pass possible catches to next scene for checking
  ctx.session.catches = catches;
  ctx.scene.enter('get-move');
});

module.exports = showMoves;
