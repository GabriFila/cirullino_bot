/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');
const { db } = require('../firebase');

const activateGroup = new Scene('activate-group');
const getGroupName = require('../helpers/general/getGroupName');

activateGroup.enter(ctx => {
  console.info('activating group');
  const { usernames } = ctx.session.updatedPlayers;
  db.collection('groups')
    .doc(getGroupName(usernames))
    .get()
    .then(async group => {
      if (!group.exists) {
        // create new group
        group.ref.set({ usernames, isActive: true });
      } // change group to active
      else group.ref.set({ isActive: true }, { merge: true });
      ctx.session.groupDbRef = group.ref;
      ctx.scene.enter('build-game');
    });
});

module.exports = activateGroup;
