/* eslint-disable no-console */
const { Markup } = require('telegraf');

const playHandler = ctx => {
  // TODO deactive all active game
  console.info('/newgame');
  ctx.reply(
    'Con quante persone vuoi giocare? ',
    Markup.keyboard(['1', '2', '3'], { columns: 3 })
      .oneTime()
      .resize()
      .extra()
  );
  // ctx.reply(`Chi vuoi sfidare? Dimmi l'username`);
  ctx.scene.enter('count-opponents');
};

module.exports = playHandler;
