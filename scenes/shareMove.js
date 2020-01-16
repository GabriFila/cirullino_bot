/* eslint-disable no-plusplus */
/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');
const { circularNext, sendToUser } = require('../helpers/common');
const { cardsToString } = require('../helpers/game');

const shareMove = new Scene('share-move');

// share move to other users
shareMove.enter(ctx => {
  const { userCatch, usedCard, game } = ctx.session;
  let message = '';
  // check if calta
  if (userCatch.length === 0) message = `calato ${usedCard}`;
  else {
    const { activeUser } = game;
    userCatch.forEach(card =>
      game.userWeakDeck[activeUser].push(
        game.board.splice(game.board.indexOf(card), 1)[0]
      )
    );
    // check if 'scopa'
    if (game.board.length === 0) {
      message = `fatto scopa con ${usedCard}`;
      // if scopa add used card to strongdeck else to weakDeck
      game.userStrongDeck[activeUser].push(ctx.session.usedCard);
    } else {
      // not scopa
      message = `preso ${cardsToString(userCatch)} con ${usedCard}`;
      game.userWeakDeck[activeUser].push(ctx.session.usedCard);
    }

    game.chatIds.forEach((chatId, i) => {
      if (i !== activeUser)
        sendToUser(chatId, `${ctx.message.from.first_name} ha ${message}`);
      else sendToUser(chatId, `Hai ${message}`);
    });

    // change activeUser
    game.activeUser = circularNext(activeUser, game.chatIds);

    // check if hands are empty
    const handsLenghts = [];

    for (const [key, value] of Object.entries(game.hands))
      handsLenghts.push(value.length);

    if (handsLenghts.every(length => length === 0)) {
      console.info('empty hands');
      for (let i = 0; i < Object.keys(game.hands).length; i++)
        game.hands[i] = game.deck.splice(0, 3);
    }
    // update game
    ctx.session.gameDbRef
      .set(game)
      .then(() => console.info('game updated'))
      .catch(err => console.error(err));
  }
});

module.exports = shareMove;
