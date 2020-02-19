/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');
const { db } = require('../firebase');

const activateGroup = new Scene('activate-group');
const getGroupName = require('../helpers/general/getGroupName');

activateGroup.enter(async ctx => {
  console.info('activating group');
  const { usernames } = ctx.session.updatedPlayers;

  db.collection('groups')
    .where('usernames', 'array-contains-any', usernames)
    .get()
    .then(response => {
      const batch = db.batch();
      response.docs.forEach(doc => {
        const docRef = db.collection('groups').doc(doc.id);
        batch.update(docRef, { isActive: false, activeGame: '' });
      });
      batch.commit().then(() => {
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
    });
});

activateGroup.leave(() => console.log('/exit on activateGroup'));

module.exports = activateGroup;
