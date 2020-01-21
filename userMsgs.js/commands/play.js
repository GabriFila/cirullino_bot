/* eslint-disable no-console */
const playHandler = ctx => {
  // TODO deactive all active game
  console.info('/newgame');
  ctx.reply(`Chi vuoi sfidare? Dimmi l'username`);
  ctx.scene.enter('check-opponent');
};

module.exports = playHandler;
