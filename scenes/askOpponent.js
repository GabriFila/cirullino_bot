const Scene = require("telegraf/scenes/base");

const askOpponent = new Scene("ask-opponent");

askOpponent.enter(ctx => {
  console.info("asking-opponent");
  ctx.reply("Chi vuoi sfidare?");
  ctx.scene.enter("check-opponent");
});

module.exports = askOpponent;
