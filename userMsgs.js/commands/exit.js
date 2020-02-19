/* eslint-disable no-console */
const { db } = require('../../firebase');
const parseUsername = require('../../helpers/general/parseUsername');
const sendToUser = require('../../helpers/general/sendToUser');

module.exports = ctx => {
  console.log('/exit');
  ctx.scene.leave();
  ctx.reply('Sei uscito!');

  const exitUsername = parseUsername(ctx.message.from.username);
  // find the game where user is active
  db.collection('groups')
    .where('usernames', 'array-contains', exitUsername)
    .where('activeGame', '>', '')
    .get()
    .then(gropus => {
      gropus.forEach(group => {
        const { activeGame, usernames } = group.data();
        // delete the game
        group.ref
          .collection('games')
          .doc(activeGame)
          .delete();
        // set active game group to null
        group.ref.set({ activeGame: '' }, { merge: true });
        // inform other users in game that one exited
        usernames
          .filter(username => username !== exitUsername)
          .forEach(username =>
            db
              .collection('users')
              .doc(username)
              .get()
              .then(userDoc =>
                sendToUser(
                  // U+1F628
                  userDoc.data().chatId,
                  `${exitUsername} è uscito dal gioco il gioco. Il gioco è stato annullato, mi dispiace ${String.fromCodePoint(
                    0x1f628
                  )} `
                )
              )
          );
      });
    })
    .catch(err => console.error(err.message.red));
};
