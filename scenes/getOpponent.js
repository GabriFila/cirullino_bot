module.exports = getOpponent = ctx => {
  ctx.reply("Chi vuoi sfidare?");
  ctx.scene.enter("check-opponent");
};
