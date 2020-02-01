/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');
const isBussata = require('../helpers/game/isBussata');
const areLess9 = require('../helpers/game/areLess9');
const are3EqualCards = require('../helpers/game/are3EqualCards');

const checkBussata = new Scene('check-bussata');

// take target catch from user and
checkBussata.enter(ctx => {
  const { game } = ctx.session;
  const { activeUser } = game;
  // TODO fix functions to implement a user chosen mattavalue instead pretend is best choice
  if (isBussata(game.hands[activeUser])) {
    if (game.isBussing[activeUser] === 0) {
      if (areLess9(game.hands[activeUser])) {
        game.isBussing[activeUser] = 1;
        game.bonusPoints[activeUser] += 3;
      }
      if (are3EqualCards(game.hands[activeUser])) {
        game.isBussing[activeUser] = 2;
        game.bonusPoints[activeUser] += 10;
      }
    }
    ctx.seesion.gameDbRef.set(game, { merge: true });
  } else ctx.reply(`Non puoi bussare ora`);
});

module.exports = checkBussata;
