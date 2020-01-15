const Scene = require("telegraf/scenes/base");
const { db } = require("../firebase");

const checkOpponent = new Scene("check-opponent");
const { Extra } = require("telegraf");

checkOpponent.on("text", ctx => {
  console.info("checking-opponent");
  ctx.reply("Ricevuto! Controllo...");
  const opponentRef = db.collection("users").doc(`${ctx.message.text.toLowerCase()}`);
  opponentRef
    .get()
    .then(opponentDoc => {
      if (opponentDoc.exists) {
        db.collection("users")
          .doc(`${ctx.message.from.username.toLowerCase()}`)
          .get()
          .then(startPlayerDoc => {
            //prepare players obj sorted by player username
            let startPlayer = { ...startPlayerDoc.data(), username: ctx.message.from.username.toLowerCase() };
            ctx.session.players = [{ ...opponentDoc.data(), username: opponentRef.id }, startPlayer].sort(
              (a, b) => a.username > b.username
            );
            ctx.scene.enter("call-opponent");
          });
      } else {
        ctx.reply(`@${ctx.message.text} non si è connesso a cirullino, introltragli questo link`, Extra.webPreview(false));
        ctx.reply(` http://t.me/cirullino_bot `, Extra.webPreview(false));
        ctx.scene.leave();
      }
    })
    .catch(err => console.error(err));
});

module.exports = checkOpponent;