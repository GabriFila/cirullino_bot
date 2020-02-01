/* eslint-disable no-console */

const { db } = require('../../firebase');
const dispButtons = require('../../helpers/general/dispButtons');
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
          dispButtons(['1', '2', '3'])
        );
        // ctx.reply(`Chi vuoi sfidare? Dimmi l'username`);
        ctx.scene.enter('count-opponents');
      });
    })
    .catch(err => console.err(err.message.red));
};
