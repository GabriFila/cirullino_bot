/* eslint-disable no-console */
const { db } = require('../firebase');
const cardToNum = require('../helpers/game/cardToNum');

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
                console.info('validating hand'.green);
                // check if user has used card in own hand
                const usedNum = cardToNum(ctx.message.text);

                if (!game.hands[activeUser].includes(usedNum))
                  ctx.reply(`⚠️Hai giocato una carta che non hai in mano!`);
                else {
                  // remove used card from user's hand
                  game.hands[activeUser].splice(
                    game.hands[activeUser].indexOf(usedNum),
                    1
                  ); // create new move record
                  game.moves.unshift({
                    user: activeUser,
                    cardPlayed: ctx.message.text
                  });
                  // pass to evaluate and show possible catches with chosen card
                  ctx.session.game = game;
                  ctx.session.usedNum = usedNum;
                  ctx.session.gameDbRef = doc.ref;
                  ctx.scene.enter('show-catches');
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
          .catch(err => console.log(err.red));
      });
    });
};

module.exports = cardHandler;
