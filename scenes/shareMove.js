/* eslint-disable no-plusplus */
/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');
const { circularNext, sendToUser } = require('../helpers/common');
const numToCard = require('../helpers/game/numToCard');
const numsToString = require('../helpers/game/numsToString');

const shareMove = new Scene('share-move');
// share move to other users
shareMove.enter(ctx => {
  console.log('sharing move');
  const { userCatch, usedNum, game } = ctx.session;
  let message = '';
  // check if calta
  const { activeUser } = game;
  const usedCard = numToCard(usedNum);
  if (userCatch.length === 0) {
    message = `calato ${usedCard}`;
    game.board.push(usedNum);
    game.moves[0].type = 'calata';
  } else {
    // move card from board to weak deck
    userCatch.forEach(card => {
      game.userWeakDeck[activeUser].push(
        ...game.board.splice(game.board.indexOf(card), 1)
      );
    });
    // check if 'scopa'
    if (game.board.length === 0) {
      game.moves[0].type = 'scopa';
      message = `fatto scopa con ${usedCard}`;
      // if scopa add used card to strongdeck else to weakDeck
      game.userStrongDeck[activeUser].push(ctx.session.usedNum);
    } else {
      // not scopa
      game.moves[0].type = 'presa';
      message = `preso ${numsToString(userCatch)} con ${usedCard}`;
      game.userWeakDeck[activeUser].push(ctx.session.usedNum);
    }
  }
  Promise.all(
    game.chatIds.map((chatId, i) => {
      if (i !== activeUser)
        return sendToUser(
          chatId,
          `${ctx.message.from.first_name} ha ${message}`
        );
      return sendToUser(chatId, `Hai ${message}`);
    })
  ).then(() => {
    // change activeUser

    game.activeUser = circularNext(activeUser, game.chatIds);

    // check if hands are empty
    const handsLenghts = [];

    game.chatIds.forEach((chat, i) => {
      handsLenghts.push(game.hands[i].length);
    });

    if (handsLenghts.every(length => length === 0)) {
      if (game.deck.length !== 0) {
        // hand finished but game keeps going on
        console.info('empty hands');
        for (let i = 0; i < Object.keys(game.hands).length; i++)
          game.hands[i] = game.deck.splice(0, 3);
        game.chatIds.forEach(chat => {
          // TODO tell how many more hands are left
          sendToUser(chat, 'Mano terminata, ridiamo le carte!');
        });
      }
      // else {
      //   // last hand
      //   // if so check who made the last move different from 'calata'
      //   const lastMoveType = game.move[0].type;
      //   if (lastMoveType === 'scopa') {
      //     // move strongCard to weak deck and inform users
      //     game.userWeakDeck[activeUser].push(
      //       ...game.userStrongDeck[activeUser].splice(
      //         game.userStrongDeck.length - 1,
      //         1
      //       )
      //     );
      //   } else if (lastMoveType === 'presa') {
      //     game.userWeakDeck[activeUser].push(...game.board);
      //   } else {
      //     const lastUserNoCalata = game.moves.find(
      //       move => move.type !== 'calata'
      //     ).user;
      //     game.userWeakDeck[lastUserNoCalata].push(...game.board);
      //   }
      // }
    }

    // TODO implement last move
    // check if it is last move

    // update game
    ctx.session.gameDbRef
      .set(game)
      .then(() => console.info('game updated'))
      .catch(err => console.error(err));
  });
});

module.exports = shareMove;
