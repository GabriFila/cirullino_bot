/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');

const { db } = require('../firebase');
const admin = require('../firebase');
const prepGame = require('../helpers/game/prepGame');

const buildGame = new Scene('build-game');

buildGame.enter(ctx => {
  console.info('buildfing game');
  const { updatedPlayers } = ctx.session;
  // db.collection('decks')
  //   .doc('40cards')
  //   .get()
  //   .then(deckDbRef => {
  const newGame = prepGame(
    // deckDbRef.data().deck,
    updatedPlayers.chatIds,
    updatedPlayers.names
  );
  const { groupDbRef } = ctx.session;
  groupDbRef
    .collection('groupGames')
    .add({
      ...newGame,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    })
    .then(gameDbRef => {
      groupDbRef.set({ activeGame: gameDbRef }, { merge: true });
      console.info('game created in db');
      ctx.session.gameDbRef = gameDbRef;
      ctx.scene.enter('start-game');
      // start game by making listener on updates on game object and pushing them to all connected users
    });
  // })
  // .catch(err => {
  //   console.error(err);
  // });
});

module.exports = buildGame;
