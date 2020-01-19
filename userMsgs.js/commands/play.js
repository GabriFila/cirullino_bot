/* eslint-disable no-console */
const playHandler = ctx => {
  console.info('/newgame');
  ctx.reply('Chi vuoi sfidare?');
  ctx.scene.enter('check-opponent');
};

module.exports = playHandler;
