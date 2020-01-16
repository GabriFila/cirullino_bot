/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');

const shareGame = new Scene('share-game');

shareGame.enter(ctx => {
  const { activeUser } = game;
  userCatch.forEach(card =>
    game.userWeakDeck[activeUser].push(
      game.board.splice(game.board.indexOf(card), 1)[0]
    )
  );
  // if board is empty add used card to strongdeck else to weakDeck
  if (game.board.length === 0)
    game.userStrongDeck[activeUser].push(ctx.session.usedCard);
  else game.userWeakDeck[activeUser].push(ctx.session.usedCard);
  // share move to other users

  game.chatIds.forEach((chatId, i) => {
    if (i !== activeUser)
      sendToUser(chatId, `${ctx.message.from.first_name} ha ${messagge}`);
    else sendToUser(chatId, `Hai ${messagge}`);
  });

  // change activeUser
  game.activeUser = circularNext(activeUser, game.chatIds);
  // update game
});

module.exports = shareGame;
