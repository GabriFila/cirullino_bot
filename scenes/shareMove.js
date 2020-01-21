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
  // check if calata
  const { activeUser } = game;
  const usedCard = numToCard(usedNum);

  console.log(Array.isArray(userCatch));
  if (userCatch.length === 0) {
    message = `calato ${usedCard}`;
    game.board.push(usedNum);
  } else {
    // move card in user catch from board to weak deck
    // userCatch.forEach(numCard => {
    //   const tempIdx = game.board.indexOf(numCard);
    //   console.log(tempIdx);
    //   game.userWeakDeck[activeUser].push(
    //     ...game.board.splice(game.board.indexOf(numCard), 1)
    //   );
    // });

    // userCatch.forEach(numCard => {
    //   const tempIdx = game.board.indexOf(numCard);
    //   console.log(tempIdx);
    //   game.board.splice(game.board.indexOf(numCard), 1);
    // });
    game.userWeakDeck[activeUser].push(...userCatch);
    game.board.forEach(elm => console.log(userCatch.indexOf(elm)));
    game.board = game.board.filter(elm => userCatch.indexOf(elm) === -1);
    // trying filtering
    // la board è uguale alla board con solo gli le

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
  const handsLenghts = [];

  game.chatIds.forEach((chat, i) => {
    handsLenghts.push(game.hands[i].length);
  });
  let handFinishedMsg;
  if (handsLenghts.every(length => length === 0)) {
    if (game.deck.length !== 0) {
      // hand finished but game keeps going on
      console.info('empty hands'.green);
      for (let i = 0; i < Object.keys(game.hands).length; i++)
        game.hands[i] = game.deck.splice(0, 3);
      handFinishedMsg = '\nMano terminata, ridiamo le carte!';
      // game.chatIds.forEach(chat => {
      //   // TODO tell how many more hands are left
      //   sendToUser(chat, 'Mano terminata, ridiamo le carte!');
      // });
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
