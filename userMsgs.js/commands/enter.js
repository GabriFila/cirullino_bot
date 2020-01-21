/* eslint-disable no-console */
const { db } = require('../../firebase');
const parseUsername = require('../../helpers/general/parseUsername');

module.exports = ctx => {
  console.info('/enter');

  // TODO reset all active games

  // check if there is a pending game with the username
  // if there is , it changes the corresponding state of the player and then if all the players are true the game starts
  const senderUsername = parseUsername(ctx.message.from.username);
  const pendingGameRef = db
    .collection('pendingGames')
    .where('usernames', 'array-contains', `${senderUsername}`);

  pendingGameRef.get().then(docs => {
    docs.forEach(doc => {
      const updatedPlayers = doc.data();

      updatedPlayers.hasAccepted[
        doc.data().usernames.indexOf(senderUsername)
      ] = true;

      if (updatedPlayers.hasAccepted.every(elm => elm === true))
        doc.ref.delete();

      ctx.session.updatedPlayers = updatedPlayers;
      ctx.scene.enter('activate-group');
    });
  });
};
