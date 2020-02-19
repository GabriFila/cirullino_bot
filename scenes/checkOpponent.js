/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');
const { Extra } = require('telegraf');
const admin = require('../firebase');
const parseUsername = require('../helpers/general/parseUsername');

const { db } = admin;

const checkOpponents = new Scene('check-opponents');

checkOpponents.enter(ctx => {
  console.info('checking-opponent');
  ctx.reply('Ricevuto! Controllo...');

  const playersData = [
    {
      username: parseUsername(ctx.message.from.username), // need to compose group name later
      chatId: ctx.message.chat.id, // need to contact
      name: ctx.message.from.first_name, // need for better user experience during game
      hasAccepted: true // check when to start game
    }
  ];
  Promise.all(
    ctx.session.oppUsernames.map(username =>
      db
        .collection('users')
        .doc(username)
        .get()
        .then(doc => {
          if (!doc.exists) throw new Error(`no registered`);
          else {
            playersData.push({
              ...doc.data(),
              username: doc.id,
              hasAccepted: false
            });
          }
        })
    )
  )
    .then(() => {
      // hasAccepted contains the accepted status of each user in the pending game
      // order of hasAccepted is alphabetical on usernames
      // of course starter player must be set to true
      const pendingGame = {
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        usernames: [],
        hasAccepted: [],
        chatIds: [],
        names: []
      };

      playersData
        .sort((a, b) => a.username > b.username)
        .forEach(pData => {
          pendingGame.chatIds.push(pData.chatId);
          pendingGame.usernames.push(pData.username);
          pendingGame.names.push(pData.name);
          pendingGame.hasAccepted.push(pData.hasAccepted);
        });
      ctx.session.starter = ctx.message.from.first_name;
      ctx.session.pendingGame = pendingGame;
      ctx.scene.enter('call-opponents');
    })
    .catch(err => {
      if (err.message === 'no registered') {
        ctx.reply(
          'Mi dispiace ma alcuni dei tuoi avversari non hanno attivato cirullino su telegram. Inviagli questo link'
        );
        ctx.reply(` http://t.me/cirullino_bot `, Extra.webPreview(false));
      } else console.log(err.message.red);
    });
});

checkOpponents.leave(() => console.log('/exit on checkOpponents'));

module.exports = checkOpponents;
