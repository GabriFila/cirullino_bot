// check if in game and in turn
// set bussata to true

/* eslint-disable no-console */
const { db } = require('../firebase');
const isBussata = require('../helpers/game/isBussata');

module.exports = ctx => {
  // when bot receives a card it checks if the user has an active game, if so it checks if it is the active user, then processes the move e updates the other players
  console.info('bussata');
  const senderUsername = ctx.message.from.username.toLowerCase();
  // check if there is a active group with user in it

  // TODO make one function to check if user is playing
  db.collection('groups')
    .where('isActive', '==', true)
    .where('usernames', 'array-contains', senderUsername)
    .get()
    .then(groups => {
      groups.forEach(group => {
        group
          .data()
          // get active game
          .activeGame.get()
          .then(doc => {
            if (doc.exists) {
              // check if group has an active game
              const game = doc.data();
              const { activeUser } = game;

              if (isBussata(game.hands[activeUser])) {
                // TODO add point only once
                game.isBussing[activeUser] = true;
                doc.ref.set(game, { merge: true });
              } else ctx.reply(`Non puoi bussare ora`);
            } else {
              ctx.reply(
                '⚠️Mi dispiace ma non stai giocando con nessuno al momento.\nPer iniziare usa /sfida'
              );
            }
          })
          .catch(err => console.log(err.red));
      });
    });
};
