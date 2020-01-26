/* eslint-disable no-plusplus */
/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');
const circularNext = require('../helpers/general/circularNext');
const sendToUser = require('../helpers/general/sendToUser');
const numToCard = require('../helpers/game/numToCard');
const numsToString = require('../helpers/game/numsToString');

const shareMove = new Scene('share-move');
// share move to other users
shareMove.enter(ctx => {
  console.log('sharing move');
  const { userCatch, usedNum, game } = ctx.session;
  let message = '';
  // check if calata
  const { activeUser } = game;
  const usedCard = numToCard(usedNum);

  if (userCatch.length === 0) {
    message = `calato ${usedCard}`;
    game.board.push(usedNum);
  } else {
    game.userWeakDeck[activeUser].push(...userCatch);
    game.board = game.board.filter(elm => userCatch.indexOf(elm) === -1);
    // udpate lastWhoTook
    game.lastWhoTook = activeUser;
    // check if 'scopa'
    if (game.board.length === 0) {
      message = `fatto scopa con ${usedCard}`;
      // if scopa add used card to strongdeck else to weakDeck
      game.userStrongDeck[activeUser].push(ctx.session.usedNum);
    } else {
      // not scopa
      message = `preso ${numsToString(userCatch)} con ${usedCard}`;
      game.userWeakDeck[activeUser].push(ctx.session.usedNum);
    }
  }

  // check if hands are empty

  let handFinishedMsg;
  if (game.chatIds.every((chatId, i) => game.hands[i].length === 0)) {
    if (game.deck.length !== 0) {
      // hand finished but game keeps going on
      console.info('empty hands'.green);
      // reset bussata for next hand
      game.isBussing = game.chatIds.map(() => false);
      for (let i = 0; i < Object.keys(game.hands).length; i++)
        game.hands[i] = game.deck.splice(0, 3);
      const handsLeft = game.deck.length / 6;
      handFinishedMsg = `\nMano terminata, ridiamo le carte!\n`;
      if (handsLeft !== 0) handFinishedMsg += `Mani restanti: ${handsLeft}`;
      else handFinishedMsg += `Ultima mano`;
    }
    // last move of game
    else if (game.board.length === 0) {
      // scopa doesn't count
      game.userWeakDeck[activeUser].push(
        ...game.userStrongDeck[activeUser].splice(
          game.userStrongDeck[activeUser].indexOf(usedNum),
          1
        )
      );
      message = `fatto scopa con ${usedCard} ma non conta perchè è l'ultima mano`;
    } else {
      // last hand and takes all
      game.userWeakDeck[game.lastWhoTook].push(...game.board);
      message += ` e ${
        game.names[game.lastWhoTook]
      } ha preso tutto perchè è l'ultimo che ha preso`;
    }
  }

  // share move to other players then update game in db
  Promise.all(
    game.chatIds.map((chatId, i) => {
      if (i !== activeUser)
        return sendToUser(
          chatId,
          `${ctx.message.from.first_name} ha ${message} ${handFinishedMsg ||
            ''}`
        );
      return sendToUser(chatId, `Hai ${message} ${handFinishedMsg || ''}`);
    })
  ).then(() => {
    // change activeUser
    // TODO add cloud function to handle progressive move id
    ctx.session.gameDbRef
      .collection('moves')
      .add({ usedNum, user: activeUser })
      .then(() => console.log('move inserted'));
    game.activeUser = circularNext(activeUser, game.chatIds);

    // update game
    ctx.session.gameDbRef
      .set(game)
      .then(() => console.info('game updated'.green))
      .catch(err => console.error(err));
  });
});

module.exports = shareMove;
