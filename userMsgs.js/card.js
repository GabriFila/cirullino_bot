/* eslint-disable no-console */
const { db } = require('../firebase');
const { circularNext, sendToUser } = require('../helpers/common');
const { elaborateMove } = require('../helpers/game');

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
    .where('usernames', 'array-contains', senderUsername)
    // TODO select only active group
    .get()
    .then(groups =>
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

              // const gameResult = elaborateMove(
              //   usedCard,
              //   game.board,
              //   game.userStrongDeck[activeUser],
              //   game.userWeakDeck[activeUser],
              //   cardsRemoved
              // );
              // let messagge = '';
              // switch (gameResult) {
              //   case 'scopa':
              //     messagge += `fatto scopa con ${usedCard}`;
              //     break;
              //   case 'presa con 15':
              //   case 'presa normale':
              //     messagge += `preso ${cardsRemoved.map(
              //       card => `${card} `
              //     )} con ${usedCard}`;
              //     break;
              //   case 'calata':
              //     messagge += `calato ${usedCard}`;
              //     break;
              //   default:
              //     break;
              // }
              // game.chatIds.forEach((chatId, i) => {
              //   if (i !== activeUser)
              //     sendToUser(
              //       chatId,
              //       `${ctx.message.from.first_name} ha ${messagge}`
              //     );
              //   else sendToUser(chatId, `Hai ${messagge}`);
              // });
              // game.moves[0].type = gameResult;
              // game.activeUser = circularNext(activeUser, game.chatIds);

              // // check if hands are empty
              // const handsLenghts = [];

              // for (const [key, value] of Object.entries(game.hands))
              //   handsLenghts.push(value.length);

              // if (handsLenghts.every(length => length == 0)) {
              //   console.info('empty hands');
              //   for (let i = 0; i < Object.keys(game.hands).length; i++)
              //     game.hands[i] = game.deck.splice(0, 3);
              // }
              // // TODO if last hand place board in last taken
              // // update game state
              // doc.ref
              //   .set(game)
              //   .then(() => console.info('game updated'))
              //   .catch(err => console.error(err));
            }
          });
      })
    );
};

module.exports = cardHandler;
