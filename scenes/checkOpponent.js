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

    // hasAccepted contains the accepted status of each user in the pending game
    // order of hasAccepted is alphabetical on usernames
    // of course starter player must be set to true
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

      ctx.session.pendingGame = pendingGame;
      ctx.scene.enter('call-opponents');
      /*

      get an object for each opponent
      then sort them
      then map them to pending game

      then send to all except the one with the user equal to the sender

      create new pending game 
      {
        chatIds, [002,23402305]
        usernames: [gabrifila, ritagari],
        hasAccepted: [true, false],
        names: [Gabriele, Margherita]
      }
       when all accept the object transforms in game
      */
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

module.exports = checkOpponents;
