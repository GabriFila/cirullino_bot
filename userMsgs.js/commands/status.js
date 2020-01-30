/* eslint-disable no-console */
const { db } = require('../../firebase');
const parseUsername = require('../../helpers/general/parseUsername');

module.exports = ctx => {
  db.collection('users')
    .doc(parseUsername(ctx.message.from.username))
    .get()
    .then(doc => {
      if (doc.exists) {
        const { name, wins, losses } = doc.data();
        ctx.reply(
          `Ciao ${name}\nAd oggi hai giocato ${wins +
            losses} partite, di cui:\n${wins} ${
            wins > 1 ? 'vittorie' : 'vittoria'
          }\n${losses} ${losses > 1 ? 'sconfitte' : 'sconfitta'}`
        );
      } else {
        ctx.reply('Mi dispiace ma non hai ancora giocato!');
      }
    });
};
