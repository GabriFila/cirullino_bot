/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');
const isBussata = require('../helpers/game/isBussata');
const areLess9 = require('../helpers/game/areLess9');
const are3EqualCards = require('../helpers/game/are3EqualCards');

const checkBussata = new Scene('check-bussata');

checkBussata.enter(ctx => {
  const { game } = ctx.session;
  const { activeUser, mattaValue } = game;
  if (isBussata(game.hands[activeUser], mattaValue)) {
    if (game.isBussing[activeUser] === 0) {
      if (areLess9(game.hands[activeUser], mattaValue)) {
        game.isBussing[activeUser] += 1;
        game.bonusPoints[activeUser] += 3;
      }
      if (are3EqualCards(game.hands[activeUser], mattaValue)) {
        game.isBussing[activeUser] += 2;
        game.bonusPoints[activeUser] += 10;
      }
    }
    ctx.session.gameDbRef.set(game, { merge: true });
  } else ctx.reply(`Non puoi bussare ora`);
});

checkBussata.leave(() => console.log('/exit on checkBussata'));

module.exports = checkBussata;
