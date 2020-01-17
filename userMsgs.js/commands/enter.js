/* eslint-disable no-console */
const { db } = require('../../firebase');
// helper

// game helpers

const enterHandler = ctx => {
  console.info('/enter');
  // check if there is a pending game with the username
  // if there is , it changes the corresponding state of the player and then if all the players are true the game starts
  const senderUsername = ctx.message.from.username.toLowerCase();
  const pendingGameRef = db
    .collection('pendingGames')
    .where('usernames', 'array-contains', `${senderUsername}`);

  pendingGameRef.get().then(querySnapshot => {
    querySnapshot.forEach(pendingGameDbRef => {
      const updatedPlayers = pendingGameDbRef.data();

      updatedPlayers.hasAccepted[
        pendingGameDbRef.data().usernames.indexOf(senderUsername)
      ] = true;

      if (updatedPlayers.hasAccepted.every(elm => elm === true))
        pendingGameDbRef.ref.delete();

      ctx.session.updatedPlayers = updatedPlayers;
      ctx.scene.enter('activate-group');
    });
  });
};

module.exports = enterHandler;
