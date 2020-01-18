/* eslint-disable no-console */
const { db } = require('../firebase');

const cardHandler = ctx => {
  // stage.enter('show-moves');

  // TODO check if user is in game
  // TODO check is user can play, is it in turn
  // when bot receives a card it checks if the user has an active game, if so it checks if it is the active user, then processes the move e updates the other players
  console.info('reiceved card');
  // user message is a card
  // check if there is an active game
  const senderUsername = ctx.message.from.username.toLowerCase();
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
            // check if move is valid
            const game = doc.data();
            const { activeUser } = game;
            console.info('validating move');

            if (!game.hands[activeUser].includes(ctx.message.text))
              ctx.reply(`Hai giocato una carta che non hai in mano`);
            else {
              game.hands[activeUser].splice(
                game.hands[activeUser].indexOf(ctx.message.text),
                1
              ); // remove used card from player hand
              game.moves.unshift({
                user: activeUser,
                cardPlayed: ctx.message.text
              }); // start creating game move record
              console.info('analysing move');
              const usedCard = ctx.message.text;

              // show all possible move
              // get answe

              // gioca la carta
              // riceve in rispota le mosse possibili
              // il bot prende e dice ok tu fai questa
              ctx.session.game = game;
              ctx.session.usedCard = usedCard;
              ctx.session.gameDbRef = doc.ref;
              ctx.scene.enter('show-moves');
            }
          });
      });
    });
};

module.exports = cardHandler;
