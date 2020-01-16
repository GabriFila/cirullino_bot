/* eslint-disable no-console */
const playHandler = ctx => {
  console.info('/newgame');
  ctx.scene.enter('ask-opponent');
};

module.exports = playHandler;
