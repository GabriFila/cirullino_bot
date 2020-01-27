/* eslint-disable no-console */
const { Markup } = require('telegraf');
const { db } = require('../../firebase');
const parseUsername = require('../../helpers/general/parseUsername');

module.exports = ctx => {
  db.collection('pendingGames')
    .where(
      'usernames',
      'array-contains',
      parseUsername(ctx.message.from.username)
    )
    .get()
    .then(response => {
      console.log('deleted pending games of user');
      const batch = db.batch();
      response.docs.forEach(doc => {
        const docRef = db.collection('pendingGames').doc(doc.id);
        batch.delete(docRef);
      });
      batch.commit().then(() => {
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
      });
    })
    .catch(err => console.err(err.message.red));
};
