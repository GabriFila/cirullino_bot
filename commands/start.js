const db = require("../main.js").db;

module.exports = ctx => {
  console.log("/start");
  ctx.reply("Arrivo! Aspetta ancora un attimo");
  const newUserRef = db.collection("users").doc(`${ctx.message.chat.username.toLowerCase()}`);

  newUserRef
    .get()
    .then(doc => {
      if (!doc.exists) {
        newUserRef.set({
          chatId: ctx.message.chat.id,
          first_name: ctx.message.chat.first_name,
          wins: 0,
          losses: 0
        });
        ctx.reply("Benvenuto! 🎉 \nSei pronto a giocare un cirullino con i tuoi amici? 🃏 \nDimmi come vuoi procedere!");
      } else ctx.reply(`Bentornato ${ctx.message.chat.first_name}🎉 \nDimmi come vuoi procedere!`);
    })
    .catch(err => console.error(err));
};
