/* eslint-disable no-console */
const { db } = require('../../firebase');
const { helpMessage } = require('../../helpers/utils.json');

module.exports = ctx => {
  console.log('/start');
  if ('username' in ctx.message.from) {
    ctx.reply(`Sei pronto a giocare un cirullino con i tuoi amici? 🃏`);
    const newUserRef = db
      .collection('users')
      .doc(`${ctx.message.from.username.toLowerCase()}`);

    newUserRef
      .get()
      .then(doc => {
        if (!doc.exists) {
          newUserRef.set({
            chatId: ctx.message.chat.id,
            name: ctx.message.chat.first_name,
            wins: 0,
            losses: 0
          });
        } else {
          newUserRef.set(
            {
              chatId: ctx.message.chat.id,
              name: ctx.message.chat.first_name
            },
            { merge: true }
          );
        }
        ctx.reply(helpMessage);
      })
      .catch(err => console.error(err));
  } else
    ctx.reply(
      'Grazie per voler giocare! Manca ancora una cosa però, devi impostare il tuo username su telegram, altrimenti gli altri non potranno giocare con te!\nQuando hai fatto, rimandami il comando /start e potrai giocare'
    );
};
