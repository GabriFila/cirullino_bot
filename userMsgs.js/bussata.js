// check if in game and in turn
// set bussata to true

/* eslint-disable no-console */
const { db } = require('../firebase');
// const isBussata = require('../helpers/game/isBussata');
// const areLess9 = require('../helpers/game/areLess9');
// const are3EqualCards = require('../helpers/game/are3EqualCards');

module.exports = ctx => {
  // when bot receives a card it checks if the user has an active game, if so it checks if it is the active user, then processes the move e updates the other players
  console.info('bussata');
  const senderUsername = ctx.message.from.username.toLowerCase();
  // check if there is a active group with user in it

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
              ctx.session.game = game;
              ctx.session.gameDbRef = doc.ref;
              if (game.hands[activeUser].includes(7)) {
                ctx.scene.enter('ask-matta-value');
              }
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
