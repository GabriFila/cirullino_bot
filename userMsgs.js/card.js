/* eslint-disable no-console */
const { db } = require('../firebase');

const cardHandler = ctx => {
  // stage.enter('show-moves');

  // when bot receives a card it checks if the user has an active game, if so it checks if it is the active user, then processes the move e updates the other players
  console.info('reiceved card');
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
          .activeGame.get()
          .then(doc => {
            if (doc.exists) {
              // check if group has an active game
              const game = doc.data();
              const { activeUser } = game;
              if (game.chatIds[activeUser] === ctx.message.chat.id) {
                console.info('validating hand');

                if (!game.hands[activeUser].includes(ctx.message.text))
                  ctx.reply(`⚠️Hai giocato una carta che non hai in mano!`);
                else {
                  game.hands[activeUser].splice(
                    game.hands[activeUser].indexOf(ctx.message.text),
                    1
                  ); // remove used card from player hand
                  game.moves.unshift({
                    user: activeUser,
                    cardPlayed: ctx.message.text
                  }); // start creating game move record
                  const usedCard = ctx.message.text;
                  // pass to evaluate and show possible moves with chosen card
                  ctx.session.game = game;
                  ctx.session.usedCard = usedCard;
                  ctx.session.gameDbRef = doc.ref;
                  ctx.scene.enter('show-moves');
                  console.log('turn ok');
                }
              } else {
                ctx.reply('⚠️Non è il tuo turno!');
              }
            } else {
              ctx.reply(
                '⚠️Mi dispiace ma non stai giocando con nessuno al momento.\nPer iniziare usa /sfida'
              );
            }
          })
          .catch(err => console.log(err));
      });
    });
};

module.exports = cardHandler;
